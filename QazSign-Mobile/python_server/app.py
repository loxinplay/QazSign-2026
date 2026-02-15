    #!/usr/bin/env python3
    import os
    import io
    import base64
    import numpy as np
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    from PIL import Image
    import cv2
    import urllib.request

    os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

    import mediapipe as mp
    from mediapipe.tasks import python as mp_python
    from mediapipe.tasks.python import vision
    import tensorflow as tf

app = Flask(__name__)
CORS(app)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, '..', 'attached_assets', 'action_02142025_1769541525474.h5')
MODELS_DIR = os.path.join(SCRIPT_DIR, 'models')

actions = [
    'сәлеметсіз бе',
    'сау болыңыз', 
    'аты',
    'тегі',
    'әкесінің аты',
    'бір',
    'мектеп'
]

hand_landmarker = None
gesture_model = None
frame_sequences = {}

def download_hand_model():
    os.makedirs(MODELS_DIR, exist_ok=True)
    filepath = os.path.join(MODELS_DIR, 'hand_landmarker.task')
    if not os.path.exists(filepath):
        print("Downloading hand landmarker model...")
        url = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
        urllib.request.urlretrieve(url, filepath)
        print("Downloaded hand landmarker model")
    return filepath

def init_models():
    global hand_landmarker, gesture_model
    
    print("Initializing hand landmarker...")
    model_path = download_hand_model()
    
    hand_options = vision.HandLandmarkerOptions(
        base_options=mp_python.BaseOptions(model_asset_path=model_path),
        num_hands=2,
        min_hand_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    hand_landmarker = vision.HandLandmarker.create_from_options(hand_options)
    
    print(f"Loading gesture model from {MODEL_PATH}...")
    gesture_model = tf.keras.models.load_model(MODEL_PATH)
    print(f"Model input shape: {gesture_model.input_shape}")
    print("Models loaded successfully!")

def extract_keypoints(hand_result):
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
    
    return np.concatenate([lh, rh])

def process_image(image_base64):
    if ',' in image_base64:
        image_base64 = image_base64.split(',')[1]
    
    image_bytes = base64.b64decode(image_base64)
    image = Image.open(io.BytesIO(image_bytes))
    frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
    hand_result = hand_landmarker.detect(mp_image)
    
    keypoints = extract_keypoints(hand_result)
    return keypoints

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok', 
        'models_loaded': hand_landmarker is not None and gesture_model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        session_id = data.get('session_id', 'default')
        
        if session_id not in frame_sequences:
            frame_sequences[session_id] = []
        
        keypoints = process_image(data['image'])
        
        frame_sequences[session_id].append(keypoints)
        frame_sequences[session_id] = frame_sequences[session_id][-30:]
        
        current_length = len(frame_sequences[session_id])
        
        if current_length < 30:
            return jsonify({
                'status': 'collecting',
                'frames_collected': current_length,
                'frames_needed': 30,
                'message': f'Collecting frames: {current_length}/30'
            })
        
        sequence = np.array(frame_sequences[session_id])
        sequence = np.expand_dims(sequence, axis=0)
        
        prediction = gesture_model.predict(sequence, verbose=0)
        action_idx = int(np.argmax(prediction))
        confidence = float(np.max(prediction))
        
        threshold = 0.5
        predicted_word = actions[action_idx]
        
        return jsonify({
            'status': 'recognized' if confidence > threshold else 'low_confidence',
            'word': predicted_word,
            'confidence': confidence,
            'action_index': action_idx,
            'message': 'Streaming prediction' if confidence > threshold else 'Low confidence'
        })
            
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/reset', methods=['POST'])
def reset_session():
    data = request.get_json() or {}
    session_id = data.get('session_id', 'default')
    
    if session_id in frame_sequences:
        frame_sequences[session_id] = []
    
    return jsonify({'status': 'reset', 'session_id': session_id})

@app.route('/actions', methods=['GET'])
def get_actions():
    return jsonify({'actions': actions})

if __name__ == '__main__':
    init_models()
    port = int(os.environ.get('PYTHON_PORT', 5001))
    print(f"Starting Flask server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)
