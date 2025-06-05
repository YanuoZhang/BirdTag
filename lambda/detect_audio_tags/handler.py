import os
import json
import boto3
import traceback
from datetime import datetime
from urllib.parse import unquote_plus
import soundfile as sf
from config_class import AnalyzerConfig
from birdnet_analyzer.analyze.core import analyze

os.environ["NUMBA_DISABLE_CACHE"] = "1"

sns_client = boto3.client('sns')
s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get("TABLE_NAME", "BirdTagMedia")
dynamo_table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    try:
        print("Received S3 trigger event:", json.dumps(event))

        record = event['Records'][0]
        bucket = record['s3']['bucket']['name']
        key = unquote_plus(record['s3']['object']['key'])
        file_id = os.path.basename(key)
        local_audio_path = f"/tmp/{file_id}"

        print(f"Downloading {key} from bucket {bucket}")
        s3_client.download_file(bucket, key, local_audio_path)
        print("Downloaded file size:", os.path.getsize(local_audio_path))

        # Load audio metadata
        info = sf.info(local_audio_path)
        print(info)

        cfg = AnalyzerConfig()
        cfg.inputPath = local_audio_path
        os.makedirs(cfg.outputPath, exist_ok=True)

        print("Running BirdNET analyzer...")
        analyze(
            input=cfg.inputPath,
            output=cfg.outputPath,
            min_conf=cfg.minConfidence,
            lat=cfg.lat,
            lon=cfg.lon,
            week=cfg.week,
            sensitivity=cfg.sensitivity,
            rtype="csv",
            combine_results=True
        )

        result_file = os.path.join(cfg.outputPath, "BirdNET_CombinedTable.csv")
        if not os.path.exists(result_file):
            raise FileNotFoundError("BirdNET CSV output not found.")

        # Parse result
        tags = {}
        with open(result_file, "r") as f:
            for line in f.readlines()[1:]:
                parts = line.strip().split(",")
                if len(parts) < 6:
                    continue
                common_name = parts[3]
                tags[common_name] = tags.get(common_name, 0) + 1

        # Flatten tag list
        tag_list = list(tags.keys())
        audio_s3_url = f"https://{bucket}.s3.amazonaws.com/{key}"
        user_email = "yzha1113@student.monash.edu"
        item = {
            "file_id": file_id,
            "user_email": user_email,
            "user_id": "anonymous",  # TODO change to real id from token
            "filename": key,
            "file_type": "audio",
            "upload_time": datetime.utcnow().isoformat(),
            "s3_url": audio_s3_url,
            "thumbnail_url": "",  # only for image
            "tags": tags,
            "tags_flat": tag_list
        }

        print("Saving result to DynamoDB:", json.dumps(item, indent=2))
        dynamo_table.put_item(Item=item)

        # Send notification via SNS
        send_email_notification(user_email, file_id)
        print("SNS notification sent to topic.")
        return {
            "statusCode": 200,
            "body": json.dumps(item)
        }

    except Exception as e:
        print("Exception occurred:")
        traceback.print_exc()
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }


def send_email_notification(email: str, file_id: str):
    topic_arn = os.environ["SNS_TOPIC_ARN"]
    
    # Step 1: Dynamically subscribe the user's email
    subscribe_response = sns_client.subscribe(
        TopicArn=topic_arn,
        Protocol='email',
        Endpoint=email,
        ReturnSubscriptionArn=True
    )
    print("Subscribe response:", subscribe_response)

    # Step 2: Send notification (won't work unless user confirms)
    message = f"Hi! Your audio file '{file_id}' has been analyzed and is now available. Please check the results."
    subject = "BirdTag Analysis Completed"

    # Note: this will only deliver if user already confirmed the subscription
    response = sns_client.publish(
        TopicArn=topic_arn,
        Message=message,
        Subject=subject
    )
    print("SNS publish response:", response)
