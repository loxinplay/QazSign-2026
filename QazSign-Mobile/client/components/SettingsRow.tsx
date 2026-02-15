import React from "react";
import { StyleSheet, View, Pressable, Switch } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface SettingsRowProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  value?: string;
  showChevron?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

export function SettingsRow({
  icon,
  title,
  value,
  showChevron = false,
  toggle = false,
  toggleValue = false,
  onToggle,
  onPress,
}: SettingsRowProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const handleToggle = (newValue: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle?.(newValue);
  };

  const content = (
    <View style={[styles.container, { borderBottomColor: theme.divider }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
        <Feather name={icon} size={18} color="#FFFFFF" />
      </View>
      <ThemedText style={styles.title}>{title}</ThemedText>
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={handleToggle}
          trackColor={{ false: theme.backgroundTertiary, true: theme.primary }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <>
          {value ? (
            <ThemedText style={[styles.value, { color: theme.textSecondary }]}>
              {value}
            </ThemedText>
          ) : null}
          {showChevron ? (
            <Feather name="chevron-right" size={20} color={theme.textMuted} />
          ) : null}
        </>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={handlePress}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  title: {
    flex: 1,
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
});
