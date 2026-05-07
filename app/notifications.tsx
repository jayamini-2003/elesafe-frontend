// app/notifications.tsx
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SightingAlert, useAlertSocket } from '../hooks/useAlertSocket';

const BEHAVIOR_CONFIG: Record<string, { color: string; icon: string }> = {
  AGGRESSIVE: { color: '#ef4444', icon: 'alert-circle' },
  MOVING:     { color: '#f97316', icon: 'run-fast' },
  CALM:       { color: '#13ec37', icon: 'emoticon-happy-outline' },
  FEEDING:    { color: '#3b82f6', icon: 'food' },
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

  // Bell badge goes to 0 the moment user opens this screen
  useEffect(() => {
    markAllRead();
  }, []);

  const handleAlertPress = (alert: SightingAlert) => {
    markOneRead(alert.reportId); // safe to call even after markAllRead
    router.push({
      pathname: '/alert-detail',
      params: { alert: JSON.stringify(alert) },
    });
  };

  return (
    <View style={styles.screen}>

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color="white" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Alerts</Text>
          <Text style={styles.headerSub}>Last 24 hours</Text>
        </View>
        {alertHistory.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{alertHistory.length}</Text>
          </View>
        )}
      </View>

      {/* LIST */}
      <FlatList
        data={alertHistory}
        keyExtractor={(item) => item.reportId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const cfg = BEHAVIOR_CONFIG[item.behavior] ?? { color: '#9ca3af', icon: 'help-circle' };
          return (
            <Pressable style={styles.alertCard} onPress={() => handleAlertPress(item)}>
              <View style={[styles.iconWrap, { backgroundColor: cfg.color + '22' }]}>
                <MaterialCommunityIcons name={cfg.icon as any} size={22} color={cfg.color} />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    🐘 {item.village}, {item.district}
                  </Text>
                  <Text style={styles.timeText}>{timeAgo(item.receivedAt)}</Text>
                </View>
                <Text style={styles.cardSub} numberOfLines={1}>
                  {item.numberOfElephants} elephant{item.numberOfElephants > 1 ? 's' : ''} ·{' '}
                  <Text style={{ color: cfg.color }}>{item.behavior}</Text>
                </Text>
                {item.additionalNotes ? (
                  <Text style={styles.cardNotes} numberOfLines={1}>
                    {item.additionalNotes}
                  </Text>
                ) : null}
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#4a6650" />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="bell-sleep-outline" size={52} color="#2d4a34" />
            <Text style={styles.emptyTitle}>No alerts yet</Text>
            <Text style={styles.emptySub}>
              Live elephant sighting alerts will appear here when they are reported.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#102213' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#1c3020',
    borderBottomWidth: 1,
    borderBottomColor: '#2d4a34',
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#0d2211',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '700' },
  headerSub:   { color: '#6b7280', fontSize: 11, marginTop: 1 },
  countBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 99, minWidth: 26, alignItems: 'center',
  },
  countText: { color: 'white', fontSize: 12, fontWeight: '700' },
  list: { padding: 16, gap: 10 },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c3020',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2d4a34',
    padding: 12,
    gap: 10,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  cardBody: { flex: 1 },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  cardTitle: { color: 'white', fontWeight: '700', fontSize: 13, flex: 1 },
  timeText: { color: '#6b7280', fontSize: 11, marginLeft: 6 },
  cardSub: { color: '#9ca3af', fontSize: 12 },
  cardNotes: { color: '#4a6650', fontSize: 11, marginTop: 2 },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: { color: '#9ca3af', fontSize: 17, fontWeight: '700' },
  emptySub: { color: '#4a6650', fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
