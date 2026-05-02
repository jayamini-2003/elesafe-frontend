// app/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  useEffect(() => {
    AsyncStorage.getItem("accessToken").then((token) => {
      if (token) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/(auth)/login");
      }
    });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#102213",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" color="#13ec37" />
    </View>
  );
}