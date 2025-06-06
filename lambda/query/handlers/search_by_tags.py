import os
import boto3
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource("dynamodb", region_name="ap-southeast-2")

table = dynamodb.Table(os.environ.get("BIRDTAG_TABLE", "BirdMedia"))

def handle(event):
    """
    Expected input:
    {
        "crow": 2,
        "pigeon": 3
    }
    """

    required_tags = {
        k: int(v) for k, v in event.items()
        if k != "action"
    }  # e.g., {"crow": 2, "pigeon": 3}

    # Step 1: full table scan
    response = table.scan()
    items = response["Items"]

    # Step 2: filter logic in Python (because tags is a map, complex for DynamoDB filtering)
    matched_links = []

    for item in items:
        tags = item.get("tags", {})
        if all(tags.get(tag, 0) >= count for tag, count in required_tags.items()):
            file_type = item.get("file_type", "") 

            if file_type == "image":
                link = item.get("thumbnail_url")
            elif file_type == "video":
                link = item.get("s3_url") 
            else:
                continue
            if link:
                matched_links.append(link)

    return {
        "statusCode": 200,
        "body": {
            "links": matched_links
        }
    }


