// components/DrawerContent.tsx
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../services/authService';
import { theme } from '../constants/theme';
import { fontSize, fontFamily, spacing } from '../utils/responsive';

const NAV_ITEMS = [
  { label: 'Home',              icon: 'home' as const,             route: '/(drawer)/home',    match: '/home'    },
  { label: 'Live Map',          icon: 'map' as const,              route: '/(drawer)/map',     match: '/map'     },
  { label: 'Report Incident',   icon: 'report' as const,           route: '/(drawer)/report',  match: '/report',  accent: theme.colors.danger },
  { label: 'History',           icon: 'history' as const,          route: '/(drawer)/history', match: '/history' },
  { label: 'Safety Guidelines', icon: 'health-and-safety' as const,route: '/(drawer)/safety',  match: '/safety'  },
  { label: 'Notifications',     icon: 'notifications-none' as const,route: '/notifications',   match: '/notifications' },
];

type Props = { onClose: () => void };

export default function DrawerContent({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    authService.getStoredUser().then((u) => { if (u) setUser(u); });
  }, []);

  const fullName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
    : 'Loading...';

  const handleNav = (route: string) => {
    onClose();
    setTimeout(() => router.replace(route as any), 300);
  };

  const handleLogout = async () => {
    onClose();
    setTimeout(async () => {
      await authService.logout();
      router.replace('/(auth)/login');
    }, 300);
  };

  const isActive = (match: string) => pathname.includes(match);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>

      {/* ── Brand header ── */}
      <View style={styles.brandRow}>
        <View style={styles.brandIconWrap}>
          <MaterialCommunityIcons name="elephant" size={26} color={theme.colors.primaryLight} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.brandName}>EleSafe Lanka</Text>
          <Text style={styles.brandTagline}>Wildlife Alert System</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
          <MaterialIcons name="close" size={20} color={theme.colors.mist} />
        </Pressable>
      </View>

      {/* ── Profile card ── */}
      <Pressable
        style={styles.profileCard}
        onPress={() => { onClose(); setTimeout(() => router.push('/(drawer)/home'), 120); }}
      >
        {user?.profilePicture ? (
          <Image source={{ uri: user.profilePicture }} style={styles.avatar} key={user.profilePicture} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitials}>
              {(user?.firstName?.[0] || '').toUpperCase()}
              {(user?.lastName?.[0]  || '').toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName} numberOfLines={1}>{fullName}</Text>
          <Text style={styles.profileRole} numberOfLines={1}>
            {user?.role?.replace('_', ' ') || 'USER'}
          </Text>
          <View style={styles.profileDistrict}>
            <MaterialIcons name="location-on" size={11} color={theme.colors.primaryLight} />
            <Text style={styles.profileDistrictText} numberOfLines={1}>
              {user?.district || user?.village || 'Sri Lanka'}
            </Text>
          </View>
        </View>
        <View style={styles.onlineDot} />
      </Pressable>

      <View style={styles.divider} />

      {/* ── Nav items ── */}
      <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 2 }}>
        <Text style={styles.sectionLabel}>NAVIGATION</Text>

        {NAV_ITEMS.map((item) => {
          const active = isActive(item.match);
          const accentColor = item.accent || theme.colors.primaryLight;
          return (
            <Pressable
              key={item.route}
              onPress={() => handleNav(item.route)}
              style={({ pressed }) => [
                styles.navItem,
                active  && styles.navItemActive,
                pressed && !active && styles.navItemPressed,
              ]}
            >
              {active && <View style={[styles.activeBar, { backgroundColor: accentColor }]} />}
              <View style={[styles.navIconWrap, active && { backgroundColor: accentColor + '22' }]}>
                <MaterialIcons
                  name={item.icon as any}
                  size={20}
                  color={active ? accentColor : theme.colors.drawerMuted}
                />
              </View>
              <Text style={[styles.navLabel, active && { color: accentColor, fontWeight: '700' }]}>
                {item.label}
              </Text>
              {active && <MaterialIcons name="chevron-right" size={16} color={accentColor} />}
            </Pressable>
          );
        })}

        <View style={styles.versionChip}>
          <Text style={styles.versionText}>v1.0 • Elephant Protection</Text>
        </View>
      </ScrollView>

      {/* ── Logout ── */}
      <View style={styles.bottomSection}>
        <View style={styles.divider} />
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.8 }]}
          onPress={handleLogout}
        >
          <View style={styles.logoutIconWrap}>
            <MaterialIcons name="logout" size={18} color={theme.colors.danger} />
          </View>
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

// pull mist out so StyleSheet can see it as string
const C = theme.colors;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.drawer },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196,217,203,0.15)',
  },
  brandIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(162,186,100,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },
  brandName:    { color: C.drawerText, fontSize: fontSize.md, fontFamily: fontFamily.extraBold, letterSpacing: 0.4 },
  brandTagline: { color: C.drawerMuted, fontSize: fontSize.xs, marginTop: 1, fontFamily: fontFamily.medium },
  closeBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: 'rgba(196,217,203,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },

  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(196,217,203,0.08)',
    marginHorizontal: 12, borderRadius: 16,
    padding: 14, gap: 12, position: 'relative',
    borderWidth: 1, borderColor: 'rgba(196,217,203,0.2)',
    marginTop: 12, marginBottom: 8,
  },
  avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: C.sage },
  avatarFallback: {
    backgroundColor: 'rgba(162,186,100,0.22)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { color: C.cream, fontSize: fontSize.md, fontFamily: fontFamily.bold },
  profileInfo: { flex: 1 },
  profileName: { color: C.drawerText, fontSize: fontSize.sm, fontFamily: fontFamily.bold },
  profileRole: {
    color: C.primaryLight, fontSize: fontSize.xs, fontFamily: fontFamily.semiBold,
    textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2,
  },
  profileDistrict: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  profileDistrictText: { color: C.drawerMuted, fontSize: fontSize.xs, fontFamily: fontFamily.regular },
  onlineDot: {
    position: 'absolute', top: 14, right: 14,
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: C.sage, borderWidth: 1.5, borderColor: C.drawer,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(196,217,203,0.15)',
    marginHorizontal: 12,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    color: C.drawerMuted, fontSize: fontSize.xs, fontFamily: fontFamily.bold,
    letterSpacing: 2, paddingHorizontal: 20, marginBottom: 6, marginTop: 2,
  },

  navScroll: { flex: 1 },
  navItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 20,
    position: 'relative', overflow: 'hidden',
  },
  navItemActive:   { backgroundColor: 'rgba(162,186,100,0.12)' },
  navItemPressed:  { backgroundColor: 'rgba(196,217,203,0.08)' },
  activeBar: {
    position: 'absolute', left: 0, top: 6, bottom: 6,
    width: 3, borderRadius: 2,
  },
  navIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(196,217,203,0.10)',
    justifyContent: 'center', alignItems: 'center',
  },
  navLabel: { flex: 1, color: C.drawerMuted, fontSize: fontSize.sm, fontFamily: fontFamily.medium },

  versionChip: {
    marginHorizontal: 20, marginTop: 16, marginBottom: 4,
    paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: 'rgba(196,217,203,0.08)', borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(196,217,203,0.15)',
    alignItems: 'center',
  },
  versionText: { color: C.drawerMuted, fontSize: fontSize.xs, fontFamily: fontFamily.semiBold, letterSpacing: 0.5 },

  bottomSection: { paddingHorizontal: 0 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 20,
    marginHorizontal: 12, marginTop: 4, borderRadius: 12,
    backgroundColor: 'rgba(192,57,43,0.10)',
    borderWidth: 1, borderColor: 'rgba(192,57,43,0.20)',
  },
  logoutIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(192,57,43,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  logoutText: { color: C.danger, fontSize: fontSize.sm, fontFamily: fontFamily.bold },
});
