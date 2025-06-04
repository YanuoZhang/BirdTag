import os
import boto3
import json
import traceback
from urllib.parse import unquote_plus
from config_class import AnalyzerConfig
from birdnet_analyzer.analyze.core import analyze

# Initialize boto3 S3 client
s3_client = boto3.client('s3')

def lambda_handler(event, context):
    try:
        # Log the incoming S3 event
        print("Received S3 trigger event:", json.dumps(event))

        # Extract S3 bucket name and object key from the event
        record = event['Records'][0]
        bucket = record['s3']['bucket']['name']
        key = unquote_plus(record['s3']['object']['key'])
        file_id = os.path.basename(key)
        local_audio_path = f"/tmp/{file_id}"

        # Download the uploaded audio file to /tmp/ directory
        print(f"Downloading {key} from bucket {bucket}")
        s3_client.download_file(bucket, key, local_audio_path)
        print("Downloaded file size:", os.path.getsize(local_audio_path))
        print("File size on Lambda:", os.path.getsize(local_audio_path))

        # Set up the analyzer configuration
        cfg = AnalyzerConfig()
        cfg.inputPath = local_audio_path
        os.makedirs(cfg.outputPath, exist_ok=True)

        # Run BirdNET analysis on the downloaded audio file
        print("Running BirdNET analysis...")
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

        # Check for the CSV output file
        result_file = os.path.join(cfg.outputPath, "BirdNET_CombinedTable.csv")
        if not os.path.exists(result_file):
            raise FileNotFoundError("BirdNET CSV output not found.")

        # Read and parse the result lines
        with open(result_file, "r") as f:
            lines = f.readlines()

        # Extract common bird names and count their occurrences

        tags = {}
        for line in lines[1:]:  # Skip the header row
            parts = line.strip().split(",")
            if len(parts) < 6:
                continue
            common_name = parts[3]
            tags[common_name] = tags.get(common_name, 0) + 1

        # Create the response object
        audio_s3_url = f"https://{bucket}.s3.amazonaws.com/{key}"

        result = {
            "file_id": file_id,
            "media_type": "audio",
            "audio_s3_url": audio_s3_url,
            "tags": tags,
            "timestamp": int(time.time())
        }

        print("Recognition result:")
        print(json.dumps(result, indent=2))

        # Return the response
        return {
            "statusCode": 200,
            "body": json.dumps(result)
        }

    except Exception as e:
        # Handle any unexpected error
        print("Exception occurred:")
        traceback.print_exc()
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }


# # import os
# # import base64
# # import json
# # import csv
# # import uuid
# # import time
# # import boto3

# # from config_class import AnalyzerConfig
# # from birdnet_analyzer.analyze.core import analyze

# # def lambda_handler(event, context):
# #     # Initialize BirdNET analyzer configuration
# #     cfg = AnalyzerConfig()

# #     # Create output directory if it doesn't exist
# #     os.makedirs(cfg.outputPath, exist_ok=True)

# #     # Get the base64-encoded audio string from the event
# #     audio_b64 = event.get("audio_base64")
# #     if not audio_b64:
# #         return {
# #             "statusCode": 400,
# #             "body": json.dumps({"error": "Missing 'audio_base64' field"})
# #         }

# #     # Decode and save audio
# #     with open(cfg.inputPath, "wb") as f:
# #         f.write(base64.b64decode(audio_b64))

# #     # Run BirdNET analysis
# #     analyze(
# #         input=cfg.inputPath,
# #         output=cfg.outputPath,
# #         min_conf=cfg.minConfidence,
# #         lat=cfg.lat,
# #         lon=cfg.lon,
# #         week=cfg.week,
# #         sensitivity=cfg.sensitivity,
# #         rtype="csv"
# #     )

# #     # Locate the output CSV
# #     result_file = os.path.join(cfg.outputPath, "BirdNET_CombinedTable.csv")
# #     if not os.path.exists(result_file):
# #         return {
# #             "statusCode": 500,
# #             "body": json.dumps({"error": "Analysis failed, result file not found."})
# #         }

# #     with open(result_file, "r") as f:
# #             lines = f.readlines()
# #     # Read and store to DynamoDB
# #     # lines = []
# #     # dynamodb = boto3.resource("dynamodb")
# #     # table = dynamodb.Table("BirdDetectionResults")  # Replace with your actual table

# #     # with open(result_file, "r") as f:
# #     #     reader = csv.DictReader(f)
# #     #     for row in reader:
# #     #         item = {
# #     #             "id": str(uuid.uuid4()),
# #     #             "start_time": float(row["Start (s)"]),
# #     #             "end_time": float(row["End (s)"]),
# #     #             "scientific_name": row["Scientific name"],
# #     #             "common_name": row["Common name"],
# #     #             "confidence": float(row["Confidence"]),
# #     #             "original_audio_s3": "s3://your-bucket/path/to/audio.wav",  # TODO: replace later
# #     #             "timestamp": int(time.time())
# #     #         }
# #     #         table.put_item(Item=item)
# #     #         lines.append(item)  # Add for return if needed

# #     return {
# #         "statusCode": 200,
# #         "body": json.dumps({"result_lines": lines})
# #     }


# import os
# import base64
# import json
# import traceback
# from config_class import AnalyzerConfig
# from birdnet_analyzer.analyze.core import analyze

# def lambda_handler(event, context):
#     try:
#         print(" Initializing BirdNET analyzer config...")
#         cfg = AnalyzerConfig()
#         print(f" Output path: {cfg.outputPath}")

#         os.makedirs(cfg.outputPath, exist_ok=True)

#         print("Extracting base64 audio from event...")
#         audio_b64 = event.get("audio_base64")
#         if not audio_b64:
#             return {
#                 "statusCode": 400,
#                 "body": json.dumps({"error": "Missing 'audio_base64' field"})
#             }

#         print(f"Decoding base64 audio into: {cfg.inputPath}")
#         with open(cfg.inputPath, "wb") as f:
#             f.write(base64.b64decode(audio_b64))

#         print("Running BirdNET analyzer...")
#         analyze(
#             input=cfg.inputPath,
#             output=cfg.outputPath,
#             min_conf=cfg.minConfidence,
#             lat=cfg.lat,
#             lon=cfg.lon,
#             week=cfg.week,
#             sensitivity=cfg.sensitivity,
#             rtype="csv",
#             combine_results=True
#         )

#         result_file = os.path.join(cfg.outputPath, "BirdNET_CombinedTable.csv")
#         print(f"Checking for result file: {result_file}")
#         if not os.path.exists(result_file):
#             return {
#                 "statusCode": 500,
#                 "body": json.dumps({"error": "Analysis failed: CSV result file not found."})
#             }

#         print("Reading result lines...")
#         with open(result_file, "r") as f:
#             lines = f.readlines()

#         print("Analysis completed successfully.")
#         return {
#             "statusCode": 200,
#             "body": json.dumps({"result_lines": lines})
#         }

#     except Exception as e:
#         print("Exception occurred during processing:")
#         traceback.print_exc()
#         return {
#             "statusCode": 500,
#             "body": json.dumps({"error": str(e)})
#         }
