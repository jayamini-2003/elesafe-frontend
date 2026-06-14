// app/(auth)/login.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { authService } from '../../services/authService';
import { getApiErrorMessage } from '../../utils/apiError';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { useTranslation } from '../../context/LocaleContext';
import { theme } from '../../constants/theme';
import { fontFamily, fontSize, spacing, vs } from '../../utils/responsive';

const C = theme.colors;

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [focusedField, setFocused] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) { setError(t('login.enterCredentials')); return; }
    setLoading(true); setError('');
    try {
      await authService.login({ email, password });
      router.replace('/(drawer)/home');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, t('login.loginFailed')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Hero section with decorative circles ── */}
      <View style={styles.heroBg}>
        <View style={styles.langRow}>
          <LanguageSwitcher variant="pill" />
        </View>

        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
        <View style={[styles.circle, styles.circle4]} />

        {/* Brand block */}
        <View style={styles.brandBlock}>
          <View style={styles.brandIconCircle}>
            <MaterialCommunityIcons name="elephant" size={40} color={C.sage} />
          </View>
          <Text style={styles.brandName}>{t('common.appName')}</Text>
          <Text style={styles.brandSub}>{t('common.tagline')}</Text>
        </View>

        {/* ── Form card ── */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>

            <View style={styles.cardHandle} />

            <Text style={styles.welcome}>{t('login.welcomeBack')}</Text>
            <Text style={styles.subtitle}>{t('login.signInContinue')}</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={C.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Email */}
            <View style={[styles.inputWrap, focusedField === 'email' && styles.inputFocused]}>
              <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? C.primary : C.placeholder} />
              <TextInput
                placeholder={t('login.emailPlaceholder')}
                placeholderTextColor={C.placeholder}
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
            </View>

            {/* Password */}
            <View style={[styles.inputWrap, focusedField === 'password' && styles.inputFocused]}>
              <Ionicons name="lock-closed-outline" size={20} color={focusedField === 'password' ? C.primary : C.placeholder} />
              <TextInput
                placeholder={t('login.passwordPlaceholder')}
                placeholderTextColor={C.placeholder}
                secureTextEntry={!showPw}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
              />
              <Pressable onPress={() => setShowPw(!showPw)} hitSlop={8}>
                <Ionicons
                  name={showPw ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={C.placeholder}
                />
              </Pressable>
            </View>

            <Pressable style={styles.forgotWrap}>
              <Text style={styles.forgot}>{t('login.forgotPassword')}</Text>
            </Pressable>

            {/* Login button */}
            <Pressable
              style={({ pressed }) => [styles.loginBtn, pressed && styles.loginBtnPressed]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.loginText}>{t('login.signIn')}</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </Pressable>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('common.or')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={styles.registerBtn}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.registerText}>
                {t('login.newHere')}  <Text style={styles.registerLink}>{t('login.createAccount')}</Text>
              </Text>
            </Pressable>

          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.primaryDark },

  heroBg: { flex: 1, backgroundColor: C.primaryDark },
  langRow: {
    position: 'absolute',
    top: vs(52),
    right: spacing.lg,
    zIndex: 10,
  },

  circle: { position: 'absolute', borderRadius: 999 },
  circle1: { width: 300, height: 300, top: -100, right: -80, backgroundColor: C.primary, opacity: 0.35 },
  circle2: { width: 200, height: 200, top: 60,   left: -70,  backgroundColor: C.sage,    opacity: 0.18 },
  circle3: { width: 140, height: 140, top: 180,  right: -30, backgroundColor: C.sage,    opacity: 0.12 },
  circle4: { width: 80,  height: 80,  top: 30,   left: 40,   backgroundColor: C.primary, opacity: 0.20 },

  brandBlock: {
    alignItems: 'center',
    paddingTop: vs(90),
    paddingBottom: vs(28),
    flex: 0,
  },
  brandIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(162,186,100,0.20)',
    borderWidth: 2, borderColor: C.sage + '88',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  brandName: {
    color: '#fff',
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.extraBold,
    letterSpacing: 0.5,
  },
  brandSub: {
    color: C.mist,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.medium,
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  scrollContent: { flexGrow: 1, justifyContent: 'flex-end' },

  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.xl,
    paddingBottom: vs(40),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 16,
  },
  cardHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center', marginBottom: spacing.lg,
  },

  welcome: {
    color: C.text,
    fontSize: fontSize.xl,
    fontFamily: fontFamily.extraBold,
    marginBottom: 4,
  },
  subtitle: {
    color: C.textMuted,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    marginBottom: spacing.lg,
  },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.dangerLight,
    borderRadius: 10, padding: 10, marginBottom: spacing.md,
    borderLeftWidth: 3, borderLeftColor: C.danger,
  },
  errorText: { color: C.danger, fontSize: fontSize.xs, fontFamily: fontFamily.medium, flex: 1 },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F7F9F7',
    borderRadius: theme.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: vs(14),
    marginBottom: spacing.sm,
    borderWidth: 1.5, borderColor: '#E8EEE8',
  },
  inputFocused: {
    borderColor: C.primary,
    backgroundColor: '#F0F8F2',
  },
  input: {
    flex: 1, color: C.text,
    marginLeft: 10, fontSize: fontSize.base,
    fontFamily: fontFamily.regular,
  },

  forgotWrap: { alignSelf: 'flex-end', marginBottom: spacing.lg, marginTop: 2 },
  forgot: {
    color: C.primary,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semiBold,
  },

  loginBtn: {
    flexDirection: 'row',
    backgroundColor: C.primaryDark,
    paddingVertical: vs(16),
    borderRadius: theme.radius.full,
    justifyContent: 'center', alignItems: 'center',
    gap: 10,
    shadowColor: C.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  loginBtnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  loginText: {
    fontFamily: fontFamily.bold,
    color: '#fff',
    fontSize: fontSize.base,
    letterSpacing: 0.5,
  },

  dividerRow: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: spacing.md, gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8EEE8' },
  dividerText: { color: C.textMuted, fontSize: fontSize.xs, fontFamily: fontFamily.medium },

  registerBtn: { alignItems: 'center', paddingVertical: spacing.xs },
  registerText: { color: C.textMuted, fontSize: fontSize.sm, fontFamily: fontFamily.regular },
  registerLink: { color: C.primary, fontFamily: fontFamily.bold },
});
