# ddb_utils.py

import boto3
import uuid
import os

dynamodb = boto3.resource("dynamodb")
table_name = os.environ.get("TABLE_NAME", "BirdTagMedia")
table = dynamodb.Table(table_name)


def save_file_record(metadata: dict):
    """
    Takes metadata from image/video detection and writes a formatted item to DynamoDB.
    """
    item = {
        "file_id": str(uuid.uuid4()),
        "user_id": metadata.get("user_id", "demo_user"),  # hard code
        "filename": metadata["fileId"],
        "file_type": metadata["type"],
        "upload_time": metadata["uploadTime"],
        "s3_url": metadata["s3Url"],
        "thumbnail_url": metadata.get("thumbnailUrl", ""),  # only image
        "tags": metadata["tags"],
        "tags_flat": list(metadata["tags"].keys())
    }

    try:
        table.put_item(Item=item)
        print("[INFO] Successfully saved to DynamoDB")
    except Exception as e:
        print(f"[ERROR] Failed to save to DynamoDB: {e}")
        raise

    
