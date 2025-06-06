import boto3
import os

dynamodb = boto3.resource("dynamodb", region_name="ap-southeast-2")
table = dynamodb.Table(os.environ.get("BIRDTAG_TABLE", "BirdMedia"))

def handle(event):
    """
    Expected input:
    {
        "thumbnail_url": "https://xxx.s3.amazonaws.com/image1-thumb.jpg"
    }

    Return:
    {
        "s3_url": "https://xxx.s3.amazonaws.com/image1.jpg"
    }
    """

    thumbnail_url = event.get("thumbnail_url")
    if not thumbnail_url:
        return {
            "statusCode": 400,
            "body": "Missing 'thumbnail_url' in request."
        }

    try:
        response = table.scan()
        items = response.get("Items", [])
    except Exception as e:
        return {
            "statusCode": 500,
            "body": f"DynamoDB scan failed: {str(e)}"
        }

    for item in items:
        if item.get("thumbnail_url") == thumbnail_url:
            return {
                "statusCode": 200,
                "body": {
                    "s3_url": item.get("s3_url")
                }
            }

    return {
        "statusCode": 404,
        "body": "No file found for the given thumbnail URL."
    }
