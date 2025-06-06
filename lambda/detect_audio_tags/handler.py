import os
import json
import boto3
import base64
import logging
import tempfile
from datetime import datetime
from urllib.parse import unquote_plus
import soundfile as sf
from config_class import AnalyzerConfig
from birdnet_analyzer.analyze.core import analyze

# Disable Numba cache to avoid /tmp size overflow in Lambda
os.environ["NUMBA_DISABLE_CACHE"] = "1"

# Initialize logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
sns_client = boto3.client('sns')
s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get("TABLE_NAME", "BirdTagMedia")
dynamo_table = dynamodb.Table(table_name)

# Constants for file types
FILE_TYPE_AUDIO = "audio"
FILE_TYPE_IMAGE = "image"
FILE_TYPE_VIDEO = "video"

def lambda_handler(event, context):
    try:
        # Determine if it's an S3 trigger or API call
        if 'Records' in event:
            return handle_s3_trigger(event)
        else:
            return handle_api_audio(event)
    except Exception as e:
        logger.exception("Unexpected error")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }

# Handle S3-triggered audio file analysis and storage
def handle_s3_trigger(event):
    logger.info("Received S3 trigger event: %s", json.dumps(event))
    record = event['Records'][0]
    bucket = record['s3']['bucket']['name']
    key = unquote_plus(record['s3']['object']['key'])
    file_id = os.path.basename(key)
    local_audio_path = f"/tmp/{file_id}"

    logger.info(f"Downloading {key} from bucket {bucket}")
    s3_client.download_file(bucket, key, local_audio_path)

    # Analyze audio using BirdNET
    tags, tag_list = run_birdnet_analysis(local_audio_path)

    audio_s3_url = f"https://{bucket}.s3.amazonaws.com/{key}"
    user_email = "yzha1113@student.monash.edu"
    item = {
        "file_id": file_id,
        "user_email": user_email,
        "user_id": "anonymous",
        "filename": key,
        "file_type": FILE_TYPE_AUDIO,
        "upload_time": datetime.utcnow().isoformat(),
        "s3_url": audio_s3_url,
        "thumbnail_url": "",
        "tags": tags,
        "tags_flat": tag_list
    }

    logger.info("Saving result to DynamoDB: %s", json.dumps(item, indent=2))
    dynamo_table.put_item(Item=item)

    send_email_notification(user_email, file_id)

    return {
        "statusCode": 200,
        "body": json.dumps(item)
    }

# Handle API base64-uploaded audio query (temporary file, no storage)
# Handle API base64-uploaded audio query (temporary file, no storage)
def handle_api_audio(event):
    logger.info("Received API audio query request.")
    
    # Step 1: Parse request body
    body = json.loads(event['body'])
    content_b64 = body.get("content")

    if not content_b64:
        raise ValueError("Missing 'content' field in request body")

    if len(content_b64) > 10_000_000:
        raise ValueError("Audio content too large.")

    # Step 2: Decode base64 and write to temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(base64.b64decode(content_b64))
        temp_audio_path = tmp.name

    # Step 3: Analyze the audio using BirdNET model
    tags, tag_list = run_birdnet_analysis(temp_audio_path)
    logger.info("Extracted tags and counts: %s", tags)

    # Step 4: If no tags detected, return empty match result
    if not tags:
        return {
            "statusCode": 200,
            "body": json.dumps({
                "query_tags": tags,
                "match_count": 0,
                "links": []
            })
        }

    # Step 5: Scan DynamoDB and find matching files with all query tags
    matching_links = []
    scan_resp = dynamo_table.scan(
        ProjectionExpression="file_id, tags, s3_url, thumbnail_url, file_type"
    )

    for item in scan_resp.get("Items", []):
        item_tags = item.get("tags", {})
        file_type = item.get("file_type")

        # Only match if all tags are present and counts are >= query counts
        if all(tag in item_tags and item_tags[tag] >= tags[tag] for tag in tags):
            if file_type in [FILE_TYPE_AUDIO, FILE_TYPE_VIDEO]:
                matching_links.append(item.get("s3_url"))
            elif file_type == FILE_TYPE_IMAGE and item.get("thumbnail_url"):
                matching_links.append(item.get("thumbnail_url"))

    # Step 6: Return matching media links
    return {
        "statusCode": 200,
        "body": json.dumps({
            "query_tags": tags,
            "match_count": len(matching_links),
            "links": matching_links
        })
    }


# Shared BirdNET audio analysis function
def run_birdnet_analysis(audio_path):
    cfg = AnalyzerConfig()
    cfg.inputPath = audio_path
    os.makedirs(cfg.outputPath, exist_ok=True)

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

    tags = {}
    with open(result_file, "r") as f:
        for line in f.readlines()[1:]:
            parts = line.strip().split(",")
            if len(parts) < 6:
                continue
            common_name = parts[3]
            tags[common_name] = tags.get(common_name, 0) + 1

    return tags, list(tags.keys())

# Send SNS notification to user's email
def send_email_notification(email: str, file_id: str):
    topic_arn = os.environ["SNS_TOPIC_ARN"]

    sns_client.subscribe(
        TopicArn=topic_arn,
        Protocol='email',
        Endpoint=email,
        ReturnSubscriptionArn=True
    )

    sns_client.publish(
        TopicArn=topic_arn,
        Message=f"Hi! Your audio file '{file_id}' has been analyzed and is now available.",
        Subject="BirdTag Analysis Completed"
    )
