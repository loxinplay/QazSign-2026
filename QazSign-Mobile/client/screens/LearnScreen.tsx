import React, { useState, useCallback } from "react";
import { FlatList, View, StyleSheet, RefreshControl, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, Typography } from "@/constants/theme";
import { UserProfileCard } from "@/components/UserProfileCard";
import { GestureCard } from "@/components/GestureCard";
import { EmptyState } from "@/components/EmptyState";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { getSavedGestures, getUserPreferences, getLearningProgress } from "@/lib/storage";
import { SAMPLE_GESTURES, Gesture, UserPreferences, LearningProgress } from "../../shared/schema";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [savedGestures, setSavedGestures] = useState<Gesture[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    displayName: "User",
    language: "kazakh",
    highContrastMode: false,
    ttsEnabled: true,
  });
  const [progress, setProgress] = useState<LearningProgress>({
    gesturesLearned: [],
    quizzesTaken: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [savedIds, prefs, prog] = await Promise.all([
        getSavedGestures(),
        getUserPreferences(),
        getLearningProgress(),
      ]);

      const gestures = savedIds
        .map((s) => SAMPLE_GESTURES.find((g) => g.id === s.gestureId))
        .filter((g): g is Gesture => g !== undefined);

      setSavedGestures(gestures);
      setPreferences(prefs);
      setProgress(prog);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData();
  }, [loadData]);

  const handleGesturePress = useCallback((gesture: Gesture) => {
    navigation.navigate("GestureDetail", { gestureId: gesture.id });
  }, [navigation]);

  const handleEditProfile = useCallback(() => {
    navigation.navigate("Settings");
  }, [navigation]);

  const handleQuiz = useCallback(() => {
    navigation.navigate("Quiz");
  }, [navigation]);

  const handleHistory = useCallback(() => {
    navigation.navigate("History");
  }, [navigation]);

  const accuracy = progress.totalAnswers > 0 
    ? Math.round((progress.correctAnswers / progress.totalAnswers) * 100) 
    : 0;

  const isRussian = preferences.language === "russian";

  const renderItem = useCallback(({ item }: { item: Gesture }) => (
    <GestureCard
      gesture={item}
      onPress={() => handleGesturePress(item)}
      isSaved
    />
  ), [handleGesturePress]);

  const keyExtractor = useCallback((item: Gesture) => item.id, []);

  const ListEmptyComponent = (
    <EmptyState
      icon="bookmark"
      title={isRussian ? "Нет сохранённых жестов" : "Сақталған ишаралар жоқ"}
      description={isRussian 
        ? "Сохраняйте жесты из словаря для практики" 
        : "Жаттығу үшін сөздіктен ишараларды сақтаңыз"}
    />
  );

  const ListHeaderComponent = (
    <View>
      <UserProfileCard
        displayName={preferences.displayName}
        onEditPress={handleEditProfile}
      />

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Feather name="book-open" size={24} color={theme.primary} />
          <ThemedText style={styles.statValue}>{progress.gesturesLearned.length}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            {isRussian ? "Выучено" : "Үйренілді"}
          </ThemedText>
        </Card>

        <Card style={styles.statCard}>
          <Feather name="target" size={24} color={theme.success} />
          <ThemedText style={styles.statValue}>{accuracy}%</ThemedText>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            {isRussian ? "Точность" : "Дәлдік"}
          </ThemedText>
        </Card>

        <Card style={styles.statCard}>
          <Feather name="zap" size={24} color={theme.warning} />
          <ThemedText style={styles.statValue}>{progress.currentStreak}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            {isRussian ? "Серия" : "Қатар"}
          </ThemedText>
        </Card>

        <Card style={styles.statCard}>
          <Feather name="award" size={24} color={theme.error} />
          <ThemedText style={styles.statValue}>{progress.quizzesTaken}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            {isRussian ? "Тестов" : "Тест"}
          </ThemedText>
        </Card>
      </View>

      <View style={styles.actionButtons}>
        <Pressable 
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={handleQuiz}
        >
          <Feather name="play-circle" size={24} color="#fff" />
          <ThemedText style={styles.actionButtonText}>
            {isRussian ? "Начать квиз" : "Квиз бастау"}
          </ThemedText>
        </Pressable>

        <Pressable 
          style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}
          onPress={handleHistory}
        >
          <Feather name="clock" size={24} color={theme.text} />
          <ThemedText style={[styles.actionButtonText, { color: theme.text }]}>
            {isRussian ? "История" : "Тарих"}
          </ThemedText>
        </Pressable>
      </View>

      <ThemedText style={styles.sectionTitle}>
        {isRussian ? "Сохранённые жесты" : "Сақталған ишаралар"}
      </ThemedText>
    </View>
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={savedGestures}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={theme.primary}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: Spacing.md,
    alignItems: "center",
  },
  statValue: {
    fontSize: Typography.sizes.xxl,
    fontWeight: "700",
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    marginTop: Spacing.xs,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: Typography.sizes.md,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
});
