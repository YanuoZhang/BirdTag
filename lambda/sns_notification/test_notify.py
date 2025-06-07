import notify_subscribers

event = {
    "tags": ["eagle"],
    "file_url": "https://example.com/file101.jpg"
}
response = notify_subscribers.lambda_handler(event, {})
print(response)
