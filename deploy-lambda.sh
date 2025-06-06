#!/bin/bash 
set -e

TAG=$(date +"v%Y%m%d-%H%M")
REPO_NAME=birdtag-image-video
REGION=ap-southeast-2
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
IMAGE_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:$TAG"

echo "[1/4] Building Docker image: $IMAGE_URI"
docker build --platform linux/amd64 --no-cache -t $REPO_NAME ./lambda/detect_bird_tags

echo "[2/4] Creating ECR repo (if not exist)"
aws ecr describe-repositories --repository-names $REPO_NAME > /dev/null 2>&1 || \
  aws ecr create-repository --repository-name $REPO_NAME

echo "[3/4] Logging into ECR"
aws ecr get-login-password --region $REGION | \
docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

echo "[4/4] Pushing image to ECR"
docker tag $REPO_NAME:latest $IMAGE_URI
docker push $IMAGE_URI

echo "Image pushed: $IMAGE_URI"

echo "Deploying CloudFormation stack: birdtag-image-lambda-stack"

aws cloudformation deploy \
  --template-file cloudformation/template.yaml \
  --stack-name birdtag-image-lambda-stack \
  --parameter-overrides LambdaImageUri=$IMAGE_URI \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --no-fail-on-empty-changeset

echo "Deployment complete with image tag: $TAG"

  # --parameter-overrides LambdaImageUri="$(aws sts get-caller-identity --query Account --output text).dkr.ecr.ap-southeast-2.amazonaws.com/birdtag-image-video:v20250606-1529" \
