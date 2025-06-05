#!/bin/bash
set -e

REGION="ap-southeast-2"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPO_NAME="birdtag-lambda"

AUDIO_TAG="audio-latest"
UPLOAD_TAG="upload-latest"

AUDIO_IMAGE_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:$AUDIO_TAG"
UPLOAD_IMAGE_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:$UPLOAD_TAG"

echo "[1/6] Checking if ECR repository exists..."
aws ecr describe-repositories --repository-names "$REPO_NAME" > /dev/null 2>&1 || {
  echo "Repository not found. Creating: $REPO_NAME"
  aws ecr create-repository --repository-name "$REPO_NAME"
}

echo "[2/6] Logging into ECR..."
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

echo "[3/6] Tagging local images..."
docker tag birdtag-audio-lambda:$AUDIO_TAG $AUDIO_IMAGE_URI
docker tag birdtag-upload-files:$UPLOAD_TAG $UPLOAD_IMAGE_URI

echo "[4/6] Pushing audio image to ECR..."
docker push $AUDIO_IMAGE_URI

echo "[5/6] Pushing upload image to ECR..."
docker push $UPLOAD_IMAGE_URI

echo "[6/6] Image push complete"
echo "AudioImageUri:  $AUDIO_IMAGE_URI"
echo "UploadImageUri: $UPLOAD_IMAGE_URI"
