# ddb_utils.py

import boto3
import uuid
import os

dynamodb = boto3.resource("dynamodb")
table_name = os.environ.get("TABLE_NAME", "BirdTagMedia")
table = dynamodb.Table(table_name)


def save_file_record(metadata: dict):
    try:
        table.put_item(Item=metadata)
        print("[INFO] Successfully saved to DynamoDB")
    except Exception as e:
        print(f"[ERROR] Failed to save to DynamoDB: {e}")
        raise

def query_matching_files(tags):
    """
    Scan DynamoDB and return URLs of media files that match all provided tags (AND condition).
    If media type is image, return thumbnail URL; otherwise return s3 URL.
    """
    resp = table.scan(
        ProjectionExpression="fileId, tags, s3Url, thumbnailUrl, type"
    )

    matches = []
    for item in resp.get("Items", []):
        item_tags = item.get("tags", {})
        media_type = item.get("type")

        if all(tag in item_tags and item_tags[tag] >= tags[tag] for tag in tags):
            if media_type == "image" and item.get("thumbnailUrl"):
                matches.append(item["thumbnailUrl"])
            elif media_type in ("video", "audio"):
                matches.append(item["s3Url"])

    return matches
