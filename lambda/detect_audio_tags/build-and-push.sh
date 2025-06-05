#!/bin/bash
set -e

TAG=v2 
REPO_NAME=birdtag-audio-lambda
REGION=ap-southeast-2
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
IMAGE_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:$TAG"

docker build --platform linux/amd64 --no-cache -t $REPO_NAME ./lambda/detect_audio_tags

aws ecr describe-repositories --repository-names $REPO_NAME || \
  aws ecr create-repository --repository-name $REPO_NAME

aws ecr get-login-password --region $REGION | \
docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

docker tag $REPO_NAME:latest $IMAGE_URI
docker push $IMAGE_URI

echo "Pushed image to: $IMAGE_URI"
