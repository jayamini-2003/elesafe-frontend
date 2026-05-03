// components/AlertBanner.tsx
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SightingAlert } from '../hooks/useAlertSocket';

const BEHAVIOR_CONFIG = {
  AGGRESSIVE: { color: '#ef4444', label: 'Aggressive ⚠️' },
  MOVING:     { color: '#f97316', label: 'Moving 🐘' },
  CALM:       { color: '#13ec37', label: 'Calm' },
  FEEDING:    { color: '#3b82f6', label: 'Feeding' },
};

interface Props {
  alert: SightingAlert | null;
  onDismiss: () => void;
  onPress: () => void;
}

export function AlertBanner({ alert, onDismiss, onPress }: Props) {
  const slideAnim = useRef(new Animated.Value(-130)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!alert) return;

    // Slide in
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 70,
      friction: 11,
    }).start();

    // Auto-dismiss after 8 seconds
    timerRef.current = setTimeout(() => {
      slideOut(onDismiss);
    }, 8000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [alert]);

  const slideOut = (callback: () => void) => {
    Animated.timing(slideAnim, {
      toValue: -130,
      duration: 280,
      useNativeDriver: true,
    }).start(callback);
  };

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    slideOut(onDismiss);
  };

  const handlePress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    slideOut(onPress);
  };

  if (!alert) return null;

  const behavior = BEHAVIOR_CONFIG[alert.behavior] ?? { color: '#9ca3af', label: alert.behavior };

  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}
    >
      <Pressable style={styles.inner} onPress={handlePress}>
        {/* Left icon */}
        <View style={[styles.iconWrap, { backgroundColor: behavior.color + '22' }]}>
          <MaterialCommunityIcons name="paw" size={24} color={behavior.color} />
        </View>

        {/* Text block */}
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={1}>
            🚨 Elephant Sighting — {alert.village}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {alert.numberOfElephants} elephant{alert.numberOfElephants > 1 ? 's' : ''} ·{' '}
            <Text style={{ color: behavior.color }}>{behavior.label}</Text>
          </Text>
          <Text style={styles.tapHint}>Tap to view full details</Text>
        </View>

        {/* Dismiss X */}
        <Pressable onPress={handleDismiss} hitSlop={10} style={styles.closeBtn}>
          <MaterialIcons name="close" size={18} color="#6b7280" />
        </Pressable>
      </Pressable>

      {/* Bottom progress bar — shrinks over 8 seconds */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { backgroundColor: behavior.color }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 44,
    left: 12,
    right: 12,
    zIndex: 9999,
    borderRadius: 14,
    backgroundColor: '#1c3020',
    borderWidth: 1,
    borderColor: '#2d4a34',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  sub: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 3,
  },
  tapHint: {
    color: '#4a6650',
    fontSize: 10,
  },
  closeBtn: {
    padding: 4,
    flexShrink: 0,
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#0d2211',
  },
  progressBar: {
    height: 3,
    width: '100%',
  },
});
