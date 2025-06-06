from handlers.search_by_tags import handle as search_by_tags
from handlers.search_by_species import handle as search_by_species
from handlers.search_by_thumbnail import handle as search_by_thumbnail

def lambda_handler(event, context):
    action = event.get("action")

    if action == "search_by_tags":
        return search_by_tags(event)
    elif action == "search_by_species":
        return search_by_species(event)
    elif action == "search_by_thumbnail":
        return search_by_thumbnail(event)
    else:
        return {
            "statusCode": 400,
            "body": f"Unknown action: {action}"
        }

if __name__ == "__main__":
    test_event = {
        "action": "search_by_tags",
        "crow": 1
    }
    result = lambda_handler(test_event,None)
    print(result)