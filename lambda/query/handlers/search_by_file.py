import json
import os
import requests

# Mapping different API by file type
API_ENDPOINTS = {
    "audio": os.environ.get("AUDIO_API", "https://8yasbalx94.execute-api.ap-southeast-2.amazonaws.com/prod/analyze-audio"),
    "image": os.environ.get("IMAGE_API", "https://placeholder.execute-api.ap-southeast-2.amazonaws.com/prod/analyze-image"),
    "video": os.environ.get("VIDEO_API", "https://placeholder.execute-api.ap-southeast-2.amazonaws.com/prod/analyze-video")
}

def handle(event):
    """
    Expects:
    {
        "file_type": "audio" | "image" | "video",
        "content": "<base64-encoded file>"
    }
    """

    file_type = event.get("file_type")
    base64_content = event.get("content")

    if file_type not in API_ENDPOINTS:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": f"Unsupported or missing file_type: {file_type}"})
        }

    if not base64_content:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing 'content' field"})
        }

    target_url = API_ENDPOINTS[file_type]

    try:
        response = requests.post(
            target_url,
            json={"content": base64_content},
            timeout=20
        )
        return {
            "statusCode": response.status_code,
            "body": response.json()
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
