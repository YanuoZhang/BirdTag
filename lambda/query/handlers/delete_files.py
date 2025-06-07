import boto3
import os
import json
from urllib.parse import urlparse


dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")


table = dynamodb.Table(os.environ.get("TABLE_NAME", "BirdMedia"))
BUCKET_NAME = os.environ.get("BUCKET_NAME", "birdtag-media-698342338581")


def extract_key(s3_url):
    return urlparse(s3_url).path.lstrip('/')

def handle(event):

    if isinstance(event.get("body"), str):
        body = json.loads(event["body"])
    else:
        body = event.get("body", {})

    file_ids = body.get("file_ids", [])
    if not file_ids or not isinstance(file_ids, list):
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing or invalid 'file_ids'"})
        }

    deleted = []
    not_found = []

    for file_id in file_ids:
        try:
            response = table.get_item(Key={"file_id": file_id})
            item = response.get("Item")

            if not item:
                not_found.append(file_id)
                continue

            file_type = item.get("file_type", "")
            s3_url = item.get("s3_url", "")
            thumbnail_url = item.get("thumbnail_url", "")

 
            if s3_url:
                key = extract_key(s3_url)
                s3.delete_object(Bucket=BUCKET_NAME, Key=key)

 
            if file_type == "image" and thumbnail_url:
                tkey = extract_key(thumbnail_url)
                s3.delete_object(Bucket=BUCKET_NAME, Key=tkey)

            table.delete_item(Key={"file_id": file_id})
            deleted.append(file_id)

        except Exception as e:
            print(f"[ERROR] Failed to delete {file_id}: {e}")
            not_found.append(file_id)

    return {
        "statusCode": 200,
        "body": json.dumps({
            "deleted": deleted,
            "not_found": not_found
        })
    }
