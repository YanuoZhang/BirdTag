import base64
import json
from handler import lambda_handler

# Step 1: Read and encode your local audio file
with open("soundscape.wav", "rb") as f:
    audio_data = f.read()
    audio_base64 = base64.b64encode(audio_data).decode("utf-8")

# Step 2: Create a mock event
event = {
    "audio_base64": audio_base64
}

# Step 3: Run the Lambda handler
print("Start test")
response = lambda_handler(event, None)
print("Response:", response)


# Step 4: Print result
print("Lambda response status:", response["statusCode"])
print("Recognition result:")
print(json.dumps(json.loads(response["body"]), indent=2))
