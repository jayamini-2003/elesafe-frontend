// app/alert-detail.tsx
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SightingAlert } from '../hooks/useAlertSocket';

const BEHAVIOR_CONFIG: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  AGGRESSIVE: { color: '#ef4444', bg: '#3a1010', label: 'Aggressive', icon: 'alert-circle' },
  MOVING:     { color: '#f97316', bg: '#3a1f0a', label: 'Moving',     icon: 'run-fast' },
  CALM:       { color: '#13ec37', bg: '#0d2211', label: 'Calm',       icon: 'emoticon-happy-outline' },
  FEEDING:    { color: '#3b82f6', bg: '#0a1a3a', label: 'Feeding',    icon: 'food' },
};

function formatDateTime(dt: string) {
  try {
    // Handle Java LocalDateTime array format [2025,5,3,14,30,0] or ISO string
    if (Array.isArray(JSON.parse(dt))) {
      const parts = JSON.parse(dt) as number[];
      const d = new Date(parts[0], parts[1] - 1, parts[2], parts[3] ?? 0, parts[4] ?? 0);
      return d.toLocaleString();
    }
  } catch {}
  return new Date(dt).toLocaleString();
}

export default function AlertDetailScreen() {
  // Alert data is passed as a JSON string param via router.push
  const params = useLocalSearchParams<{ alert: string }>();
  const alert: SightingAlert = JSON.parse(params.alert);

  const behavior = BEHAVIOR_CONFIG[alert.behavior] ?? {
    color: '#9ca3af', bg: '#1c3020', label: alert.behavior, icon: 'help-circle',
  };

  return (
    <View style={styles.screen}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>Alert Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── HERO CARD ── */}
        <View style={[styles.heroCard, { borderColor: behavior.color }]}>
          <View style={[styles.behaviorBadge, { backgroundColor: behavior.bg }]}>
            <MaterialCommunityIcons
              name={behavior.icon as any}
              size={32}
              color={behavior.color}
            />
          </View>
          <Text style={styles.reportId}>{alert.reportId}</Text>
          <View style={[styles.behaviorPill, { backgroundColor: behavior.bg, borderColor: behavior.color }]}>
            <Text style={[styles.behaviorPillText, { color: behavior.color }]}>
              {behavior.label} Behavior
            </Text>
          </View>
          <Text style={styles.elephantCount}>
            🐘 {alert.numberOfElephants} Elephant{alert.numberOfElephants > 1 ? 's' : ''} spotted
          </Text>
        </View>

        {/* ── LOCATION ── */}
        <SectionLabel label="Location" />
        <InfoCard>
          <InfoRow icon="location-city" label="Village"  value={alert.village} />
          <InfoRow icon="map"           label="District" value={alert.district} />
          {alert.latitude != null && (
            <InfoRow
              icon="my-location"
              label="GPS"
              value={`${alert.latitude.toFixed(5)}, ${alert.longitude?.toFixed(5)}`}
            />
          )}
        </InfoCard>

        {/* ── SIGHTING INFO ── */}
        <SectionLabel label="Sighting Details" />
        <InfoCard>
          <InfoRow icon="access-time"  label="Reported at" value={formatDateTime(alert.dateTime)} />
          <InfoRow icon="person"       label="Reported by" value={alert.reporterId} />
          {alert.additionalNotes ? (
            <InfoRow icon="notes" label="Notes" value={alert.additionalNotes} />
          ) : null}
        </InfoCard>

        {/* ── SAFETY TIP ── */}
        <View style={styles.safetyBox}>
          <MaterialIcons name="health-and-safety" size={20} color="#13ec37" />
          <Text style={styles.safetyText}>
            Stay indoors, keep lights on, and alert your neighbours. Do not approach elephants.
          </Text>
        </View>

        {/* ── CLOSE ── */}
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>Close Alert</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}

// ── Small helpers ──

function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={styles.sectionLabel}>{label.toUpperCase()}</Text>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.infoCard}>{children}</View>;
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <MaterialIcons name={icon} size={17} color="#13ec37" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#102213' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#1c3020',
    borderBottomWidth: 1,
    borderBottomColor: '#2d4a34',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#0d2211',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },

  content: { padding: 16, paddingBottom: 40 },

  // Hero
  heroCard: {
    backgroundColor: '#1c3020',
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    padding: 20,
    marginBottom: 8,
  },
  behaviorBadge: {
    width: 64, height: 64, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  reportId: {
    color: '#9ca3af', fontSize: 12,
    fontWeight: '600', letterSpacing: 1,
    marginBottom: 8,
  },
  behaviorPill: {
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 99, borderWidth: 1,
    marginBottom: 10,
  },
  behaviorPillText: { fontSize: 13, fontWeight: '700' },
  elephantCount: { color: 'white', fontSize: 16, fontWeight: '700' },

  // Section label
  sectionLabel: {
    color: '#4a6650', fontSize: 11,
    fontWeight: '600', letterSpacing: 0.8,
    marginTop: 16, marginBottom: 6, marginLeft: 4,
  },

  // Info card
  infoCard: {
    backgroundColor: '#1c3020',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2d4a34',
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2d4a34',
  },
  infoIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#0d2211',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  infoLabel: { color: '#6b7280', fontSize: 11, marginBottom: 1 },
  infoValue: { color: 'white', fontSize: 13, fontWeight: '600' },

  // Safety
  safetyBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: '#0d2211',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#13ec37',
    padding: 12,
    marginTop: 16,
  },
  safetyText: { color: '#d1fae5', fontSize: 12, flex: 1, lineHeight: 18 },

  // Close
  closeBtn: {
    marginTop: 20,
    backgroundColor: '#13ec37',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  closeBtnText: { color: '#0d2211', fontSize: 15, fontWeight: '800' },
});
