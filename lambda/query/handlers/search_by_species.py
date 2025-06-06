import boto3
import os

dynamodb = boto3.resource("dynamodb", region_name="ap-southeast-2")
table = dynamodb.Table(os.environ.get("BIRDTAG_TABLE", "BirdMedia"))

def handle(event):
    """
    Expected input:
    {
        "species": ["crow", "parrot"]
    }
    Returns all files (image/audio/video) that contain at least one of these species
    """

    species_list = event.get("species", [])
    if not species_list:
        return {
            "statusCode": 400,
            "body": "Missing 'species' list in request."
        }

    try:
        response = table.scan()
        items = response.get("Items", [])
    except Exception as e:
        return {
            "statusCode": 500,
            "body": f"DynamoDB scan failed: {str(e)}"
        }

    matched_files = []

    for item in items:
        tags = item.get("tags", {})
        file_type = item.get("file_type", "")
        if any(tag in tags for tag in species_list):
            matched_files.append({
                "file_id": item["file_id"],
                "file_type": file_type,
                "s3_url": item["s3_url"],
                "thumbnail_url": item["thumbnail_url"],
                "tags": tags
            })
    return {
        "statusCode": 200,
        "body": {
            "results": matched_files
        }
    }
