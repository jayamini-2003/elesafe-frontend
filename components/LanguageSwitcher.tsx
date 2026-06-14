import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '../context/LocaleContext';
import { theme } from '../constants/theme';
import type { Locale } from '../i18n';
import { fontFamily, fontSize } from '../utils/responsive';

type Variant = 'pill' | 'drawer' | 'compact';

type Props = {
  variant?: Variant;
};

export function LanguageSwitcher({ variant = 'pill' }: Props) {
  const { locale, setLocale, t } = useTranslation();

  const options: { code: Locale; label: string }[] = [
    { code: 'en', label: t('common.english') },
    { code: 'si', label: t('common.sinhala') },
  ];

  if (variant === 'drawer') {
    return (
      <View style={styles.drawerWrap}>
        <Text style={styles.drawerLabel}>{t('common.language')}</Text>
        <View style={styles.drawerRow}>
          {options.map((opt) => {
            const active = locale === opt.code;
            return (
              <Pressable
                key={opt.code}
                onPress={() => setLocale(opt.code)}
                style={[styles.drawerBtn, active && styles.drawerBtnActive]}
              >
                <Text style={[styles.drawerBtnText, active && styles.drawerBtnTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.pillWrap, variant === 'compact' && styles.pillCompact]}>
      {options.map((opt) => {
        const active = locale === opt.code;
        return (
          <Pressable
            key={opt.code}
            onPress={() => setLocale(opt.code)}
            style={[styles.pillBtn, active && styles.pillBtnActive]}
          >
            <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const C = theme.colors;

const styles = StyleSheet.create({
  pillWrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    padding: 3,
    gap: 2,
  },
  pillCompact: { alignSelf: 'center' },
  pillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  pillBtnActive: { backgroundColor: '#fff' },
  pillText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semiBold,
  },
  pillTextActive: { color: C.primaryDark },

  drawerWrap: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(196,217,203,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(196,217,203,0.2)',
  },
  drawerLabel: {
    color: C.drawerMuted,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.bold,
    letterSpacing: 1.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  drawerRow: { flexDirection: 'row', gap: 8 },
  drawerBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(196,217,203,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(196,217,203,0.2)',
  },
  drawerBtnActive: {
    backgroundColor: 'rgba(162,186,100,0.22)',
    borderColor: C.sage,
  },
  drawerBtnText: {
    color: C.drawerMuted,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semiBold,
  },
  drawerBtnTextActive: { color: C.cream },
});
