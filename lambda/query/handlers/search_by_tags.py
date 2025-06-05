import os
import boto3
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource("dynamodb", region_name="ap-southeast-2")

table = dynamodb.Table(os.environ["BirdMedia"])

def handle(event):
    """
    Event expected format:
    {
        "crow": 2,
        "pigeon": 3
    }
    """

    required_tags = event  # e.g., {"crow": 2, "pigeon": 3}

    # Step 1: full table scan
    response = table.scan()
    items = response["Items"]

    # Step 2: filter logic in Python (because tags is a map, complex for DynamoDB filtering)
    matched_links = []

    for item in items:
        tags = item.get("tags", {})
        if all(tags.get(tag, 0) >= count for tag, count in required_tags.items()):
            thumbnail = item.get("thumbnail_url")
            if thumbnail:
                matched_links.append(thumbnail)

    return {
        "statusCode": 200,
        "body": {
            "links": matched_links
        }
    }


