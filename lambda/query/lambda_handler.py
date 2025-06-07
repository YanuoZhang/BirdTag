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
    