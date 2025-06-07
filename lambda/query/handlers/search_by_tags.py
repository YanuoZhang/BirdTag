import boto3
import os
import json

dynamodb = boto3.resource("dynamodb", region_name="ap-southeast-2")
table = dynamodb.Table(os.environ.get("BIRDTAG_TABLE", "BirdMedia"))

def handle(event):
    """
    Input:
    {
        "tags": {
            "crow": 2,
            "parrot": 1
        }
    }

    Output:
    {
        "results": [
            {
                "file_id": ...,
                "file_type": ...,
                "s3_url": ...,
                "thumbnail_url": ...,
                "tags": {...}
            },
            ...
        ]
    }
    """

    if isinstance(event.get("body"), str):
        body = json.loads(event["body"])
    else:
        body = event.get("body", {})

    tag_filters = event.get("tags", {})
    
    if not isinstance(tag_filters, dict) or not tag_filters:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing or invalid 'tags' in request."})
        }

    try:
        response = table.scan()
        items = response.get("Items", [])
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": f"DynamoDB scan failed: {str(e)}"})
        }

    matched_files = []

    for item in items:
        tags = item.get("tags", {})
        match = True
        for tag, required_count in tag_filters.items():
            if tag not in tags or tags[tag] < required_count:
                match = False
                break

        if match:
            matched_files.append(item)

    return {
        "statusCode": 200,
        "body": json.dumps({
            "results": matched_files
        }, default = str)
    }
