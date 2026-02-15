import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, Typography } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { SAMPLE_GESTURES, Gesture } from "../../shared/schema";
import { updateQuizStats, incrementQuizzesTaken, markGestureAsLearned, getUserPreferences } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const QUESTIONS_PER_QUIZ = 5;

interface QuizQuestion {
  gesture: Gesture;
  options: string[];
  correctAnswer: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateQuestions(): QuizQuestion[] {
  const shuffledGestures = shuffleArray(SAMPLE_GESTURES);
  const selectedGestures = shuffledGestures.slice(0, QUESTIONS_PER_QUIZ);
  
  return selectedGestures.map((gesture) => {
    const otherGestures = SAMPLE_GESTURES.filter((g) => g.id !== gesture.id);
    const wrongAnswers = shuffleArray(otherGestures).slice(0, 3).map((g) => g.word);
    const options = shuffleArray([gesture.word, ...wrongAnswers]);
    
    return {
      gesture,
      options,
      correctAnswer: gesture.word,
    };
  });
}

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [language, setLanguage] = useState<"kazakh" | "russian">("kazakh");

  useEffect(() => {
    setQuestions(generateQuestions());
    incrementQuizzesTaken();
    getUserPreferences().then((prefs) => setLanguage(prefs.language));
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = useCallback(async (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCorrectCount((prev) => prev + 1);
      await markGestureAsLearned(currentQuestion.gesture.id);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    await updateQuizStats(isCorrect);
  }, [isAnswered, currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, questions.length]);

  const handleRestart = useCallback(() => {
    setQuestions(generateQuestions());
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setIsComplete(false);
    incrementQuizzesTaken();
  }, []);

  if (questions.length === 0) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (isComplete) {
    const percentage = Math.round((correctCount / questions.length) * 100);
    const isGreat = percentage >= 80;
    const isGood = percentage >= 60;

    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top + Spacing.xl }]}>
        <View style={styles.resultContainer}>
          <View style={[styles.resultIcon, { backgroundColor: isGreat ? theme.success : isGood ? theme.warning : theme.error }]}>
            <Feather 
              name={isGreat ? "award" : isGood ? "thumbs-up" : "refresh-cw"} 
              size={48} 
              color="#fff" 
            />
          </View>
          
          <ThemedText style={styles.resultTitle}>
            {isGreat ? (language === "russian" ? "Отлично!" : "Керемет!") : 
             isGood ? (language === "russian" ? "Хорошо!" : "Жақсы!") : 
             (language === "russian" ? "Попробуйте ещё!" : "Қайта көріңіз!")}
          </ThemedText>
          
          <ThemedText style={styles.resultScore}>
            {correctCount} / {questions.length}
          </ThemedText>
          
          <ThemedText style={[styles.resultPercentage, { color: theme.textSecondary }]}>
            {percentage}% {language === "russian" ? "правильных ответов" : "дұрыс жауап"}
          </ThemedText>

          <View style={styles.resultButtons}>
            <Pressable
              style={[styles.resultButton, { backgroundColor: theme.primary }]}
              onPress={handleRestart}
            >
              <Feather name="refresh-cw" size={20} color="#fff" />
              <ThemedText style={styles.resultButtonText}>
                {language === "russian" ? "Ещё раз" : "Қайтадан"}
              </ThemedText>
            </Pressable>

            <Pressable
              style={[styles.resultButton, { backgroundColor: theme.surfaceElevated }]}
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={20} color={theme.text} />
              <ThemedText style={[styles.resultButtonText, { color: theme.text }]}>
                {language === "russian" ? "Назад" : "Артқа"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: theme.primary,
                width: `${((currentIndex + 1) / questions.length) * 100}%` 
              }
            ]} 
          />
        </View>
        <ThemedText style={styles.progressText}>
          {currentIndex + 1} / {questions.length}
        </ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.questionLabel}>
          {language === "russian" ? "Какой это жест?" : "Бұл қандай ишара?"}
        </ThemedText>
        
        <Card style={styles.questionCard}>
          <ThemedText style={styles.questionDescription}>
            {language === "russian" 
              ? currentQuestion.gesture.descriptionRu || currentQuestion.gesture.description
              : currentQuestion.gesture.description}
          </ThemedText>
          <View style={[styles.categoryBadge, { backgroundColor: theme.primaryLight }]}>
            <ThemedText style={[styles.categoryText, { color: theme.primary }]}>
              {currentQuestion.gesture.category}
            </ThemedText>
          </View>
        </Card>

        <View style={styles.options}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correctAnswer;
            
            let backgroundColor = theme.surfaceElevated;
            let borderColor = theme.border;
            
            if (isAnswered) {
              if (isCorrect) {
                backgroundColor = theme.successLight;
                borderColor = theme.success;
              } else if (isSelected && !isCorrect) {
                backgroundColor = theme.errorLight;
                borderColor = theme.error;
              }
            } else if (isSelected) {
              borderColor = theme.primary;
            }

            return (
              <Pressable
                key={index}
                style={[
                  styles.optionButton,
                  { backgroundColor, borderColor }
                ]}
                onPress={() => handleAnswer(option)}
                disabled={isAnswered}
              >
                <ThemedText style={styles.optionText}>{option}</ThemedText>
                {isAnswered && isCorrect && (
                  <Feather name="check-circle" size={24} color={theme.success} />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <Feather name="x-circle" size={24} color={theme.error} />
                )}
              </Pressable>
            );
          })}
        </View>

        {isAnswered && (
          <Pressable
            style={[styles.nextButton, { backgroundColor: theme.primary }]}
            onPress={handleNext}
          >
            <ThemedText style={styles.nextButtonText}>
              {currentIndex < questions.length - 1 
                ? (language === "russian" ? "Далее" : "Келесі")
                : (language === "russian" ? "Результаты" : "Нәтижелер")}
            </ThemedText>
            <Feather name="arrow-right" size={20} color="#fff" />
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    textAlign: "center",
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.sm,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  questionLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: "600",
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  questionCard: {
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  questionDescription: {
    fontSize: Typography.sizes.lg,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: Typography.sizes.sm,
    fontWeight: "500",
  },
  options: {
    gap: Spacing.md,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionText: {
    fontSize: Typography.sizes.md,
    fontWeight: "500",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: 12,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: Typography.sizes.md,
    fontWeight: "600",
  },
  resultContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  resultIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  resultTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  resultPercentage: {
    fontSize: Typography.sizes.md,
    marginBottom: Spacing.xxl,
  },
  resultButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  resultButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  resultButtonText: {
    color: "#fff",
    fontSize: Typography.sizes.md,
    fontWeight: "600",
  },
});
