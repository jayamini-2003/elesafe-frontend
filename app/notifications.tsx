// app/notifications.tsx
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from "../constants/theme";
import React, { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import AppHeader from '../components/AppHeader';
import { SightingAlert, useAlertSocket } from '../hooks/useAlertSocket';
import { fontSize, fontFamily, spacing } from '../utils/responsive';

const C = theme.colors;

const BEHAVIOR_CONFIG: Record<string, { color: string; icon: string }> = {
  AGGRESSIVE: { color: C.danger,   icon: 'alert-circle'          },
  MOVING:     { color: '#f97316',  icon: 'run-fast'               },
  CALM:       { color: C.primary,  icon: 'emoticon-happy-outline' },
  FEEDING:    { color: '#3b82f6',  icon: 'food'                   },
};

function timeAgo(receivedAt: number): string {
  const diff = Math.floor((Date.now() - receivedAt) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Notifications() {
  const { alertHistory, markAllRead, markOneRead } = useAlertSocket();

  useEffect(() => { markAllRead(); }, []);

  const handleAlertPress = (alert: SightingAlert) => {
    markOneRead(alert.reportId);
    router.push({ pathname: '/alert-detail', params: { alert: JSON.stringify(alert) } });
  };

  return (
    <View style={styles.screen}>

      <AppHeader
        title="Alerts"
        subtitle={alertHistory.length > 0 ? `${alertHistory.length} alert${alertHistory.length > 1 ? 's' : ''} · Last 24h` : 'Last 24 hours'}
        mode="back"
        backRoute="/(drawer)/home"
        rightIcon={alertHistory.length > 0 ? "notifications-active" : "notifications-none"}
        rightIconColor={alertHistory.length > 0 ? C.danger : C.surface}
        rightBadge={alertHistory.length}
      />

      <FlatList
        data={alertHistory}
        keyExtractor={(item) => item.reportId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const cfg = BEHAVIOR_CONFIG[item.behavior] ?? { color: C.textMuted, icon: 'help-circle' };
          return (
            <Pressable
              style={({ pressed }) => [styles.alertCard, pressed && styles.alertCardPressed]}
              onPress={() => handleAlertPress(item)}
            >
              {/* Left color bar */}
              <View style={[styles.cardLeftBar, { backgroundColor: cfg.color }]} />

              {/* Behavior icon circle */}
              <View style={[styles.iconWrap, { backgroundColor: cfg.color + '22' }]}>
                <MaterialCommunityIcons name={cfg.icon as any} size={22} color={cfg.color} />
              </View>

              {/* Card body */}
              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    🐘 {item.village}, {item.district}
                  </Text>
                  <Text style={styles.timeText}>{timeAgo(item.receivedAt)}</Text>
                </View>
                <View style={styles.cardTagRow}>
                  <View style={[styles.behaviorTag, { backgroundColor: cfg.color + '18', borderColor: cfg.color + '44' }]}>
                    <Text style={[styles.behaviorTagText, { color: cfg.color }]}>
                      {item.behavior}
                    </Text>
                  </View>
                  <Text style={styles.cardSub}>
                    {item.numberOfElephants} elephant{item.numberOfElephants > 1 ? 's' : ''}
                  </Text>
                </View>
                {item.additionalNotes ? (
                  <Text style={styles.cardNotes} numberOfLines={1}>{item.additionalNotes}</Text>
                ) : null}
              </View>

              <MaterialIcons name="chevron-right" size={20} color={C.textMuted} style={{ marginRight: 4 }} />
            </Pressable>
          );
        }}
        ListHeaderComponent={
          alertHistory.length > 0 ? (
            <View style={styles.listHeader}>
              <View style={styles.liveDot} />
              <Text style={styles.listHeaderText}>Live elephant activity feed</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="bell-sleep-outline" size={42} color={C.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No alerts yet</Text>
            <Text style={styles.emptySub}>
              Live elephant sighting alerts will appear here when reported nearby.
            </Text>
            <Pressable
              style={styles.emptyHomeBtn}
              onPress={() => router.replace('/(drawer)/home')}
            >
              <MaterialIcons name="home" size={16} color={C.surface} />
              <Text style={styles.emptyHomeBtnText}>Back to Home</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  list: { padding: spacing.md, gap: 10, paddingBottom: 40 },

  /* ── List header ── */
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: spacing.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.primary,
  },
  listHeaderText: {
    color: C.textMuted,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semiBold,
    letterSpacing: 0.5,
  },

  /* ── Alert card ── */
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    overflow: 'hidden',
    gap: 10,
    paddingRight: 12,
    paddingVertical: 12,
    shadowColor: C.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  alertCardPressed: { backgroundColor: C.bgSubtle },

  cardLeftBar: { width: 4, alignSelf: 'stretch' },

  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  cardBody: { flex: 1 },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    color: C.text,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    flex: 1,
  },
  timeText: {
    color: C.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginLeft: 6,
  },

  cardTagRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  behaviorTag:  {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  behaviorTagText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxs,
  },
  cardSub:  { color: C.textMuted, fontFamily: fontFamily.regular, fontSize: fontSize.xs },
  cardNotes:{ color: C.textMuted, fontFamily: fontFamily.regular, fontSize: fontSize.xxs, marginTop: 2 },

  /* ── Empty state ── */
  emptyWrap: { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: 32, gap: 12 },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.bgSubtle,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    color: C.text,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    marginTop: 4,
  },
  emptySub: {
    color: C.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.primaryDark,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 4,
  },
  emptyHomeBtnText: {
    color: C.surface,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
  },
});
