import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DictionaryScreen from "@/screens/DictionaryScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type DictionaryStackParamList = {
  Dictionary: undefined;
};

const Stack = createNativeStackNavigator<DictionaryStackParamList>();

export default function DictionaryStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Dictionary"
        component={DictionaryScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Dictionary" />,
        }}
      />
    </Stack.Navigator>
  );
}
