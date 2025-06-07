import subscribe_user


test_event = {
    'body': '{"user_email": "fengmo121212@hotmail.com", "tags": ["eagle", "crow"]}'
}
test_context = {}  

response = subscribe_user.lambda_handler(test_event, test_context)
print("Lambda Response:")
print(response)
