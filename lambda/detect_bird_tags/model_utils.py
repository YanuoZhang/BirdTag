# model_utils.py

from ultralytics import YOLO
import supervision as sv
import cv2
import os
from collections import defaultdict

# Global model cache
MODEL = None


def get_model():
    global MODEL
    if MODEL is None:
        base_dir = os.path.dirname(__file__)
        model_path = os.path.join(base_dir, "model.pt")
        print(f"[INFO] Loading model from: {model_path}")
        MODEL = YOLO(model_path)
    return MODEL


def annotate_image(img, detections, class_dict, confidence=0.4):
    h, w = img.shape[:2]
    thickness = sv.calculate_optimal_line_thickness((w, h))
    text_scale = sv.calculate_optimal_text_scale((w, h))
    palette = sv.ColorPalette.from_matplotlib('magma', 10)

    detections = detections[detections.confidence > confidence]
    labels = [f"{class_dict[cls]} {conf*100:.2f}%" for cls, conf in zip(detections.class_id, detections.confidence)]

    box_annotator = sv.BoxAnnotator(thickness=thickness, color=palette)
    label_annotator = sv.LabelAnnotator(color=palette, text_scale=text_scale,
                                        text_thickness=thickness,
                                        text_position=sv.Position.TOP_LEFT)

    box_annotator.annotate(img, detections=detections)
    label_annotator.annotate(img, detections=detections, labels=labels)

    return img


def process_video(model, video_path, save_path, class_dict, confidence=0.4):
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Cannot open video file: {video_path}")

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out = cv2.VideoWriter(save_path, fourcc, fps, (width, height))

        tracker = sv.ByteTrack(frame_rate=fps)
        seen_track_ids = set()
        tag_counter = defaultdict(int)

        for _ in range(frame_count):
            ret, frame = cap.read()
            if not ret:
                break

            result = model.predict(frame, conf=confidence, verbose=False)[0]
            detections = sv.Detections.from_ultralytics(result)
            detections = tracker.update_with_detections(detections)

            labels = [class_dict[int(cls)] for cls in detections.class_id]

            for track_id, label in zip(detections.tracker_id, labels):
                if track_id is not None and track_id not in seen_track_ids:
                    seen_track_ids.add(track_id)
                    tag_counter[label] += 1

            annotated = annotate_image(frame, detections, class_dict, confidence)
            out.write(annotated)

        cap.release()
        out.release()

        return dict(tag_counter)

    except Exception as e:
        print(f"[ERROR] Failed to process video: {e}")
        raise