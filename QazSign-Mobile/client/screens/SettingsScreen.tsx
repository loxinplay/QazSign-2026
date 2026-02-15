import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, TextInput, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { SettingsRow } from "@/components/SettingsRow";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getUserPreferences, setUserPreferences } from "@/lib/storage";
import { UserPreferences } from "../../shared/schema";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [preferences, setPreferencesState] = useState<UserPreferences>({
    displayName: "User",
    language: "kazakh",
    highContrastMode: false,
    ttsEnabled: true,
  });
  const [displayName, setDisplayName] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    getUserPreferences().then((prefs) => {
      setPreferencesState(prefs);
      setDisplayName(prefs.displayName);
    });
  }, []);

  const handleDisplayNameChange = (text: string) => {
    setDisplayName(text);
    setHasChanges(text !== preferences.displayName);
  };

  const handleLanguageToggle = useCallback(() => {
    const newLanguage = preferences.language === "kazakh" ? "russian" : "kazakh";
    const newPrefs = { ...preferences, language: newLanguage as "kazakh" | "russian" };
    setPreferencesState(newPrefs);
    setUserPreferences(newPrefs);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [preferences]);

  const handleHighContrastToggle = useCallback((value: boolean) => {
    const newPrefs = { ...preferences, highContrastMode: value };
    setPreferencesState(newPrefs);
    setUserPreferences(newPrefs);
  }, [preferences]);

  const handleTtsToggle = useCallback((value: boolean) => {
    const newPrefs = { ...preferences, ttsEnabled: value };
    setPreferencesState(newPrefs);
    setUserPreferences(newPrefs);
  }, [preferences]);

  const handleSave = async () => {
    try {
      const newPrefs = { ...preferences, displayName };
      await setUserPreferences(newPrefs);
      setPreferencesState(newPrefs);
      setHasChanges(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <ThemedText style={styles.sectionTitle}>Profile</ThemedText>
      <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
          Display Name
        </ThemedText>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={displayName}
          onChangeText={handleDisplayNameChange}
          placeholder="Enter your name"
          placeholderTextColor={theme.textMuted}
        />
      </View>

      {hasChanges ? (
        <Button onPress={handleSave} style={styles.saveButton}>
          Save Changes
        </Button>
      ) : null}

      <ThemedText style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
        Preferences
      </ThemedText>
      <View style={[styles.settingsGroup, { backgroundColor: theme.backgroundDefault }]}>
        <SettingsRow
          icon="globe"
          title="Language"
          value={preferences.language === "kazakh" ? "Қазақша" : "Русский"}
          showChevron
          onPress={handleLanguageToggle}
        />
        <SettingsRow
          icon="eye"
          title="High Contrast Mode"
          toggle
          toggleValue={preferences.highContrastMode}
          onToggle={handleHighContrastToggle}
        />
        <SettingsRow
          icon="volume-2"
          title="Text-to-Speech"
          toggle
          toggleValue={preferences.ttsEnabled}
          onToggle={handleTtsToggle}
        />
      </View>

      <ThemedText style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
        About
      </ThemedText>
      <View style={[styles.settingsGroup, { backgroundColor: theme.backgroundDefault }]}>
        <SettingsRow
          icon="info"
          title="About QazSign"
          showChevron
          onPress={() => {}}
        />
        <View style={styles.versionRow}>
          <ThemedText style={[styles.versionText, { color: theme.textMuted }]}>
            Version 1.0.0
          </ThemedText>
        </View>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
    opacity: 0.7,
  },
  inputContainer: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  input: {
    fontSize: 16,
    paddingVertical: Spacing.xs,
  },
  saveButton: {
    marginBottom: Spacing.md,
  },
  settingsGroup: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
  },
  versionRow: {
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  versionText: {
    fontSize: 12,
  },
});
