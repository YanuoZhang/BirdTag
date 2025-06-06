import boto3
import os
from urllib.parse import urlparse

dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")

table = dynamodb.Table(os.environ.get("TABLE_NAME", "BirdMedia"))

# def extract_bucket_and_key(s3_url):
#     parsed = urlparse(s3_url)
#     bucket = parsed.netloc.split(".s3")[0]
#     key = parsed.path.lstrip("/")
#     return bucket, key

def extract_file_id(s3_url):
    filename = os.path.basename(urlparse(s3_url).path)
    file_id = os.path.splitext(filename)[0]
    return file_id



def handle(event):
    urls = event.get("urls", [])
    if not urls or not isinstance(urls, list):
        return {
            "statusCode": 400,
            "body": "Missing or invalid 'urls'"
        }

    deleted = []
    not_found = []

    for url in urls:
        file_id = extract_file_id(url)
        response = table.get_item(Key={"file_id": file_id})
        item = response.get("Item")

        if not item:
            not_found.append(url)
            continue

        file_type = item.get("file_type", "")
        s3_url = item["s3_url"]
        thumbnail_url = item.get("thumbnail_url", "")

        # Step 1: Delete main file (if exists in S3)
        # bucket, key = extract_bucket_and_key(s3_url)
        # s3.delete_object(Bucket=bucket, Key=key)

        # Step 2: Delete thumbnail (if image)
        # if file_type == "image" and thumbnail_url:
        #     tbucket, tkey = extract_bucket_and_key(thumbnail_url)
        #     s3.delete_object(Bucket=tbucket, Key=tkey)

        if item["s3_url"] != url:
            print(f"[Warning] URL mismatch for {file_id}: expected {item['s3_url']}, got {url}")

        # Step 3: Delete record
        table.delete_item(Key={"file_id": file_id})
        deleted.append(file_id)

    return {
        "statusCode": 200,
        "body": {
            "deleted": deleted,
            "not_found": not_found
        }
    }
    
