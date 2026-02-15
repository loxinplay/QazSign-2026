import React, { useState, useRef, useEffect, useCallback } from "react";
import { StyleSheet, View, Platform, Linking, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import * as Speech from "expo-speech";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Typography } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { addToRecognitionHistory, getUserPreferences } from "@/lib/storage";

const FRAME_INTERVAL_MS = 80;

interface PredictionResponse {
  status: 'collecting' | 'recognized' | 'low_confidence';
  word?: string;
  confidence?: number;
  frames_collected?: number;
  frames_needed?: number;
  message?: string;
  error?: string;
}

export default function TranslateScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [framesCollected, setFramesCollected] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const cameraRef = useRef<CameraView>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIdRef = useRef<string>(`session_${Date.now()}`);
  const isCapturingRef = useRef<boolean>(false);
  const lastSpokenWordRef = useRef<string>("");

  useEffect(() => {
    getUserPreferences().then((prefs) => {
      setTtsEnabled(prefs.ttsEnabled);
    });
  }, []);

  const speakWord = useCallback((word: string) => {
    if (ttsEnabled && word && word !== lastSpokenWordRef.current) {
      lastSpokenWordRef.current = word;
      Speech.speak(word, {
        language: 'kk-KZ',
        rate: 0.9,
      });
    }
  }, [ttsEnabled]);

  const sendFrameToAI = useCallback(async (base64Image: string) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(new URL('/api/ai/predict', apiUrl).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          session_id: sessionIdRef.current,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: PredictionResponse = await response.json();
      
      if (data.status === 'collecting') {
        setFramesCollected(data.frames_collected || 0);
        setStatusMessage(`Analyzing... ${data.frames_collected}/${data.frames_needed}`);
      } else if (data.status === 'recognized' && data.word) {
        setTranslatedText(data.word);
        setStatusMessage(`${Math.round((data.confidence || 0) * 100)}% confidence`);
        setFramesCollected(30);
        speakWord(data.word);
        addToRecognitionHistory(data.word, data.confidence || 0);
      } else if (data.status === 'low_confidence') {
        if (data.word) {
          setTranslatedText(data.word + '?');
        }
        setStatusMessage('Low confidence - show gesture clearer');
      }
    } catch (error) {
      console.error('Frame processing error:', error);
      setStatusMessage('Connection error...');
    }
  }, []);

  const captureFrame = useCallback(async () => {
    if (!cameraRef.current || !isRecording || isCapturingRef.current) return;

    isCapturingRef.current = true;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.1,
        skipProcessing: true,
        shutterSound: false,
        exif: false,
      });

      if (photo?.base64) {
        sendFrameToAI(photo.base64);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '';
      if (!errorMsg.includes('unmounted')) {
        console.error('Capture error:', error);
      }
    } finally {
      isCapturingRef.current = false;
    }
  }, [isRecording, sendFrameToAI]);

  useEffect(() => {
    if (isRecording && Platform.OS !== 'web') {
      intervalRef.current = setInterval(captureFrame, FRAME_INTERVAL_MS);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRecording, captureFrame]);

  const resetSession = useCallback(async () => {
    try {
      const apiUrl = getApiUrl();
      await fetch(new URL('/api/ai/reset', apiUrl).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionIdRef.current }),
      });
    } catch (error) {
      console.error('Reset error:', error);
    }
  }, []);

  const handleRecordToggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (isRecording) {
      setIsRecording(false);
      setStatusMessage("");
      setFramesCollected(0);
      await resetSession();
    } else {
      sessionIdRef.current = `session_${Date.now()}`;
      setIsRecording(true);
      setStatusMessage("Starting recognition...");
      setFramesCollected(0);
    }
  };

  const handleCopy = async () => {
    if (translatedText) {
      await Clipboard.setStringAsync(translatedText);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleClear = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTranslatedText("");
    setStatusMessage("");
    setFramesCollected(0);
    await resetSession();
  };

  if (!permission) {
    return (
      <ThemedView style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={{ marginTop: Spacing.md }}>Loading camera...</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    if (permission.status === "denied" && !permission.canAskAgain) {
      return (
        <ThemedView style={[styles.permissionContainer, { paddingBottom: insets.bottom }]}>
          <ThemedText style={styles.permissionTitle}>Camera Access Required</ThemedText>
          <ThemedText style={[styles.permissionText, { color: theme.textSecondary }]}>
            QazSign needs camera access to recognize sign language gestures. Please enable it in Settings.
          </ThemedText>
          {Platform.OS !== "web" ? (
            <Button
              onPress={async () => {
                try {
                  await Linking.openSettings();
                } catch (error) {
                  console.error("Could not open settings");
                }
              }}
              style={styles.permissionButton}
            >
              Open Settings
            </Button>
          ) : null}
        </ThemedView>
      );
    }

    return (
      <ThemedView style={[styles.permissionContainer, { paddingBottom: insets.bottom }]}>
        <ThemedText style={styles.permissionTitle}>Camera Access Required</ThemedText>
        <ThemedText style={[styles.permissionText, { color: theme.textSecondary }]}>
          QazSign needs camera access to recognize sign language gestures.
        </ThemedText>
        <Button onPress={requestPermission} style={styles.permissionButton}>
          Enable Camera
        </Button>
      </ThemedView>
    );
  }

  const renderWebFallback = () => (
    <View style={[styles.webFallback, { backgroundColor: theme.backgroundSecondary }]}>
      <ThemedText style={styles.webFallbackText}>
        Camera gesture recognition works best on mobile devices.
      </ThemedText>
      <ThemedText style={[styles.webFallbackSubtext, { color: theme.textSecondary }]}>
        Scan the QR code with Expo Go to test on your phone.
      </ThemedText>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.cameraContainer, { paddingTop: insets.top }]}>
        {Platform.OS === 'web' ? (
          renderWebFallback()
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
          />
        )}
        {isRecording ? (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <ThemedText style={styles.recordingText}>
              {statusMessage || 'Recording...'}
            </ThemedText>
          </View>
        ) : null}
        {isRecording && framesCollected > 0 ? (
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${(framesCollected / 30) * 100}%`,
                  backgroundColor: theme.primary 
                }
              ]} 
            />
          </View>
        ) : null}
      </View>

      <View style={[styles.divider, { backgroundColor: theme.divider }]} />

      <View style={styles.translationContainer}>
        {translatedText ? (
          <ThemedText style={styles.translatedText}>{translatedText}</ThemedText>
        ) : isRecording ? (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color={theme.primary} />
            <ThemedText style={[styles.statusText, { color: theme.textMuted, marginTop: Spacing.sm }]}>
              {statusMessage || 'Recognizing...'}
            </ThemedText>
          </View>
        ) : (
          <ThemedText style={[styles.statusText, { color: theme.textMuted }]}>
            Tap camera button to start
          </ThemedText>
        )}
      </View>

      <View style={[styles.controlsContainer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <FloatingActionButton
          icon="trash-2"
          onPress={handleClear}
          size="small"
          variant="secondary"
        />
        <FloatingActionButton
          icon={isRecording ? "square" : "video"}
          onPress={handleRecordToggle}
          size="large"
          variant="primary"
          isActive={isRecording}
        />
        <FloatingActionButton
          icon="copy"
          onPress={handleCopy}
          size="small"
          variant="secondary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  permissionButton: {
    width: "100%",
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  webFallbackText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  webFallbackSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  recordingIndicator: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.xl,
    borderRadius: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EA4335",
    marginRight: Spacing.sm,
  },
  recordingText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressBar: {
    height: '100%',
  },
  divider: {
    height: 2,
  },
  translationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  translatedText: {
    ...Typography.hero,
    textAlign: "center",
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    textAlign: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xl,
    paddingTop: Spacing.lg,
  },
});
