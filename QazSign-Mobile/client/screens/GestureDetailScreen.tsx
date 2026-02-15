import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Image, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { SAMPLE_GESTURES, Gesture } from "../../shared/schema";
import { isGestureSaved, saveGesture, removeGesture } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type RouteProps = RouteProp<RootStackParamList, "GestureDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function GestureDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { gestureId } = route.params;

  const [gesture, setGesture] = useState<Gesture | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [relatedGestures, setRelatedGestures] = useState<Gesture[]>([]);

  useEffect(() => {
    const foundGesture = SAMPLE_GESTURES.find((g) => g.id === gestureId);
    setGesture(foundGesture || null);

    if (foundGesture) {
      const related = SAMPLE_GESTURES.filter(
        (g) => g.category === foundGesture.category && g.id !== gestureId
      ).slice(0, 5);
      setRelatedGestures(related);
    }

    isGestureSaved(gestureId).then(setIsSaved);
  }, [gestureId]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleToggleSave} hitSlop={8}>
          <Feather
            name={isSaved ? "bookmark" : "bookmark"}
            size={24}
            color={isSaved ? theme.primary : theme.text}
          />
        </Pressable>
      ),
    });
  }, [isSaved, navigation, theme]);

  const handleToggleSave = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (isSaved) {
        await removeGesture(gestureId);
        setIsSaved(false);
      } else {
        await saveGesture(gestureId);
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  }, [gestureId, isSaved]);

  const handlePractice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("Main", { screen: "TranslateTab" });
  };

  const handleRelatedPress = (relatedGestureId: string) => {
    navigation.push("GestureDetail", { gestureId: relatedGestureId });
  };

  if (!gesture) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Gesture not found</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.videoContainer, { backgroundColor: theme.backgroundDefault }]}>
        <Image
          source={require("../../assets/images/gesture-placeholder.png")}
          style={styles.videoPlaceholder}
          resizeMode="contain"
        />
        <View style={[styles.playButton, { backgroundColor: theme.primary }]}>
          <Feather name="play" size={32} color="#FFFFFF" />
        </View>
      </View>

      <ThemedText style={styles.title}>{gesture.word}</ThemedText>
      
      {gesture.description ? (
        <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
          {gesture.description}
        </ThemedText>
      ) : null}

      <Button onPress={handlePractice} style={styles.practiceButton}>
        Practice
      </Button>

      {relatedGestures.length > 0 ? (
        <View style={styles.relatedSection}>
          <ThemedText style={styles.sectionTitle}>Related Gestures</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedContainer}
          >
            {relatedGestures.map((related) => (
              <Pressable
                key={related.id}
                onPress={() => handleRelatedPress(related.id)}
                style={[styles.relatedCard, { backgroundColor: theme.backgroundDefault }]}
              >
                <Image
                  source={require("../../assets/images/gesture-placeholder.png")}
                  style={styles.relatedImage}
                  resizeMode="cover"
                />
                <ThemedText style={styles.relatedWord}>{related.word}</ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    aspectRatio: 16 / 9,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  videoPlaceholder: {
    width: "80%",
    height: "80%",
  },
  playButton: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  practiceButton: {
    marginBottom: Spacing.xl,
  },
  relatedSection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  relatedContainer: {
    gap: Spacing.md,
  },
  relatedCard: {
    width: 120,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  relatedImage: {
    width: 120,
    height: 100,
  },
  relatedWord: {
    fontSize: 14,
    fontWeight: "500",
    padding: Spacing.sm,
    textAlign: "center",
  },
});
