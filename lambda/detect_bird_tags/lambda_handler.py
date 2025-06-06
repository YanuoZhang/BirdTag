# lambda_handler.py

import json
import os
import boto3
import mimetypes
import uuid
import base64
import tempfile
from handler import run_image_detection, run_video_detection
from ddb_utils import query_matching_files  # Added: new function to query DynamoDB for matching files

s3_client = boto3.client('s3')


def lambda_handler(event, context):
    print("[INFO] Lambda triggered by event:")
    print(json.dumps(event))

    # Handle S3 trigger events
    if 'Records' in event and event['Records'][0].get('eventSource') == 'aws:s3':
        return handle_s3_trigger(event)
    
    # Handle direct media analysis via API Gateway
    elif 'body' in event:
        return handle_api_temp_media(event)  # Added: handle temp file query

    # Unsupported event
    else:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Unsupported event type"})
        }


def handle_s3_trigger(event):
    record = event['Records'][0]
    bucket = record['s3']['bucket']['name']
    key = record['s3']['object']['key']
    print(f"[INFO] Bucket: {bucket}, Key: {key}")

    filename = os.path.basename(key)
    tmp_input_path = f"/tmp/{uuid.uuid4()}_{filename}"
    tmp_output_path = f"/tmp/output_{filename}"

    print(f"[INFO] Downloading from S3 to: {tmp_input_path}")
    s3_client.download_file(bucket, key, tmp_input_path)

    mime_type, _ = mimetypes.guess_type(key)
    print(f"[INFO] Detected MIME type: {mime_type}")

    try:
        if mime_type and mime_type.startswith("image"):
            result = run_image_detection(tmp_input_path, tmp_output_path, bucket)
        elif mime_type and mime_type.startswith("video"):
            result = run_video_detection(tmp_input_path, tmp_output_path, bucket)
        else:
            raise ValueError("Unsupported file type")

        print("[INFO] Detection Result:")
        print(json.dumps(result, indent=2))

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Detection completed", "result": result})
        }

    except Exception as e:
        print(f"[ERROR] Lambda processing failed: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }


def handle_api_temp_media(event):  # Added: new handler for temporary file-based media query
    try:
        print("[INFO] Received API-based temporary media query request.")

        body = json.loads(event["body"])
        content_b64 = body.get("content")
        media_type = body.get("type", "image")  # Supported values: "image", "video"

        if not content_b64:
            raise ValueError("Missing 'content' field.")

        # Save base64 content to /tmp
        ext = ".jpg" if media_type == "image" else ".mp4"
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(base64.b64decode(content_b64))
            tmp_input = tmp.name
            tmp_output = tmp_input.replace(ext, f"_annotated{ext}")

        print(f"[INFO] Temporary file saved at {tmp_input}")

        # Run detection but skip uploading or saving
        if media_type == "image":
            result = run_image_detection(tmp_input, tmp_output, bucket="temp", user_id="query_user", skip_upload=True)  # Added param
        elif media_type == "video":
            result = run_video_detection(tmp_input, tmp_output, bucket="temp", user_id="query_user", skip_upload=True)  # Added param
        else:
            raise ValueError("Unsupported media type")

        tags = result.get("tags", {})
        if not tags:
            return {
                "statusCode": 200,
                "body": json.dumps({
                    "query_tags": tags,
                    "match_count": 0,
                    "links": []
                })
            }

        # Query DynamoDB for matching files
        matching_links = query_matching_files(tags)

        return {
            "statusCode": 200,
            "body": json.dumps({
                "query_tags": tags,
                "match_count": len(matching_links),
                "links": matching_links
            })
        }

    except Exception as e:
        print(f"[ERROR] handle_api_temp_media failed: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
