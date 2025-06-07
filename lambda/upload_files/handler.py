import boto3
import os
import json
import time
import mimetypes
from botocore.config import Config

# Initialize the S3 client with virtual-hosted-style addressing
s3 = boto3.client(
    's3',
    region_name='ap-southeast-2',
    config=Config(s3={'addressing_style': 'virtual'}),
    endpoint_url='https://s3.ap-southeast-2.amazonaws.com' 
)

# Get the S3 bucket name from the environment variable
bucket = os.environ['MEDIA_BUCKET']

# Allowed MIME types
ALLOWED_TYPES = {
    'image/jpeg': 'image',
    'image/png': 'image',
    'audio/mpeg': 'audio',
    'audio/wav': 'audio',
    'audio/x-wav': 'audio',
    'video/mp4': 'video'
}

def lambda_handler(event, context):
    try:
        print("Event:", json.dumps(event))

        body = json.loads(event['body'])
        filename = body['filename']

        # Guess the MIME type from the file extension
        content_type, _ = mimetypes.guess_type(filename)
        if content_type is None:
            content_type = 'application/octet-stream'

        # Check if the content type is supported
        if content_type not in ALLOWED_TYPES:
            raise ValueError(f"Unsupported content type: {content_type}")

        # Determine the upload folder based on MIME type
        folder = ALLOWED_TYPES[content_type]

        # Create timestamp-based key with appropriate folder
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        key = f"uploads/{folder}/{timestamp}-{filename}"

        # Generate the presigned URL
        url = s3.generate_presigned_url(
            ClientMethod='put_object',
            Params={
                'Bucket': bucket,
                'Key': key,
                'ContentType': content_type
            },
            ExpiresIn=300
        )
        print("Presigned Params:", {
            "Key": key,
            "ContentType": content_type
        })

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST,OPTIONS"
            },
            "body": json.dumps({
                "url": url,
                "key": key,
                "contentType": content_type
            })
        }


    except Exception as e:
        print("Error occurred:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({ "error": str(e) }),
            "headers": { "Content-Type": "application/json" }
        }
