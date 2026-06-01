// components/AppHeader.tsx
// Global reusable header — full-width, zero margin, consistent on every screen.
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDrawer } from '../context/DrawerContext';
import { theme } from '../constants/theme';
import { fontSize, fontFamily, spacing } from '../utils/responsive';

const { width: SCREEN_W } = Dimensions.get('window');

type Props = {
  title: string;
  subtitle?: string;
  mode?: 'drawer' | 'back';
  backRoute?: string;
  rightIcon?: string;
  rightIconColor?: string;
  rightBadge?: number;
  onRightPress?: () => void;
  style?: ViewStyle;
  floating?: boolean;
};

export default function AppHeader({
  title,
  subtitle,
  mode = 'drawer',
  backRoute,
  rightIcon,
  rightIconColor,
  rightBadge,
  onRightPress,
  style,
  floating = false,
}: Props) {
  const { openDrawer } = useDrawer();
  const insets = useSafeAreaInsets();

  const handleLeft = () => {
    if (mode === 'back') {
      backRoute ? router.replace(backRoute as any) : router.back();
    } else {
      openDrawer();
    }
  };

  const iconColor = rightIconColor ?? theme.colors.headerIcon;

  return (
    <View
      style={[
        styles.container,
        floating && styles.containerFloating,
        { paddingTop: insets.top + 6 },
        style,
      ]}
    >
      {/* Left — hamburger or back */}
      <Pressable
        onPress={handleLeft}
        style={({ pressed }) => [
          styles.iconBtn,
          pressed && styles.iconBtnPressed,
        ]}
        hitSlop={8}
      >
        {mode === 'back' ? (
          <MaterialIcons name="arrow-back" size={22} color={theme.colors.headerIcon} />
        ) : (
          <HamburgerIcon />
        )}
      </Pressable>

      {/* Centre — title */}
      <View style={styles.titleBlock}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>

      {/* Right — optional action icon */}
      {rightIcon ? (
        <Pressable
          onPress={onRightPress}
          style={({ pressed }) => [
            styles.iconBtn,
            pressed && styles.iconBtnPressed,
          ]}
          hitSlop={8}
        >
          <MaterialIcons name={rightIcon as any} size={22} color={iconColor} />
          {rightBadge != null && rightBadge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {rightBadge > 99 ? '99+' : rightBadge}
              </Text>
            </View>
          )}
        </Pressable>
      ) : (
        <View style={styles.iconBtn} />
      )}
    </View>
  );
}

// ── Logo variant (Home screen) ────────────────────────────────────────────────
export function AppHeaderLogo({
  rightIcon,
  rightIconColor,
  rightBadge,
  onRightPress,
  style,
  floating = false,
}: Omit<Props, 'title' | 'subtitle' | 'mode' | 'backRoute'>) {
  const { openDrawer } = useDrawer();
  const insets = useSafeAreaInsets();
  const iconColor = rightIconColor ?? theme.colors.headerIcon;

  return (
    <View
      style={[
        styles.container,
        floating && styles.containerFloating,
        { paddingTop: insets.top + 6 },
        style,
      ]}
    >
      <Pressable
        onPress={openDrawer}
        style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
        hitSlop={8}
      >
        <HamburgerIcon />
      </Pressable>

      <View style={styles.titleBlock}>
        <View style={styles.logoRow}>
          <MaterialCommunityIcons name="elephant" size={18} color={theme.colors.primaryLight} />
          <Text style={styles.logoText}>EleSafe Lanka</Text>
        </View>
      </View>

      {rightIcon ? (
        <Pressable
          onPress={onRightPress}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
          hitSlop={8}
        >
          <MaterialIcons name={rightIcon as any} size={22} color={iconColor} />
          {rightBadge != null && rightBadge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {rightBadge > 99 ? '99+' : rightBadge}
              </Text>
            </View>
          )}
        </Pressable>
      ) : (
        <View style={styles.iconBtn} />
      )}
    </View>
  );
}

// ── Hamburger icon ────────────────────────────────────────────────────────────
function HamburgerIcon() {
  return (
    <View style={styles.hamburger}>
      <View style={styles.line} />
      <View style={[styles.line, { width: 16 }]} />
      <View style={styles.line} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm + 2,
    backgroundColor: theme.colors.header,
    gap: 10,
  },
  containerFloating: {
    backgroundColor: theme.colors.header + 'EE',
    borderRadius: theme.radius.md,
    marginHorizontal: 0,
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(196,217,203,0.12)',
  },
  iconBtnPressed: {
    backgroundColor: 'rgba(196,217,203,0.22)',
  },

  hamburger: { gap: 5, alignItems: 'flex-start' },
  line: {
    width: 20,
    height: 2.5,
    backgroundColor: theme.colors.headerIcon,
    borderRadius: 2,
  },

  titleBlock: { flex: 1, alignItems: 'center' },
  title: {
    color: theme.colors.headerText,
    fontSize: fontSize.base,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.4,
  },
  subtitle: {
    color: theme.colors.primaryLight,
    fontSize: fontSize.xs,
    marginTop: 1,
    fontFamily: fontFamily.medium,
  },

  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  logoText: {
    color: theme.colors.headerText,
    fontSize: fontSize.md,
    fontFamily: fontFamily.extraBold,
    letterSpacing: 0.4,
  },

  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.danger,
    borderRadius: 99,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: theme.colors.header,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: fontSize.xxs,
    fontFamily: fontFamily.extraBold,
    lineHeight: 11,
  },
});
