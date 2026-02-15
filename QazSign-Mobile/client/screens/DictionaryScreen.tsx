import React, { useState, useMemo, useCallback } from "react";
import { FlatList, View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { SearchBar } from "@/components/SearchBar";
import { CategoryPill } from "@/components/CategoryPill";
import { GestureCard } from "@/components/GestureCard";
import { EmptyState } from "@/components/EmptyState";
import { SAMPLE_GESTURES, GESTURE_CATEGORIES, GestureCategory, Gesture } from "../../shared/schema";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DictionaryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<GestureCategory>("all");

  const filteredGestures = useMemo(() => {
    let result = SAMPLE_GESTURES;

    if (selectedCategory !== "all") {
      result = result.filter((g) => g.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.word.toLowerCase().includes(query) ||
          g.description?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [searchQuery, selectedCategory]);

  const handleGesturePress = useCallback((gesture: Gesture) => {
    navigation.navigate("GestureDetail", { gestureId: gesture.id });
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: Gesture }) => (
    <GestureCard
      gesture={item}
      onPress={() => handleGesturePress(item)}
    />
  ), [handleGesturePress]);

  const keyExtractor = useCallback((item: Gesture) => item.id, []);

  const ListEmptyComponent = useMemo(() => (
    <EmptyState
      image={require("../../assets/images/empty-dictionary.png")}
      title="No gestures found"
      description="Try a different search term or category"
    />
  ), []);

  const ListHeaderComponent = useMemo(() => (
    <View>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search gestures..."
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {GESTURE_CATEGORIES.map((category) => (
          <CategoryPill
            key={category.id}
            label={category.label}
            isSelected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
          />
        ))}
      </ScrollView>
    </View>
  ), [searchQuery, selectedCategory]);

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
      data={filteredGestures}
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
  categoriesContainer: {
    paddingBottom: Spacing.md,
  },
});
