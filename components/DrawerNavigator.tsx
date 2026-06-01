// components/DrawerNavigator.tsx
// Animated slide-from-left drawer panel.
// Rendered inside RootLayout so it floats above the entire
// Expo Router navigation tree — that's what makes it work
// from any screen without context isolation issues.

import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import DrawerContent from "./DrawerContent";

const { width: SCREEN_W } = Dimensions.get("window");
const DRAWER_W  = Math.min(SCREEN_W * 0.78, 300);
const DURATION  = 260;

export type DrawerRef = {
  open:  () => void;
  close: () => void;
};

const DrawerNavigator = forwardRef<DrawerRef>((_, ref) => {
  // Track open state in React state so the scrim Pressable
  // can be conditionally mounted (no invisible touch blocker when closed)
  const [visible, setVisible] = useState(false);

  const translateX     = useRef(new Animated.Value(-DRAWER_W)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const open = useCallback(() => {
    setVisible(true);                          // mount the scrim + panel
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 68,
        friction: 12,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const close = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -DRAWER_W,
        duration: DURATION - 40,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: DURATION - 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);                       // unmount scrim after animation
    });
  }, []);

  useImperativeHandle(ref, () => ({ open, close }), [open, close]);

  // When drawer is fully closed — render nothing, zero touch interference
  if (!visible) return null;

  return (
    // This View is absolutely positioned and fills the screen,
    // sitting on top of the Expo Router Stack via zIndex in RootLayout
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">

      {/* ── Scrim (tap to close) ── */}
      <Animated.View
        style={[styles.scrim, { opacity: overlayOpacity }]}
        pointerEvents="auto"
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      {/* ── Drawer panel ── */}
      <Animated.View
        style={[
          styles.drawer,
          { width: DRAWER_W, transform: [{ translateX }] },
        ]}
        pointerEvents="auto"
      >
        <DrawerContent onClose={close} />
      </Animated.View>
    </View>
  );
});

DrawerNavigator.displayName = "DrawerNavigator";
export default DrawerNavigator;

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,42,29,0.60)",
    zIndex: 50,
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
    shadowColor: "#0F2A1D",
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 24,
  },
});
