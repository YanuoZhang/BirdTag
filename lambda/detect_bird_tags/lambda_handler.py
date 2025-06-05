# lambda_handler.py

import json
import os
import boto3
import mimetypes
import uuid
from handler import run_image_detection, run_video_detection

s3_client = boto3.client('s3')

def lambda_handler(event, context):
    print("[INFO] Lambda triggered by event:")
    print(json.dumps(event))

    # read S3 event information
    record = event['Records'][0]
    bucket = record['s3']['bucket']['name']
    key = record['s3']['object']['key']
    print(f"[INFO] Bucket: {bucket}, Key: {key}")

    # local path
    filename = os.path.basename(key)
    tmp_input_path = f"/tmp/{uuid.uuid4()}_{filename}"
    tmp_output_path = f"/tmp/output_{filename}"

    # download to /tmp
    print(f"[INFO] Downloading from S3 to: {tmp_input_path}")
    s3_client.download_file(bucket, key, tmp_input_path)

    # file type
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