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
    Returns all files (image/audio/video) that contain at least one of these species (matched from tag_flat)
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
        tag_flat = item.get("tag_flat", [])
        if any(species in tag_flat for species in species_list):
            matched_files.append(item)

    return {
        "statusCode": 200,
        "body": {
            "results": matched_files
        }
    }
