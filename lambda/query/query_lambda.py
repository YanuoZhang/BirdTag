from handlers.search_by_tags import handle as search_by_tags

def lambda_handler(event, context):
    action = event.get("action")

    if action == "search_by_tags":
        return search_by_tags(event)
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