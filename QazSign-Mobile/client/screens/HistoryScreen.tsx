import React, { useState, useCallback } from "react";
import { FlatList, View, StyleSheet, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, Typography } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { RecognitionHistoryItem } from "../../shared/schema";
import { getRecognitionHistory, clearRecognitionHistory, getUserPreferences } from "@/lib/storage";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [history, setHistory] = useState<RecognitionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<"kazakh" | "russian">("kazakh");

  const loadHistory = useCallback(async () => {
    try {
      const [data, prefs] = await Promise.all([
        getRecognitionHistory(),
        getUserPreferences(),
      ]);
      setHistory(data);
      setLanguage(prefs.language);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const handleClear = useCallback(() => {
    Alert.alert(
      language === "russian" ? "Очистить историю?" : "Тарихты тазалау?",
      language === "russian" 
        ? "Все записи будут удалены" 
        : "Барлық жазбалар жойылады",
      [
        { 
          text: language === "russian" ? "Отмена" : "Болдырмау", 
          style: "cancel" 
        },
        {
          text: language === "russian" ? "Очистить" : "Тазалау",
          style: "destructive",
          onPress: async () => {
            await clearRecognitionHistory();
            setHistory([]);
          },
        },
      ]
    );
  }, [language]);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return language === "russian" ? "Только что" : "Жаңа ғана";
    if (minutes < 60) return `${minutes} ${language === "russian" ? "мин назад" : "мин бұрын"}`;
    if (hours < 24) return `${hours} ${language === "russian" ? "ч назад" : "сағ бұрын"}`;
    if (days < 7) return `${days} ${language === "russian" ? "д назад" : "күн бұрын"}`;
    
    return date.toLocaleDateString();
  };

  const renderItem = useCallback(({ item }: { item: RecognitionHistoryItem }) => (
    <Card style={styles.historyItem}>
      <View style={styles.itemContent}>
        <View style={styles.itemMain}>
          <ThemedText style={styles.itemWord}>{item.word}</ThemedText>
          <ThemedText style={[styles.itemTime, { color: theme.textSecondary }]}>
            {formatDate(item.timestamp)}
          </ThemedText>
        </View>
        <View style={[styles.confidenceBadge, { 
          backgroundColor: item.confidence > 0.8 ? theme.successLight : theme.warningLight 
        }]}>
          <ThemedText style={[styles.confidenceText, { 
            color: item.confidence > 0.8 ? theme.success : theme.warning 
          }]}>
            {Math.round(item.confidence * 100)}%
          </ThemedText>
        </View>
      </View>
    </Card>
  ), [theme, language]);

  const keyExtractor = useCallback((item: RecognitionHistoryItem) => item.id, []);

  const ListEmptyComponent = (
    <EmptyState
      icon="clock"
      title={language === "russian" ? "История пуста" : "Тарих бос"}
      description={language === "russian" 
        ? "Распознанные жесты появятся здесь" 
        : "Танылған ишаралар осында пайда болады"}
    />
  );

  const ListHeaderComponent = history.length > 0 ? (
    <View style={styles.headerRow}>
      <ThemedText style={styles.sectionTitle}>
        {language === "russian" ? "Распознанные жесты" : "Танылған ишаралар"}
      </ThemedText>
      <Pressable onPress={handleClear} style={styles.clearButton}>
        <Feather name="trash-2" size={18} color={theme.error} />
        <ThemedText style={[styles.clearText, { color: theme.error }]}>
          {language === "russian" ? "Очистить" : "Тазалау"}
        </ThemedText>
      </Pressable>
    </View>
  ) : null;

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={history}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: "600",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  clearText: {
    fontSize: Typography.sizes.sm,
    fontWeight: "500",
  },
  historyItem: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemMain: {
    flex: 1,
  },
  itemWord: {
    fontSize: Typography.sizes.lg,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  itemTime: {
    fontSize: Typography.sizes.sm,
  },
  confidenceBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: Typography.sizes.sm,
    fontWeight: "600",
  },
});
