// app/alert-detail.tsx
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from "../constants/theme";
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppHeader from '../components/AppHeader';
import { SightingAlert } from '../hooks/useAlertSocket';
import { fontSize, fontFamily, spacing } from '../utils/responsive';

const C = theme.colors;

const BEHAVIOR_CONFIG: Record<string, {
  color: string; bg: string; border: string; label: string; icon: string;
}> = {
  AGGRESSIVE: { color: C.danger,   bg: C.dangerLight,  border: C.danger + '40',  label: 'Aggressive', icon: 'alert-circle'          },
  MOVING:     { color: '#f97316',  bg: '#FFF3E0',      border: '#f9731640',       label: 'Moving',     icon: 'run-fast'               },
  CALM:       { color: C.primary,  bg: C.primaryCream, border: C.primary + '40', label: 'Calm',       icon: 'emoticon-happy-outline' },
  FEEDING:    { color: '#3b82f6',  bg: '#EFF6FF',      border: '#3b82f640',       label: 'Feeding',    icon: 'food'                   },
};

function formatDateTime(dt: string) {
  try {
    if (Array.isArray(JSON.parse(dt))) {
      const parts = JSON.parse(dt) as number[];
      const d = new Date(parts[0], parts[1] - 1, parts[2], parts[3] ?? 0, parts[4] ?? 0);
      return d.toLocaleString();
    }
  } catch {}
  return new Date(dt).toLocaleString();
}

export default function AlertDetailScreen() {
  const params = useLocalSearchParams<{ alert: string }>();
  const alert: SightingAlert = JSON.parse(params.alert);

  const behavior = BEHAVIOR_CONFIG[alert.behavior] ?? {
    color: C.textMuted, bg: C.surface, border: C.border,
    label: alert.behavior, icon: 'help-circle',
  };

  return (
    <View style={styles.screen}>

      <AppHeader
        title="Alert Details"
        subtitle={`${alert.village} · ${alert.district}`}
        mode="back"
        backRoute="/(drawer)/home"
        rightIcon="home"
        rightIconColor={C.primary}
        onRightPress={() => router.replace('/(drawer)/home')}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* BEHAVIOR HERO CARD */}
        <View style={[styles.heroCard, { borderColor: behavior.color + '40' }]}>
          {/* Colored top strip */}
          <View style={[styles.heroStrip, { backgroundColor: behavior.color }]} />
          <View style={styles.heroBody}>
            {/* Large behavior icon circle */}
            <View style={[styles.behaviorCircle, { backgroundColor: behavior.bg, borderColor: behavior.border }]}>
              <MaterialCommunityIcons name={behavior.icon as any} size={40} color={behavior.color} />
            </View>
            {/* Behavior pill badge */}
            <View style={[styles.behaviorPill, { backgroundColor: behavior.bg, borderColor: behavior.color }]}>
              <View style={[styles.pillDot, { backgroundColor: behavior.color }]} />
              <Text style={[styles.behaviorPillText, { color: behavior.color }]}>
                {behavior.label} Behavior
              </Text>
            </View>
            {/* Elephant count */}
            <View style={styles.elephantRow}>
              <Text style={styles.elephantEmoji}>🐘</Text>
              <Text style={styles.elephantCount}>
                {alert.numberOfElephants} Elephant{alert.numberOfElephants > 1 ? 's' : ''} spotted
              </Text>
            </View>
            <Text style={styles.reportId}>ID: {alert.reportId}</Text>
          </View>
        </View>

        {/* LOCATION */}
        <SectionLabel icon="location-on" label="Location" color={C.primary} />
        <InfoCard>
          <InfoRow icon="location-city" label="Village"  value={alert.village}  />
          <InfoRow icon="map"           label="District" value={alert.district} />
          {alert.latitude != null && (
            <InfoRow
              icon="my-location"
              label="GPS Coordinates"
              value={`${alert.latitude.toFixed(5)}, ${alert.longitude?.toFixed(5)}`}
            />
          )}
        </InfoCard>

        {/* SIGHTING DETAILS */}
        <SectionLabel icon="info-outline" label="Sighting Details" color={C.primary} />
        <InfoCard>
          <InfoRow icon="access-time" label="Reported at" value={formatDateTime(alert.dateTime)} />
          <InfoRow icon="person"      label="Reported by" value={alert.reporterId}               />
          {alert.additionalNotes ? (
            <InfoRow icon="notes" label="Notes" value={alert.additionalNotes} />
          ) : null}
        </InfoCard>

        {/* SAFETY TIP */}
        <View style={styles.safetyBox}>
          <View style={styles.safetyIconWrap}>
            <MaterialIcons name="health-and-safety" size={22} color={C.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.safetyTitle}>Stay Safe</Text>
            <Text style={styles.safetyText}>
              Stay indoors, keep lights on, and alert your neighbours.
              Do not approach elephants under any circumstances.
            </Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [styles.homeBtn, pressed && { opacity: 0.85 }]}
            onPress={() => router.replace('/(drawer)/home')}
          >
            <MaterialIcons name="home" size={18} color={C.surface} />
            <Text style={styles.homeBtnText}>Go to Home</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.85 }]}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={18} color={C.primary} />
            <Text style={styles.closeBtnText}>Go Back</Text>
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}

function SectionLabel({ icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <View style={styles.sectionLabelRow}>
      <MaterialIcons name={icon} size={14} color={color} />
      <Text style={[styles.sectionLabel, { color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.infoCard}>{children}</View>;
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <MaterialIcons name={icon} size={17} color={C.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: C.bg },
  content: { padding: spacing.md, paddingBottom: 48 },

  /* ── Hero card ── */
  heroCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    shadowColor: C.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  heroStrip: { height: 6, width: '100%' },
  heroBody:  { alignItems: 'center', padding: spacing.lg, gap: 10 },

  behaviorCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  behaviorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillDot:          { width: 7, height: 7, borderRadius: 4 },
  behaviorPillText: { fontFamily: fontFamily.bold, fontSize: fontSize.sm },
  elephantRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  elephantEmoji: { fontSize: fontSize.md },
  elephantCount: { color: C.text, fontFamily: fontFamily.bold, fontSize: fontSize.md },
  reportId:      { color: C.textMuted, fontFamily: fontFamily.semiBold, fontSize: fontSize.xs, letterSpacing: 1 },

  /* ── Section labels ── */
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    letterSpacing: 1.5,
  },

  /* ── Info card ── */
  infoCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    shadowColor: C.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bgSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoLabel: { color: C.textMuted, fontFamily: fontFamily.regular, fontSize: fontSize.xs, marginBottom: 2 },
  infoValue: { color: C.text, fontFamily: fontFamily.semiBold, fontSize: fontSize.sm },

  /* ── Safety box ── */
  safetyBox: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: C.primaryCream,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.primary,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  safetyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  safetyTitle: { color: C.primary, fontFamily: fontFamily.bold, fontSize: fontSize.sm, marginBottom: 4 },
  safetyText:  { color: C.textSecondary, fontFamily: fontFamily.regular, fontSize: fontSize.xs, lineHeight: 18 },

  /* ── Action buttons ── */
  actionRow: { flexDirection: 'row', gap: 10, marginTop: spacing.lg },
  homeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: C.primaryDark,
    borderRadius: 999,
    paddingVertical: 14,
    minHeight: 50,
  },
  homeBtnText: { color: C.surface, fontFamily: fontFamily.extraBold, fontSize: fontSize.sm },
  closeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: C.surface,
    borderRadius: 999,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: C.primary,
    minHeight: 50,
  },
  closeBtnText: { color: C.primary, fontFamily: fontFamily.bold, fontSize: fontSize.sm },
});
