import os
import json
import boto3


dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ.get("TABLE_NAME", "BirdMedia"))

def handle(event):
    if isinstance(event.get("body"), str):
        body = json.loads(event["body"])
    else:
        body = event.get("body", {})

    file_ids = body.get("file_id", [])
    op = body.get("operation")
    tags = body.get("tags", {})

    if op not in (0, 1):
        return {"statusCode": 400, "body": "Invalid operation: must be 0 or 1."}
    
    if not isinstance(tags, dict):
        return {"statusCode": 400, "body": "Tags must be a JSON object."}

    updated = []

    for file_id in file_ids:
        try:
            response = table.get_item(Key={"file_id": file_id})
            item = response.get("Item", {"file_id": file_id, "tags": {}, "tag_flat": []})
            current_tags = item.get("tags", {})
            tag_flat = set(item.get("tag_flat", []))

            if op == 1:  # Add
                for tag, count in tags.items():
                    current_tags[tag] = current_tags.get(tag, 0) + count
                    tag_flat.add(tag)

            else:  # Remove
                for tag, count in tags.items():
                    if tag in current_tags:
                        current_tags[tag] -= count
                        if current_tags[tag] <= 0:
                            current_tags.pop(tag)
                            tag_flat.discard(tag)

            item["tags"] = current_tags
            item["tag_flat"] = list(tag_flat)
            table.put_item(Item=item)
            updated.append(file_id)

        except Exception as e:
            print(f"[ERROR] Failed to update {file_id}: {e}")

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": f"{'Added' if op == 1 else 'Removed'} tags for {len(updated)} files.",
            "updated": updated
        })
    }
