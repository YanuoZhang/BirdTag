# ddb_utils.py

import boto3
import uuid

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("birdtag_files")  

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

    table.put_item(Item=item)
    print("[INFO] Successfully saved to DynamoDB")

    
