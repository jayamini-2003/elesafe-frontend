// app/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";
import { ImageBackground, StyleSheet } from "react-native";

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
    <ImageBackground
      source={require("../assets/images/splash.jpg")}
      style={styles.splash}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#F5F5F0",
  },
});
