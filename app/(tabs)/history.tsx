// app/(tabs)/history.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { reportService } from '../../services/reportService';

// ── Detect type from _class field ──
const getReportType = (item: any): 'SIGHTING' | 'DAMAGE' => {
  if (item._class?.includes('SightingReport')) return 'SIGHTING';
  if (item._class?.includes('DamageReport')) return 'DAMAGE';
  if (item.numberOfElephants !== undefined) return 'SIGHTING';
  return 'DAMAGE';
};

const formatBehavior = (b: string) => {
  const map: Record<string, string> = {
    CALM: 'Calm', AGGRESSIVE: 'Aggressive', MOVING: 'Moving', FEEDING: 'Feeding',
  };
  return map[b] || b;
};

const formatDamageType = (d: string) => {
  const map: Record<string, string> = {
    CROP: 'Crop Damage', PROPERTY: 'Property Damage',
    VEHICLE: 'Vehicle Damage', HUMAN_INJURY: 'Human Injury',
  };
  return map[d] || d;
};

const formatDate = (raw: any) => {
  try {
    if (!raw) return 'Unknown time';
    if (Array.isArray(raw)) {
      const [y, mo, d, h = 0, m = 0] = raw;
      return `${d}/${mo}/${y}  ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    return new Date(raw).toLocaleString();
  } catch { return 'Unknown time'; }
};

export default function HistoryScreen() {
  const [activeTab, setActiveTab] = useState<'SIGHTING' | 'DAMAGE'>('SIGHTING');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any | null>(null); // ← selected report for popup

  // ── Reload when tab gains focus ──
  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getMyReports();
      const list = Array.isArray(data) ? data : [];

      // Sort newest first
      const sorted = list.sort((a: any, b: any) => {
        const toMs = (raw: any) => {
          if (!raw) return 0;
          if (Array.isArray(raw)) {
            const [y, mo, d, h = 0, m = 0, s = 0] = raw;
            return new Date(y, mo - 1, d, h, m, s).getTime();
          }
          return new Date(raw).getTime();
        };
        return toMs(b.dateTime || b.submittedAt) - toMs(a.dateTime || a.submittedAt);
      });

      setReports(sorted);
    } catch (error) {
      console.log('Fetch error:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = reports.filter((r) => getReportType(r) === activeTab);

  return (
    <View style={styles.container}>

      <Text style={styles.heading}>History</Text>

      {/* ── TABS ── */}
      <View style={styles.tabRow}>
        {(['SIGHTING', 'DAMAGE'] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'SIGHTING' ? '🐘 Sightings' : '⚠️ Damage'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── COUNT ── */}
      <Text style={styles.countText}>
        {filtered.length} report{filtered.length !== 1 ? 's' : ''}
      </Text>

      {loading ? (
        <ActivityIndicator color="#13ec37" style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.reportId || item.id || Math.random().toString()}
          contentContainerStyle={{ paddingBottom: 30 }}
          onRefresh={fetchReports}
          refreshing={loading}
          renderItem={({ item }) => {
            const type = getReportType(item);
            return (
              // ✅ Tap row → open popup
              <Pressable
                onPress={() => setSelected(item)}
                style={[styles.card, { borderLeftColor: type === 'SIGHTING' ? '#13ec37' : '#ef4444' }]}
              >
                {/* Thumbnail if image exists */}
                {item.imagePath && (
                  <Image
                    source={{ uri: item.imagePath }}
                    style={styles.thumbnail}
                  />
                )}

                <View style={{ flex: 1 }}>
                  {/* Title row */}
                  <View style={styles.rowBetween}>
                    <Text style={styles.cardTitle}>
                      {type === 'SIGHTING'
                        ? `🐘 ${item.numberOfElephants} Elephant${item.numberOfElephants > 1 ? 's' : ''}`
                        : `⚠️ ${formatDamageType(item.damageType)}`}
                    </Text>
                    <MaterialIcons
                      name={type === 'SIGHTING' ? 'visibility' : 'warning'}
                      size={18}
                      color={type === 'SIGHTING' ? '#13ec37' : '#ef4444'}
                    />
                  </View>

                  {/* Subtitle */}
                  {type === 'SIGHTING' && item.behavior && (
                    <Text style={styles.cardSub}>
                      Behavior: {formatBehavior(item.behavior)}
                    </Text>
                  )}
                  {type === 'DAMAGE' && item.status && (
                    <Text style={[styles.cardSub, {
                      color: item.status === 'PENDING' ? '#f59e0b' : '#13ec37'
                    }]}>
                      Status: {item.status}
                    </Text>
                  )}

                  {/* Location & time */}
                  <Text style={styles.cardLocation}>
                    📍 {item.village}{item.district ? `, ${item.district}` : ''}
                  </Text>
                  <Text style={styles.cardTime}>⏱ {formatDate(item.dateTime)}</Text>
                </View>

                {/* Tap hint */}
                <MaterialIcons name="chevron-right" size={20} color="#4a6650" style={{ alignSelf: 'center' }} />
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <MaterialIcons
                name={activeTab === 'SIGHTING' ? 'visibility-off' : 'warning'}
                size={48} color="#2d4a34"
              />
              <Text style={styles.emptyText}>
                No {activeTab === 'SIGHTING' ? 'sighting' : 'damage'} reports yet
              </Text>
              <Text style={styles.emptyHint}>Pull down to refresh</Text>
            </View>
          }
        />
      )}

      {/* ════════════════════════════════
            REPORT DETAIL POPUP MODAL
          ════════════════════════════════ */}
      <Modal
        visible={!!selected}
        animationType="slide"
        transparent
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSelected(null)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            {selected && <ReportDetail report={selected} onClose={() => setSelected(null)} />}
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}

// ════════════════════════════════
//   REPORT DETAIL COMPONENT
// ════════════════════════════════
function ReportDetail({ report, onClose }: { report: any; onClose: () => void }) {
  const type = getReportType(report);
  const isSighting = type === 'SIGHTING';
  const accentColor = isSighting ? '#13ec37' : '#ef4444';

  return (
    <ScrollView showsVerticalScrollIndicator={false}>

      {/* ── Top bar ── */}
      <View style={styles.popupTopBar}>
        <Text style={[styles.popupTitle, { color: accentColor }]}>
          {isSighting ? '🐘 Sighting Report' : '⚠️ Damage Report'}
        </Text>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <MaterialIcons name="close" size={22} color="#9ca3af" />
        </Pressable>
      </View>

      {/* ── Evidence Image ── */}
      {report.imagePath ? (
        <Image
          source={{ uri: report.imagePath }}
          style={styles.popupImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.noImageBox}>
          <MaterialIcons name="image-not-supported" size={36} color="#4a6650" />
          <Text style={styles.noImageText}>No evidence image</Text>
        </View>
      )}

      {/* ── Info rows ── */}
      <View style={styles.infoBox}>

        {/* Location */}
        <InfoRow icon="location-pin" label="Location"
          value={`${report.village || '—'}${report.district ? `, ${report.district}` : ''}`}
          color={accentColor} />

        {/* Date */}
        <InfoRow icon="schedule" label="Reported At"
          value={formatDate(report.dateTime)}
          color={accentColor} />

        {/* Sighting specific */}
        {isSighting && (
          <>
            <InfoRow icon="groups" label="Number of Elephants"
              value={String(report.numberOfElephants)}
              color={accentColor} />
            <InfoRow icon="psychology" label="Behavior"
              value={formatBehavior(report.behavior)}
              color={accentColor} />
            {report.additionalNotes && (
              <InfoRow icon="notes" label="Additional Notes"
                value={report.additionalNotes}
                color={accentColor} />
            )}
          </>
        )}

        {/* Damage specific */}
        {!isSighting && (
          <>
            <InfoRow icon="warning" label="Damage Type"
              value={formatDamageType(report.damageType)}
              color={accentColor} />
            {report.description && (
              <InfoRow icon="description" label="Description"
                value={report.description}
                color={accentColor} />
            )}
            <InfoRow icon="flag" label="Status"
              value={report.status || 'PENDING'}
              color={report.status === 'PENDING' ? '#f59e0b' : accentColor} />
          </>
        )}

        {/* Report ID */}
        <InfoRow icon="tag" label="Report ID"
          value={report.reportId || '—'}
          color="#6b7280" />

      </View>

    </ScrollView>
  );
}

// ── Reusable info row ──
function InfoRow({ icon, label, value, color }: {
  icon: any; label: string; value: string; color: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { borderColor: color + '44' }]}>
        <MaterialIcons name={icon} size={16} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#102213', padding: 20 },

  heading: { color: 'white', fontSize: 22, fontWeight: 'bold', paddingTop: 25 },

  // ── Tabs ──
  tabRow: {
    flexDirection: 'row', marginTop: 20,
    backgroundColor: '#1c3020', borderRadius: 12,
  },
  tab: { flex: 1, padding: 12, borderRadius: 12 },
  tabActive: { backgroundColor: '#13ec37' },
  tabText: { textAlign: 'center', fontWeight: 'bold', color: '#9ca3af' },
  tabTextActive: { color: 'black' },

  countText: { color: '#9ca3af', fontSize: 12, marginTop: 8, marginBottom: 4 },

  // ── List card ──
  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#1c3020', padding: 14,
    borderRadius: 14, marginBottom: 12,
    borderLeftWidth: 3, gap: 10,
  },

  thumbnail: {
    width: 56, height: 56, borderRadius: 10,
    backgroundColor: '#0d2211',
  },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  cardTitle: { color: 'white', fontWeight: 'bold', fontSize: 14, flex: 1 },
  cardSub: { color: '#9ca3af', fontSize: 12, marginTop: 3 },
  cardLocation: { color: '#9ca3af', marginTop: 5, fontSize: 12 },
  cardTime: { color: '#6b7280', marginTop: 2, fontSize: 11 },

  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#9ca3af', marginTop: 12, fontSize: 15 },
  emptyHint: { color: '#6b7280', marginTop: 4, fontSize: 12 },

  // ── Modal ──
  backdrop: {
    flex: 1, backgroundColor: '#000000bb', justifyContent: 'flex-end',
  },

  popup: {
    backgroundColor: '#1c3020',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, paddingBottom: 40,
    maxHeight: '90%',
  },

  popupTopBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },

  popupTitle: { fontSize: 18, fontWeight: 'bold' },

  closeBtn: { padding: 4 },

  // ── Evidence image in popup ──
  popupImage: {
    width: '100%', height: 220,
    borderRadius: 16, marginBottom: 16,
    backgroundColor: '#0d2211',
  },

  noImageBox: {
    width: '100%', height: 120,
    borderRadius: 16, marginBottom: 16,
    backgroundColor: '#0d2211',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#2d4a34',
    borderStyle: 'dashed',
  },

  noImageText: { color: '#4a6650', marginTop: 8, fontSize: 13 },

  // ── Info rows in popup ──
  infoBox: { gap: 12 },

  infoRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },

  infoIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#0d2211', borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },

  infoLabel: { color: '#6b7280', fontSize: 11, marginBottom: 2 },
  infoValue: { color: 'white', fontSize: 14, fontWeight: '600' },
});