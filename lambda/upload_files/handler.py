import base64
import boto3
import mimetypes
import os
from datetime import datetime

# Initialize S3 client
s3 = boto3.client("s3")

# Retrieve the target bucket name from environment variables
MEDIA_BUCKET = os.environ["MEDIA_BUCKET"]

# Determine media type based on file extension
def get_media_type(filename):
    mime_type, _ = mimetypes.guess_type(filename)
    if not mime_type:
        return "unknown"
    if mime_type.startswith("audio"):
        return "audio"
    elif mime_type.startswith("video"):
        return "video"
    elif mime_type.startswith("image"):
        return "image"
    else:
        return "unknown"

# Lambda entry point
def lambda_handler(event, context):
    try:
        # Retrieve the request body
        body = event.get("body")

        # Decode base64 if needed
        if event.get("isBase64Encoded", False):
            body = base64.b64decode(body)
        else:
            body = body.encode("utf-8")  # Ensure it's bytes

        # Get the filename from query string parameters
        query = event.get("queryStringParameters", {})
        filename = query.get("filename")

        # Basic validation
        if not filename or not body:
            return {
                "statusCode": 400,
                "body": "Missing filename or body in request"
            }

        # Detect media type: audio, video, or image
        media_type = get_media_type(filename)
        if media_type == "unknown":
            return {
                "statusCode": 400,
                "body": "Unsupported file type"
            }

        # Create unique S3 object key with timestamp
        timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
        s3_key = f"{media_type}/{timestamp}-{filename}"

        # Upload the file to S3
        s3.put_object(
            Bucket=MEDIA_BUCKET,
            Key=s3_key,
            Body=body,
            ContentType=mimetypes.guess_type(filename)[0] or "binary/octet-stream"
        )

        # Return success response
        return {
            "statusCode": 200,
            "body": f"File uploaded to s3://{MEDIA_BUCKET}/{s3_key}"
        }

    except Exception as e:
        # Handle any unexpected errors
        return {
            "statusCode": 500,
            "body": f"Upload failed: {str(e)}"
        }
