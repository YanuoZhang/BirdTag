import boto3
import json
import os

dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

TABLE_NAME = os.environ['TABLE_NAME']
TOPIC_ARN = os.environ['TOPIC_ARN']

def lambda_handler(event, context):
    print("STARTING SUBSCRIBE TEST")
    print("Using table:", os.environ.get("TABLE_NAME"))
    print("Using topic:", os.environ.get("TOPIC_ARN"))

    try:
        body = json.loads(event['body'])
        email = body.get('user_email')
        tags = body.get('tags', [])

        if not email or not isinstance(tags, list) or not tags:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing or invalid 'email' or 'tags'"})
            }

        table = dynamodb.Table(TABLE_NAME)
        table.put_item(Item={
            'user_email': email,
            'tags': {tag: True for tag in tags}
        })

        sns.subscribe(
            TopicArn=TOPIC_ARN,
            Protocol='email',
            Endpoint=email
        )

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Subscription request submitted. Please check your email to confirm."})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
