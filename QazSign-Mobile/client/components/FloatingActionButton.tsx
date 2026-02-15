import React from "react";
import { StyleSheet, Pressable, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Shadows } from "@/constants/theme";

interface FloatingActionButtonProps {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  size?: "small" | "large";
  variant?: "primary" | "secondary";
  isActive?: boolean;
  style?: ViewStyle;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingActionButton({
  icon,
  onPress,
  size = "large",
  variant = "primary",
  isActive = false,
  style,
}: FloatingActionButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const buttonSize = size === "large" ? 64 : 48;
  const iconSize = size === "large" ? 28 : 20;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const backgroundColor = variant === "primary"
    ? isActive ? theme.error : theme.primary
    : theme.backgroundDefault;

  const iconColor = variant === "primary" ? "#FFFFFF" : theme.text;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor,
          ...Shadows.floating,
        },
        animatedStyle,
        style,
      ]}
    >
      <Feather name={icon} size={iconSize} color={iconColor} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
});
