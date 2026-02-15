import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigatorScreenParams } from "@react-navigation/native";
import MainTabNavigator, { MainTabParamList } from "@/navigation/MainTabNavigator";
import GestureDetailScreen from "@/screens/GestureDetailScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import QuizScreen from "@/screens/QuizScreen";
import HistoryScreen from "@/screens/HistoryScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  GestureDetail: { gestureId: string };
  Settings: undefined;
  Quiz: undefined;
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GestureDetail"
        component={GestureDetailScreen}
        options={{
          headerTitle: "Gesture",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          presentation: "modal",
          headerTitle: "Settings",
        }}
      />
      <Stack.Screen
        name="Quiz"
        component={QuizScreen}
        options={{
          headerTitle: "Quiz",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{
          headerTitle: "History",
        }}
      />
    </Stack.Navigator>
  );
}
