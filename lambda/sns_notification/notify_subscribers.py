import boto3
import json
import os

dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

TABLE_NAME = os.environ['TABLE_NAME']
TOPIC_ARN = os.environ['TOPIC_ARN']

def lambda_handler(event, context):
    print(" Starting tag-based notification process")
    print("Event received:", event)

    tags = event.get('tags', [])
    file_url = event.get('file_url', '')

    if not tags or not file_url:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing 'tags' or 'file_url'"})
        }

    try:
        table = dynamodb.Table(TABLE_NAME)
        response = table.scan()
        all_users = response.get("Items", [])

        notified_emails = set()


        for user in all_users:
            email = user.get("user_email")
            subscribed_tags = user.get("tags", {})

            if not email or not isinstance(subscribed_tags, dict):
                continue

 
            if any(tag in subscribed_tags for tag in tags):
                sns.publish(
                    TopicArn=TOPIC_ARN,
                    Subject="New BirdTag Upload",
                    Message=(
                        f"Hi,\n\nA new file was uploaded containing tags {tags}.\n"
                        f"View it here: {file_url}\n\n"
                        "If you no longer wish to receive these updates, you can unsubscribe in the email footer."
                    )
                )
                notified_emails.add(email)

        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Notification sent.",
                "notified_emails": list(notified_emails)
            })
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
