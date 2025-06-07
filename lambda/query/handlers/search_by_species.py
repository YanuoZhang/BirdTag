import boto3
import os
import json

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

    if isinstance(event.get("body"), str):
        body = json.loads(event["body"])
    else:
        body = event.get("body", {})

    species_list = body.get("species", [])
    
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
        tags_flat = item.get("tags_flat", [])
        if any(species in tags_flat for species in species_list):
            matched_files.append(item)

    return {
        "statusCode": 200,
        "body": json.dumps({
            "results": matched_files
        }, default=str)
    }
