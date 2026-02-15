# QazSign - Kazakh Sign Language Mobile App

## Overview
QazSign is a mobile application designed to support learning, searching, and translating Kazakh Sign Language (KSL). The app features a dictionary of gestures, search and learning tools, and a camera-based AI translation interface.

## Current State
- MVP implementation complete with AI integration
- Three main tabs: Dictionary, Translate, Learn
- Local storage with AsyncStorage for user preferences, saved gestures, learning progress, and recognition history
- Real-time camera gesture recognition using MediaPipe and TensorFlow
- Sliding window prediction for instant recognition after initial buffer
- Text-to-Speech for recognized gestures
- Quiz mode for learning practice
- Recognition history tracking

## AI Gesture Recognition
The app uses a custom-trained Keras model for gesture recognition:
- **Model**: TensorFlow/Keras .h5 format, input shape (30, 126)
- **Input**: 30 frames with 126 hand keypoints only (21*3 left hand + 21*3 right hand)
- **Output**: Predicted gesture word with confidence >0.5
- **Recognized gestures**: сәлеметсіз бе, сау болыңыз, аты, тегі, әкесінің аты, бір, мектеп
- **Sliding Window**: After initial 30 frames, each new frame triggers instant prediction

### AI Architecture
```
Mobile Camera → Frames (80ms interval) → Express API → Flask Python Server (port 5001)
                                                              ↓
                                              MediaPipe Hand Landmarker (Tasks API 0.10+)
                                                              ↓
                                              Hand keypoints extraction (126 features)
                                                              ↓
                                              Sliding window buffer (last 30 frames)
                                                              ↓
                                              TensorFlow model prediction
                                                              ↓
                                              Recognized word + TTS → Mobile App
```

### Key Implementation Details
- Python Flask server runs as child process of Express (spawned at startup)
- MediaPipe uses Tasks API (mp.tasks.vision.HandLandmarker) not legacy mp.solutions
- Hand landmarks extracted for both hands (21 landmarks * 3 coords * 2 hands = 126)
- Models loaded once at startup for sub-second prediction latency
- Sliding window: after 30 frames, each new frame triggers instant prediction
- Camera optimizations: 80ms interval, quality 0.1, no shutter sound, no EXIF

## Project Structure
```
client/
├── App.tsx                    # Root app component with providers
├── components/                # Reusable UI components
├── constants/
│   └── theme.ts              # Colors, spacing, typography
├── hooks/
├── lib/
│   ├── query-client.ts       # API client setup
│   └── storage.ts            # AsyncStorage utilities (preferences, progress, history)
├── navigation/
└── screens/
    ├── DictionaryScreen.tsx  # Browse KSL gestures
    ├── GestureDetailScreen.tsx
    ├── HistoryScreen.tsx     # Recognition history
    ├── LearnScreen.tsx       # Saved gestures, progress stats, quiz access
    ├── QuizScreen.tsx        # Interactive quiz mode
    ├── SettingsScreen.tsx    # User preferences (name, language, TTS, contrast)
    └── TranslateScreen.tsx   # Camera translation with AI + TTS

python_server/
├── app.py                    # Flask server with AI endpoints
├── models/                   # Downloaded MediaPipe models (hand_landmarker.task)
└── sequences/                # Stored frame sequences

shared/
└── schema.ts                 # Data types, gestures (25+), categories (7)

server/
├── index.ts                  # Express server entry
├── routes.ts                 # API routes including AI endpoints
└── storage.ts                # Server storage

attached_assets/
└── action_02142025_1769541525474.h5  # Trained gesture model
```

## API Endpoints
- `POST /api/ai/predict` - Process camera frame and return prediction (sliding window)
- `POST /api/ai/reset` - Reset session and clear frame buffer
- `GET /api/ai/health` - Health check for AI service
- `GET /api/ai/actions` - List supported gestures

## Key Features
1. **Dictionary** - Browse and search 25+ KSL gestures by 7 categories
2. **Translate** - Real-time camera gesture recognition with sliding window + TTS
3. **Learn** - Progress tracking, stats, saved gestures, quiz access
4. **Quiz** - Interactive 5-question quizzes with scoring and streak tracking
5. **History** - View all recognized gestures with timestamps and confidence
6. **Settings** - Display name, language (KZ/RU), TTS toggle, high contrast mode

## Data Storage (AsyncStorage)
- **User Preferences**: displayName, language, highContrastMode, ttsEnabled
- **Saved Gestures**: gestureId, savedAt
- **Learning Progress**: gesturesLearned[], quizzesTaken, correctAnswers, totalAnswers, currentStreak, bestStreak
- **Recognition History**: word, confidence, timestamp (last 100 entries)

## Design Guidelines
- Primary color: #1A73E8 (deep blue)
- High contrast design for accessibility
- Large, readable typography
- Split-screen translation interface with ultra-large text output

## Tech Stack
- Expo React Native (Expo Go compatible)
- React Navigation 7
- AsyncStorage for local persistence
- expo-camera for camera access
- expo-haptics for tactile feedback
- expo-speech for Text-to-Speech
- Python + TensorFlow + MediaPipe for AI

## Running the App
- Frontend: `npm run expo:dev` (port 8081)
- Backend: `npm run server:dev` (port 5000)
- AI processing runs via Flask server (port 5001, started by Express as child process)

## Future Enhancements
- External device integration (smart glasses)
- Video playback for gestures
- 3D gesture visualization
- Additional sign languages
- Offline mode (on-device model)
