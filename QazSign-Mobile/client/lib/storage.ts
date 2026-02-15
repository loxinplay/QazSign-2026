import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserPreferences, SavedGesture, LearningProgress, RecognitionHistoryItem } from "../../shared/schema";

const KEYS = {
  USER_PREFERENCES: "@qazsign/user_preferences",
  SAVED_GESTURES: "@qazsign/saved_gestures",
  LEARNING_PROGRESS: "@qazsign/learning_progress",
  RECOGNITION_HISTORY: "@qazsign/recognition_history",
};

export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PREFERENCES);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error getting user preferences:", error);
  }
  return {
    displayName: "User",
    language: "kazakh",
    highContrastMode: false,
    ttsEnabled: true,
  };
}

export async function setUserPreferences(preferences: UserPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error("Error setting user preferences:", error);
    throw error;
  }
}

export async function getSavedGestures(): Promise<SavedGesture[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SAVED_GESTURES);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error getting saved gestures:", error);
  }
  return [];
}

export async function saveGesture(gestureId: string): Promise<void> {
  try {
    const saved = await getSavedGestures();
    const exists = saved.some((g) => g.gestureId === gestureId);
    if (!exists) {
      saved.push({ gestureId, savedAt: new Date().toISOString() });
      await AsyncStorage.setItem(KEYS.SAVED_GESTURES, JSON.stringify(saved));
    }
  } catch (error) {
    console.error("Error saving gesture:", error);
    throw error;
  }
}

export async function removeGesture(gestureId: string): Promise<void> {
  try {
    const saved = await getSavedGestures();
    const filtered = saved.filter((g) => g.gestureId !== gestureId);
    await AsyncStorage.setItem(KEYS.SAVED_GESTURES, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing gesture:", error);
    throw error;
  }
}

export async function isGestureSaved(gestureId: string): Promise<boolean> {
  const saved = await getSavedGestures();
  return saved.some((g) => g.gestureId === gestureId);
}

export async function getLearningProgress(): Promise<LearningProgress> {
  try {
    const data = await AsyncStorage.getItem(KEYS.LEARNING_PROGRESS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error getting learning progress:", error);
  }
  return {
    gesturesLearned: [],
    quizzesTaken: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastActivityDate: undefined,
  };
}

export async function updateLearningProgress(updates: Partial<LearningProgress>): Promise<void> {
  try {
    const current = await getLearningProgress();
    const updated = { ...current, ...updates };
    await AsyncStorage.setItem(KEYS.LEARNING_PROGRESS, JSON.stringify(updated));
  } catch (error) {
    console.error("Error updating learning progress:", error);
    throw error;
  }
}

export async function markGestureAsLearned(gestureId: string): Promise<void> {
  try {
    const progress = await getLearningProgress();
    if (!progress.gesturesLearned.includes(gestureId)) {
      progress.gesturesLearned.push(gestureId);
      await updateLearningProgress(progress);
    }
  } catch (error) {
    console.error("Error marking gesture as learned:", error);
    throw error;
  }
}

export async function updateQuizStats(correct: boolean): Promise<void> {
  try {
    const progress = await getLearningProgress();
    const today = new Date().toDateString();
    const lastDate = progress.lastActivityDate ? new Date(progress.lastActivityDate).toDateString() : null;
    
    let newStreak = progress.currentStreak;
    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate === yesterday.toDateString()) {
        newStreak = progress.currentStreak + 1;
      } else {
        newStreak = 1;
      }
    }

    await updateLearningProgress({
      totalAnswers: progress.totalAnswers + 1,
      correctAnswers: correct ? progress.correctAnswers + 1 : progress.correctAnswers,
      currentStreak: newStreak,
      bestStreak: Math.max(progress.bestStreak, newStreak),
      lastActivityDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating quiz stats:", error);
    throw error;
  }
}

export async function incrementQuizzesTaken(): Promise<void> {
  try {
    const progress = await getLearningProgress();
    await updateLearningProgress({
      quizzesTaken: progress.quizzesTaken + 1,
    });
  } catch (error) {
    console.error("Error incrementing quizzes:", error);
    throw error;
  }
}

export async function getRecognitionHistory(): Promise<RecognitionHistoryItem[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.RECOGNITION_HISTORY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error getting recognition history:", error);
  }
  return [];
}

export async function addToRecognitionHistory(word: string, confidence: number): Promise<void> {
  try {
    const history = await getRecognitionHistory();
    const newItem: RecognitionHistoryItem = {
      id: Date.now().toString(),
      word,
      confidence,
      timestamp: new Date().toISOString(),
    };
    history.unshift(newItem);
    const trimmed = history.slice(0, 100);
    await AsyncStorage.setItem(KEYS.RECOGNITION_HISTORY, JSON.stringify(trimmed));
  } catch (error) {
    console.error("Error adding to recognition history:", error);
    throw error;
  }
}

export async function clearRecognitionHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.RECOGNITION_HISTORY);
  } catch (error) {
    console.error("Error clearing recognition history:", error);
    throw error;
  }
}
