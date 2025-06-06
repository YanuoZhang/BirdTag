import boto3
import os
from decimal import Decimal

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ.get("BIRDTAG_TABLE", "BirdMedia"))


def handle(event):
    file_id = event.get("file_id")
    action = event.get("edit_action")  # "add" or "remove"
    new_tags = event.get("tags", {})

    if not file_id or not action or not isinstance(new_tags, dict):
        return {
            "statusCode": 400,
            "body": {
                "message": "Missing or invalid fields: 'file_id', 'action', 'tags' are required."
            }
        }

    # 1. Search original data
    response = table.get_item(Key={"file_id": file_id})
    item = response.get("Item")
    if not item:
        return {
            "statusCode": 404,
            "body": {
                "message": f"No item found for file_id: {file_id}"
            }
        }

    tags = item.get("tags", {})
    tags = {k: int(v) for k, v in tags.items()}  # Convert to normal dict

    # 2. Add or remove
    if action == "add":
        for tag, count in new_tags.items():
            count = int(count)
            if count > 0:
                tags[tag] = tags.get(tag, 0) + count
    elif action == "remove":
        for tag in new_tags.keys():
            tags.pop(tag, None)
    else:
        return {
            "statusCode": 400,
            "body": {
                "message": "Invalid action. Must be 'add' or 'remove'."
            }
        }
    
    # 3. Update tags_flat
    tags_flat = list(tags.keys())

    # 4. Update database
    table.update_item(
        Key={"file_id": file_id},
        UpdateExpression="SET tags = :t, tags_flat = :f",
        ExpressionAttributeValues={
            ":t": {k: Decimal(str(v)) for k, v in tags.items()},
            ":f": tags_flat
        }
    )

    return {
        "statusCode": 200,
        "body": {
            "message": "Tags updated successfully",
            "updated_tags": tags,
            "tags_flat": tags_flat
        }
    }
