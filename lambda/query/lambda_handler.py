from handlers.search_by_tags import handle as search_by_tags
from handlers.search_by_species import handle as search_by_species
from handlers.search_by_thumbnail import handle as search_by_thumbnail
from handlers.manual_tag_edit import handle as manual_tag_edit
from handlers.delete_files import handle as delete_files

def lambda_handler(event, context):
    action = event.get("action")

    if action == "search_by_tags":
        return search_by_tags(event)
    elif action == "search_by_species":
        return search_by_species(event)
    elif action == "search_by_thumbnail":
        return search_by_thumbnail(event)
    elif action == "manual_tag_edit":
        return manual_tag_edit(event)
    elif action == "delete_files":
        return delete_files(event)
    else:
        return {
            "statusCode": 400,
            "body": f"Unknown action: {action}"
        }
    
if __name__ == "__main__":
    test_event = {
        "action": "search_by_tags",
        "body": {
        "tags": {
            "crow": 1
        }}
    }

# 示例：测试 search_by_species
    # test_event = {
    #     "action": "search_by_species",
    #     "body": {
    #         "species": ["crow", "parrot"]
    #     }
    # }

    # 示例：测试 manual_tag_edit
    # test_event = {
    #     "action": "manual_tag_edit",
    #     "body": {
    #         "file_id": ["file101", "file103"],
    #         "operation": 1,
    #         "tags": {"eagle": 1}
    #     }
    # }

    # 示例：测试 delete_files
    # test_event = {
    #     "action": "search_by_thumbnail",
    #      "body": {
    #         "thumbnail_url": "https://s3.amazonaws.com/birdtag/thumbs/file101-thumb.jpg"
    #     }
    # }

    result = lambda_handler(test_event, None)
    print(result)
