#!/usr/bin/env python3
import sys
import json
import os
import base64
import io
import numpy as np
from PIL import Image
import cv2

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import tensorflow as tf
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, '..', 'attached_assets', 'action_02142025_1769541525474.h5')
MODELS_DIR = os.path.join(SCRIPT_DIR, 'models')
SEQUENCES_DIR = os.path.join(SCRIPT_DIR, 'sequences')

actions = [
    'сәлеметсіз бе',
    'сау болыңыз', 
    'аты',
    'тегі',
    'әкесінің аты',
    'бір',
    'мектеп'
]

def download_model_files():
    import urllib.request
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    models = {
        'hand_landmarker.task': 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        'pose_landmarker_lite.task': 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        'face_landmarker.task': 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
    }
    
    for filename, url in models.items():
        filepath = os.path.join(MODELS_DIR, filename)
        if not os.path.exists(filepath):
            urllib.request.urlretrieve(url, filepath)

def extract_keypoints(hand_result, pose_result, face_result):
    pose = np.zeros(33*4)
    if pose_result.pose_landmarks and len(pose_result.pose_landmarks) > 0:
        landmarks = pose_result.pose_landmarks[0]
        pose = np.array([[lm.x, lm.y, lm.z, lm.visibility] for lm in landmarks]).flatten()
    
    face = np.zeros(468*3)
    if face_result.face_landmarks and len(face_result.face_landmarks) > 0:
        landmarks = face_result.face_landmarks[0]
        face = np.array([[lm.x, lm.y, lm.z] for lm in landmarks]).flatten()
    
    lh = np.zeros(21*3)
    rh = np.zeros(21*3)
    
    if hand_result.hand_landmarks:
        for i, hand_landmarks in enumerate(hand_result.hand_landmarks):
            handedness = hand_result.handedness[i][0].category_name
            coords = np.array([[lm.x, lm.y, lm.z] for lm in hand_landmarks]).flatten()
            if handedness == 'Left':
                lh = coords
            else:
                rh = coords
    
    return np.concatenate([pose, face, lh, rh])

def main():
    if len(sys.argv) < 3:
        print(json.dumps({'error': 'Missing arguments: session_id and frame_file'}))
        sys.exit(1)
    
    session_id = sys.argv[1]
    frame_file = sys.argv[2]
    
    os.makedirs(SEQUENCES_DIR, exist_ok=True)
    sequence_file = os.path.join(SEQUENCES_DIR, f'{session_id}.npy')
    
    try:
        with open(frame_file, 'r') as f:
            image_base64 = f.read()
        
        download_model_files()
        
        hand_options = vision.HandLandmarkerOptions(
            base_options=mp_python.BaseOptions(
                model_asset_path=os.path.join(MODELS_DIR, 'hand_landmarker.task')
            ),
            num_hands=2,
            min_hand_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        hand_landmarker = vision.HandLandmarker.create_from_options(hand_options)
        
        pose_options = vision.PoseLandmarkerOptions(
            base_options=mp_python.BaseOptions(
                model_asset_path=os.path.join(MODELS_DIR, 'pose_landmarker_lite.task')
            ),
            min_pose_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        pose_landmarker = vision.PoseLandmarker.create_from_options(pose_options)
        
        face_options = vision.FaceLandmarkerOptions(
            base_options=mp_python.BaseOptions(
                model_asset_path=os.path.join(MODELS_DIR, 'face_landmarker.task')
            ),
            num_faces=1,
            min_face_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        face_landmarker = vision.FaceLandmarker.create_from_options(face_options)
        
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        image_bytes = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_bytes))
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        
        hand_result = hand_landmarker.detect(mp_image)
        pose_result = pose_landmarker.detect(mp_image)
        face_result = face_landmarker.detect(mp_image)
        
        keypoints = extract_keypoints(hand_result, pose_result, face_result)
        
        if os.path.exists(sequence_file):
            sequence = np.load(sequence_file, allow_pickle=True).tolist()
        else:
            sequence = []
        
        sequence.append(keypoints)
        sequence = sequence[-30:]
        
        np.save(sequence_file, np.array(sequence, dtype=object), allow_pickle=True)
        
        current_length = len(sequence)
        
        if current_length < 30:
            result = {
                'status': 'collecting',
                'frames_collected': current_length,
                'frames_needed': 30,
                'message': f'Collecting frames: {current_length}/30'
            }
        else:
            gesture_model = tf.keras.models.load_model(MODEL_PATH)
            seq_array = np.array(sequence)
            seq_array = np.expand_dims(seq_array, axis=0)
            
            prediction = gesture_model.predict(seq_array, verbose=0)
            action_idx = int(np.argmax(prediction))
            confidence = float(np.max(prediction))
            
            threshold = 0.7
            
            if confidence > threshold:
                os.remove(sequence_file)
                result = {
                    'status': 'recognized',
                    'word': actions[action_idx],
                    'confidence': confidence,
                    'action_index': action_idx
                }
            else:
                result = {
                    'status': 'low_confidence',
                    'confidence': confidence,
                    'message': 'Gesture not clear enough, please try again'
                }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
