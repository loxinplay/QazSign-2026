import React from "react";
import { StyleSheet, View, Pressable, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Gesture } from "../../shared/schema";

interface GestureCardProps {
  gesture: Gesture;
  onPress: () => void;
  isSaved?: boolean;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GestureCard({ gesture, onPress, isSaved = false }: GestureCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={require("../../assets/images/gesture-placeholder.png")}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {isSaved ? (
          <View style={[styles.savedBadge, { backgroundColor: theme.primary }]}>
            <Feather name="bookmark" size={12} color="#FFFFFF" />
          </View>
        ) : null}
      </View>
      <View style={styles.content}>
        <ThemedText style={styles.word}>{gesture.word}</ThemedText>
        {gesture.description ? (
          <ThemedText
            style={[styles.description, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {gesture.description}
          </ThemedText>
        ) : null}
      </View>
      <Feather name="chevron-right" size={20} color={theme.textMuted} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  thumbnailContainer: {
    position: "relative",
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.xs,
  },
  savedBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  word: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
  },
});
