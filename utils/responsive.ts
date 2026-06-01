// utils/responsive.ts
// Responsive utilities for EleSafe Lanka — phone + tablet support

import { Dimensions, Platform, StatusBar } from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Breakpoints ────────────────────────────────────────────────────────────
export const isTablet = SCREEN_W >= 768;
export const isSmallPhone = SCREEN_W < 360;

// ─── Scale helpers ───────────────────────────────────────────────────────────
/** Scale a size relative to a 390px reference screen (iPhone 14 width). */
export const rs = (size: number): number => {
  const scale = SCREEN_W / 390;
  const result = size * scale;
  // Clamp: never shrink below 80% or grow above 140% on tablets
  return Math.max(size * 0.8, Math.min(size * (isTablet ? 1.1 : 1.4), result));
};

/** Vertical scale relative to a 844px reference screen (iPhone 14 height). */
export const vs = (size: number): number => {
  const scale = SCREEN_H / 844;
  return Math.max(size * 0.8, Math.min(size * 1.4, size * scale));
};

/** Moderate scale — blends width-scale with a damping factor (default 0.5). */
export const ms = (size: number, factor = 0.5): number =>
  size + (rs(size) - size) * factor;

// ─── Safe area top ───────────────────────────────────────────────────────────
/** Reliable top padding that respects notches and status bar. */
export const safeTop: number =
  Platform.OS === "android"
    ? (StatusBar.currentHeight ?? 24) + 8
    : 54; // conservative notch/Dynamic Island clearance for iOS

// ─── Standard typography scale (14px body) ───────────────────────────────────
export const fontSize = {
  xxs:  ms(10), // fine print / badges
  xs:   ms(11), // captions, labels
  sm:   ms(13), // secondary text
  base: ms(14), // body text (default)
  md:   ms(16), // emphasized body, buttons
  lg:   ms(18), // section headings
  xl:   ms(22), // page titles
  xxl:  ms(24), // hero titles
};

// ─── Font family (Poppins loaded in _layout.tsx) ─────────────────────────────
export const fontFamily = {
  regular:    'Poppins_400Regular',
  medium:     'Poppins_500Medium',
  semiBold:   'Poppins_600SemiBold',
  bold:       'Poppins_700Bold',
  extraBold:  'Poppins_800ExtraBold',
};

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const spacing = {
  xs:  vs(6),
  sm:  vs(10),
  md:  vs(16),
  lg:  vs(20),
  xl:  vs(28),
  xxl: vs(40),
};

// ─── Screen dimensions (exported for convenience) ────────────────────────────
export const screen = { width: SCREEN_W, height: SCREEN_H };
