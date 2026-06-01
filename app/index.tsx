// app/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { theme } from "../constants/theme";

export default function Index() {
  useEffect(() => {
    AsyncStorage.getItem("accessToken").then((token) => {
      if (token) {
        router.replace("/(drawer)/home");
      } else {
        router.replace("/(auth)/login");
      }
    });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}