# detect_handler.py

import cv2 as cv
import os
from datetime import datetime
from collections import Counter
import model_utils

def run_image_detection(image_path, save_path):
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

        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        cv.imwrite(save_path, annotated_img)

        labels = [class_dict[cls_id] for cls_id in detections.class_id]
        tag_counts = dict(Counter(labels))
        print(f"[INFO] Image tags detected: {tag_counts}")

        return {
            "fileId": os.path.basename(image_path),
            "type": "image",
            "tags": tag_counts,
            "annotatedPath": save_path,
            "uploadTime": datetime.utcnow().isoformat() + "Z"
        }

    except Exception as e:
        print(f"[ERROR] Image detection failed: {e}")
        raise


def run_video_detection(video_path, save_path, confidence=0.4):
    try:
        print(f"[INFO] Starting video detection for: {video_path}")
        model = model_utils.get_model()
        class_dict = model.names

        tag_counts = model_utils.process_video(
            model=model,
            video_path=video_path,
            save_path=save_path,
            class_dict=class_dict,
            confidence=confidence
        )

        print(f"[INFO] Video tags detected: {tag_counts}")

        return {
            "fileId": os.path.basename(video_path),
            "type": "video",
            "tags": tag_counts,
            "annotatedPath": save_path,
            "uploadTime": datetime.utcnow().isoformat() + "Z"
        }

    except Exception as e:
        print(f"[ERROR] Video detection failed: {e}")
        raise