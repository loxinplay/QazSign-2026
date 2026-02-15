import React from "react";
import { StyleSheet, View, Image, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface UserProfileCardProps {
  displayName: string;
  onEditPress: () => void;
}

export function UserProfileCard({ displayName, onEditPress }: UserProfileCardProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEditPress();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
      <Image
        source={require("../../assets/images/avatar-default.png")}
        style={styles.avatar}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <ThemedText style={styles.name}>{displayName}</ThemedText>
        <Pressable onPress={handlePress} hitSlop={8}>
          <ThemedText style={[styles.editLink, { color: theme.primary }]}>
            Edit Profile
          </ThemedText>
        </Pressable>
      </View>
      <Feather name="edit-2" size={20} color={theme.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  editLink: {
    fontSize: 14,
  },
});
