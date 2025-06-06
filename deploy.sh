#!/bin/bash
set -e

REGION="ap-southeast-2"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPO_NAME="birdtag-lambda"

AUDIO_TAG="audio-latest"
UPLOAD_TAG="upload-latest"

AUDIO_IMAGE_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:$AUDIO_TAG"
UPLOAD_IMAGE_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:$UPLOAD_TAG"

echo "Deploying CloudFormation stack (Lambda, S3, DynamoDB, etc)..."

aws cloudformation deploy \
  --template-file cloudformation/template.yaml \
  --stack-name birdtag-stack \
  --parameter-overrides \
      LambdaImageUri=$AUDIO_IMAGE_URI \
      UploadImageUri=$UPLOAD_IMAGE_URI \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --no-fail-on-empty-changeset

echo "Deployment complete."

aws cloudformation describe-stacks \
  --stack-name birdtag-stack \
  --query "Stacks[0].Outputs" \
  --output table
