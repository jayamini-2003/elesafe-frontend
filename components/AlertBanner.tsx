// components/AlertBanner.tsx
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '../context/LocaleContext';
import { SightingAlert } from '../hooks/useAlertSocket';
import { theme } from '../constants/theme';
import { fontSize, fontFamily } from '../utils/responsive';

interface Props {
  alert: SightingAlert | null;
  onDismiss: () => void;
  onPress: () => void;
}

export function AlertBanner({ alert, onDismiss, onPress }: Props) {
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(-130)).current;
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!alert) return;
    Animated.spring(slideAnim, {
      toValue: 0, useNativeDriver: true, tension: 70, friction: 11,
    }).start();
    timerRef.current = setTimeout(() => slideOut(onDismiss), 8000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [alert]);

  const slideOut = (cb: () => void) =>
    Animated.timing(slideAnim, {
      toValue: -130, duration: 280, useNativeDriver: true,
    }).start(cb);

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    slideOut(onDismiss);
  };
  const handlePress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    slideOut(onPress);
  };

  if (!alert) return null;

  const behaviorKey = `map.behaviors.${alert.behavior}`;
  const behaviorLabel = t(behaviorKey) !== behaviorKey
    ? t(behaviorKey)
    : alert.behavior;

  const behaviorColors: Record<string, string> = {
    AGGRESSIVE: theme.colors.danger,
    MOVING: theme.colors.warning,
    CALM: theme.colors.sage,
    FEEDING: '#4A90A4',
  };
  const bColor = behaviorColors[alert.behavior] ?? theme.colors.primaryLight;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
      <Pressable style={styles.inner} onPress={handlePress}>
        <View style={[styles.iconWrap, { backgroundColor: bColor + '22' }]}>
          <MaterialCommunityIcons name="paw" size={24} color={bColor} />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {t('alertBanner.sighting', { village: alert.village })}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {t('common.elephants', { count: alert.numberOfElephants })} ·{' '}
            <Text style={{ color: bColor }}>{behaviorLabel}</Text>
          </Text>
          <Text style={styles.tapHint}>{t('alertBanner.tapDetails')}</Text>
        </View>
        <Pressable onPress={handleDismiss} hitSlop={10} style={styles.closeBtn}>
          <MaterialIcons name="close" size={18} color={theme.colors.drawerMuted} />
        </Pressable>
      </Pressable>
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { backgroundColor: bColor }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute', top: 44, left: 12, right: 12, zIndex: 9999,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.deepForest,
    borderWidth: 1, borderColor: 'rgba(139,176,113,0.25)',
    ...theme.shadow.strong,
    overflow: 'hidden',
  },
  inner: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  iconWrap: {
    width: 44, height: 44, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  textBlock: { flex: 1 },
  title:   { color: theme.colors.cream, fontSize: fontSize.sm, fontFamily: fontFamily.bold, marginBottom: 2 },
  sub:     { color: theme.colors.mist,  fontSize: fontSize.xs, marginBottom: 3 },
  tapHint: { color: theme.colors.drawerMuted, fontSize: fontSize.xxs },
  closeBtn:      { padding: 4, flexShrink: 0 },
  progressTrack: { height: 3, backgroundColor: 'rgba(15,42,29,0.3)' },
  progressBar:   { height: 3, width: '100%' },
});
