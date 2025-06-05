#!/bin/bash
set -e

echo "[1/2] Building audio lambda image"
docker build --platform linux/amd64 -t birdtag-audio-lambda:audio-latest ./lambda/detect_audio_tags

echo "[2/2] Building upload handler image"
docker build --platform linux/amd64 -t birdtag-upload-files:upload-latest ./lambda/upload_files

echo "Local Docker images built (not pushed)"
