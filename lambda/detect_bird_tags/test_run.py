# test_detect.py

import os
from handler import run_image_detection, run_video_detection

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def test_image():
    print("\n=== Running Image Detection ===")
    # print("[INFO] ultralytics version:", ultralytics.__version__)

    input_path = os.path.join(BASE_DIR, "test_images", "crows_1.jpg")
    output_path = os.path.join(BASE_DIR, "..", "..", "test_output", "annotated_crows_1.jpg")

    try:
        result = run_image_detection(image_path=input_path, save_path=output_path,bucket="test")
        print("Detection Result (Image):")
        for k, v in result.items():
            print(f"  {k}: {v}")
    except Exception as e:
        print("[ERROR] Image detection failed:")
        print(e)

def test_video():
    print("\n=== Running Video Detection ===")
    # print("[INFO] ultralytics version:", ultralytics.__version__)

    input_path = os.path.join(BASE_DIR, "test_videos", "kingfisher.mp4")
    output_path = os.path.join(BASE_DIR, "..", "..", "test_output", "annotated_kingfisher.mp4")

    try:
        result = run_video_detection(video_path=input_path, save_path=output_path, bucket="test")
        print("Detection Result (Video):")
        for k, v in result.items():
            print(f"  {k}: {v}")
    except Exception as e:
        print("[ERROR] Video detection failed:")
        print(e)

if __name__ == "__main__":
    os.makedirs(os.path.join(BASE_DIR, "..", "..", "test_output"), exist_ok=True)

    test_image()
    # test_video()  

