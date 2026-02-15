import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import DictionaryStackNavigator from "@/navigation/DictionaryStackNavigator";
import TranslateStackNavigator from "@/navigation/TranslateStackNavigator";
import LearnStackNavigator from "@/navigation/LearnStackNavigator";
import { useTheme } from "@/hooks/useTheme";

export type MainTabParamList = {
  DictionaryTab: undefined;
  TranslateTab: undefined;
  LearnTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="DictionaryTab"
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="DictionaryTab"
        component={DictionaryStackNavigator}
        options={{
          title: "Dictionary",
          tabBarIcon: ({ color, size }) => (
            <Feather name="book-open" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TranslateTab"
        component={TranslateStackNavigator}
        options={{
          title: "Translate",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={[
                styles.translateIcon,
                { backgroundColor: focused ? theme.primary : theme.backgroundDefault },
              ]}
            >
              <Feather
                name="video"
                size={22}
                color={focused ? "#FFFFFF" : color}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="LearnTab"
        component={LearnStackNavigator}
        options={{
          title: "Learn",
          tabBarIcon: ({ color, size }) => (
            <Feather name="bookmark" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  translateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
});
