# handler.py

import os
import cv2 as cv
from datetime import datetime
from collections import Counter
import model_utils
import boto3
from ddb_utils import save_file_record

# fake user
# BUCKET_NAME = "your-bucket"
# USER_ID = "demo_user"

s3_client = boto3.client("s3")

def run_image_detection(image_path, save_path, bucket, user_id="demo_user", skip_upload=False):  # Added param: skip_upload
    try:
        print(f"[INFO] Starting image detection for: {image_path}")
        model = model_utils.get_model()
        class_dict = model.names

        img = cv.imread(image_path)
        if img is None:
            raise ValueError("Failed to load image.")

        result = model(img)[0]
        detections = model_utils.sv.Detections.from_ultralytics(result)
        annotated_img = model_utils.annotate_image(img, detections, class_dict)

        # Save annotated image
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        cv.imwrite(save_path, annotated_img)

        # === Generate thumbnail ===
        original_img = cv.imread(image_path)  # Load again to ensure unannotated
        if original_img is None:
            raise ValueError("Failed to reload original image for thumbnail.")

        thumb_name = f"thumb_{os.path.basename(image_path)}"
        tmp_thumb_path = f"/tmp/{thumb_name}"
        height, width = original_img.shape[:2]
        scale = 256.0 / max(height, width)
        resized = cv.resize(original_img, (int(width * scale), int(height * scale)))
        cv.imwrite(tmp_thumb_path, resized)

        # Prepare metadata
        labels = [class_dict[cls_id] for cls_id in detections.class_id]
        tag_counts = dict(Counter(labels))

        metadata = {
            "file_id": os.path.basename(image_path),
            "filename": f"uploads/images/{user_id}/{os.path.basename(image_path)}",
            "file_type": "image",
            "s3Url": "",
            "thumbnailUrl": "",
            "tags": tag_counts,
            "tags_flat": list(tag_counts.keys()),
            "uploadTime": datetime.utcnow().isoformat() + "Z",
            "user_id": user_id,
            "user_email": "demo@example.com"
        }

        if not skip_upload:  # Added: skip upload and database write if in temp query mode
            s3_output_key = f"annotated/{user_id}/{os.path.basename(save_path)}"
            s3_client.upload_file(save_path, bucket, s3_output_key)
            s3_url = f"https://{bucket}.s3.amazonaws.com/{s3_output_key}"

            s3_thumb_key = f"thumbnails/{user_id}/{thumb_name}"
            s3_client.upload_file(tmp_thumb_path, bucket, s3_thumb_key)
            thumbnail_url = f"https://{bucket}.s3.amazonaws.com/{s3_thumb_key}"

            metadata["s3Url"] = s3_url
            metadata["thumbnailUrl"] = thumbnail_url

            save_file_record(metadata)

        return metadata

    except Exception as e:
        print(f"[ERROR] Image detection failed: {e}")
        raise


def run_video_detection(video_path, save_path, bucket, user_id="demo_user", skip_upload=False):  # Added param: skip_upload
    try:
        print(f"[INFO] Starting video detection for: {video_path}")
        model = model_utils.get_model()
        class_dict = model.names

        tag_counts = model_utils.process_video(
            model=model,
            video_path=video_path,
            save_path=save_path,
            class_dict=class_dict,
            confidence=0.4
        )

        metadata = {
            "file_id": os.path.basename(video_path),
            "filename": f"uploads/videos/{user_id}/{os.path.basename(video_path)}",
            "type": "video",
            "s3Url": "",
            "thumbnailUrl": "",
            "tags": tag_counts,
            "uploadTime": datetime.utcnow().isoformat() + "Z",
            "user_id": user_id,
            "user_email": "demo@example.com"
        }

        if not skip_upload:  # Added: skip upload and DB write in temp analysis
            s3_output_key = f"annotated/{user_id}/{os.path.basename(video_path)}"
            s3_client.upload_file(save_path, bucket, s3_output_key)
            s3_url = f"https://{bucket}.s3.amazonaws.com/{s3_output_key}"
            metadata["s3Url"] = s3_url

            save_file_record(metadata)

        return metadata

    except Exception as e:
        print(f"[ERROR] Video detection failed: {e}")
        raise