// app/_layout.tsx
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { ImageBackground, StyleSheet, Text, TextInput, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AlertBanner } from "../components/AlertBanner";
import DrawerNavigator, { DrawerRef } from "../components/DrawerNavigator";
import { DrawerProvider, useDrawer } from "../context/DrawerContext";
import { LocaleProvider } from "../context/LocaleContext";
import { useAlertSocket } from "../hooks/useAlertSocket";
import { fontSize } from "../utils/responsive";

SplashScreen.preventAutoHideAsync();

// ── Apply Poppins globally so every Text/TextInput uses it by default ──────────
function applyGlobalFonts() {
  const defaultTextProps = Text.defaultProps ?? (Text.defaultProps = {});
  const defaultInputProps = TextInput.defaultProps ?? (TextInput.defaultProps = {});

  const existing = (defaultTextProps.style as any) ?? {};
  defaultTextProps.style = { fontFamily: 'Poppins_400Regular', fontSize: fontSize.base, ...existing };

  const existingInput = (defaultInputProps.style as any) ?? {};
  defaultInputProps.style = { fontFamily: 'Poppins_400Regular', fontSize: fontSize.base, ...existingInput };
}

function AppShell() {
  const drawerRef = useRef<DrawerRef>(null);
  const { registerHandlers } = useDrawer();
  const { latestAlert, clearLatestAlert } = useAlertSocket();

  useEffect(() => {
    registerHandlers(
      () => drawerRef.current?.open(),
      () => drawerRef.current?.close(),
    );
  }, []);

  const handleAlertPress = () => {
    if (!latestAlert) return;
    router.push({ pathname: "/alert-detail", params: { alert: JSON.stringify(latestAlert) } });
    clearLatestAlert();
  };

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <AlertBanner alert={latestAlert} onDismiss={clearLatestAlert} onPress={handleAlertPress} />
      <DrawerNavigator ref={drawerRef} />
    </>
  );
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      applyGlobalFonts();
      setAppReady(true);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!appReady) {
    return (
      <View style={splashStyles.wrap}>
        <ImageBackground
          source={require("../assets/images/splash.jpg")}
          style={splashStyles.image}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LocaleProvider>
          <DrawerProvider>
            <AppShell />
          </DrawerProvider>
        </LocaleProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const splashStyles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#F5F5F0" },
  image: { flex: 1, width: "100%", height: "100%" },
});
