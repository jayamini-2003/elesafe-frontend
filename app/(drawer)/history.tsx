// app/(drawer)/history.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { safeTop, fontSize, fontFamily, spacing, vs } from '../../utils/responsive';
import { theme } from "../../constants/theme";
import AppHeader from '../../components/AppHeader';
import { useTranslation } from '../../context/LocaleContext';
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
import {
  formatReportDateTime,
  parseReportDateTime,
} from '../../utils/sriLankaTime';

const C = theme.colors;

const getReportType = (item: any): 'SIGHTING' | 'DAMAGE' => {
  if (item._class?.includes('SightingReport')) return 'SIGHTING';
  if (item._class?.includes('DamageReport')) return 'DAMAGE';
  if (item.numberOfElephants !== undefined) return 'SIGHTING';
  return 'DAMAGE';
};

const formatBehavior = (b: string, t: (key: string) => string) => {
  const key = `map.behaviors.${b}`;
  return t(key) !== key ? t(key) : b;
};

const formatDamageType = (d: string, t: (key: string) => string) => {
  const key = `history.damageTypes.${d}`;
  return t(key) !== key ? t(key) : d;
};

const formatDate = (raw: any, t: (key: string) => string) =>
  formatReportDateTime(raw, t('common.unknownTime'));

export default function HistoryScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'SIGHTING' | 'DAMAGE'>('SIGHTING');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  useFocusEffect(
    useCallback(() => { fetchReports(); }, [])
  );

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getMyReports();
      const list = Array.isArray(data) ? data : [];
      const sorted = list.sort((a: any, b: any) => {
        const toMs = (raw: any) => parseReportDateTime(raw);
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
    <View style={styles.screen}>

      <AppHeader title={t('history.title')} subtitle={t('history.subtitle')} />

      <View style={styles.container}>

        {/* TABS — pill-shaped segmented control */}
        <View style={styles.tabBar}>
          {(['SIGHTING', 'DAMAGE'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'SIGHTING' ? t('history.sightings') : t('history.damage')}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.countText}>
          {t('common.reports', { count: filtered.length })}
        </Text>

        {loading ? (
          <ActivityIndicator color={C.primary} style={{ marginTop: 40 }} size="large" />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.reportId || item.id || Math.random().toString()}
            contentContainerStyle={{ paddingBottom: 30 }}
            onRefresh={fetchReports}
            refreshing={loading}
            renderItem={({ item }) => {
              const type = getReportType(item);
              const accentColor = type === 'SIGHTING' ? C.primary : C.danger;
              return (
                <Pressable
                  onPress={() => setSelected(item)}
                  style={[styles.card, { borderLeftColor: accentColor }]}
                >
                  {item.imagePath ? (
                    <Image source={{ uri: item.imagePath }} style={styles.thumbnail} />
                  ) : (
                    <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                      <MaterialIcons
                        name={type === 'SIGHTING' ? 'visibility' : 'warning'}
                        size={26}
                        color={accentColor}
                      />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>
                      {type === 'SIGHTING'
                        ? `🐘 ${t('common.elephants', { count: item.numberOfElephants })}`
                        : `⚠️ ${formatDamageType(item.damageType, t)}`}
                    </Text>
                    {type === 'SIGHTING' && item.behavior && (
                      <Text style={styles.cardSub}>{t('history.behavior')} {formatBehavior(item.behavior, t)}</Text>
                    )}
                    {type === 'DAMAGE' && item.status && (
                      <Text style={[styles.cardSub, {
                        color: item.status === 'PENDING' ? '#f59e0b' : C.primary,
                      }]}>
                        {t('history.status')} {item.status}
                      </Text>
                    )}
                    <Text style={styles.cardLocation}>
                      📍 {item.village}{item.district ? `, ${item.district}` : ''}
                    </Text>
                    <Text style={styles.cardTime}>⏱ {formatDate(item.dateTime, t)}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={C.textMuted} style={{ alignSelf: 'center' }} />
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <View style={styles.emptyIconCircle}>
                  <MaterialIcons
                    name={activeTab === 'SIGHTING' ? 'visibility-off' : 'warning'}
                    size={32} color={C.textMuted}
                  />
                </View>
                <Text style={styles.emptyText}>
                  {t('history.noReports', {
                    type: activeTab === 'SIGHTING' ? t('history.reportTypeSightings') : t('history.reportTypeDamage'),
                  })}
                </Text>
                <Text style={styles.emptyHint}>{t('history.pullRefresh')}</Text>
              </View>
            }
          />
        )}

        <Modal
          visible={!!selected}
          animationType="slide"
          transparent
          onRequestClose={() => setSelected(null)}
        >
          <Pressable style={styles.backdrop} onPress={() => setSelected(null)}>
            <Pressable style={styles.popup} onPress={() => {}}>
              <View style={styles.handleBar} />
              {selected && <ReportDetail report={selected} onClose={() => setSelected(null)} />}
            </Pressable>
          </Pressable>
        </Modal>

      </View>
    </View>
  );
}

function ReportDetail({ report, onClose }: { report: any; onClose: () => void }) {
  const { t } = useTranslation();
  const type = getReportType(report);
  const isSighting = type === 'SIGHTING';
  const accentColor = isSighting ? C.primary : C.danger;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.popupTopBar}>
        <Text style={[styles.popupTitle, { color: accentColor }]}>
          {isSighting ? t('history.sightingReport') : t('history.damageReport')}
        </Text>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <MaterialIcons name="close" size={22} color={C.textMuted} />
        </Pressable>
      </View>

      {report.imagePath ? (
        <Image source={{ uri: report.imagePath }} style={styles.popupImage} resizeMode="cover" />
      ) : (
        <View style={styles.noImageBox}>
          <MaterialIcons name="image-not-supported" size={36} color={C.textMuted} />
          <Text style={styles.noImageText}>{t('history.noEvidence')}</Text>
        </View>
      )}

      <View style={styles.infoBox}>
        <InfoRow icon="location-pin" label={t('history.location')}
          value={`${report.village || '—'}${report.district ? `, ${report.district}` : ''}`}
          color={accentColor} />
        <InfoRow icon="schedule" label={t('history.reportedAt')}
          value={formatDate(report.dateTime, t)} color={accentColor} />
        {isSighting && (
          <>
            <InfoRow icon="groups" label={t('history.numberOfElephants')}
              value={String(report.numberOfElephants)} color={accentColor} />
            <InfoRow icon="psychology" label={t('history.behavior').replace(/:$/, '')}
              value={formatBehavior(report.behavior, t)} color={accentColor} />
            {report.additionalNotes && (
              <InfoRow icon="notes" label={t('history.additionalNotes')}
                value={report.additionalNotes} color={accentColor} />
            )}
          </>
        )}
        {!isSighting && (
          <>
            <InfoRow icon="warning" label={t('history.damageType')}
              value={formatDamageType(report.damageType, t)} color={accentColor} />
            {report.description && (
              <InfoRow icon="description" label={t('history.description')}
                value={report.description} color={accentColor} />
            )}
            <InfoRow icon="flag" label={t('history.status').replace(/:$/, '')}
              value={report.status || 'PENDING'}
              color={report.status === 'PENDING' ? '#f59e0b' : accentColor} />
          </>
        )}
        <InfoRow icon="tag" label={t('history.reportId')}
          value={report.reportId || '—'} color={C.textMuted} />
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, color }: {
  icon: any; label: string; value: string; color: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: color + '18' }]}>
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
  screen:    { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.md },

  /* ── Tab bar ── */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.primaryDark,
    borderRadius: 999,
    padding: 4,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: C.primary },
  tabText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: C.mist,
    textAlign: 'center',
  },
  tabTextActive: { color: C.surface },

  countText: {
    color: C.textMuted,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.medium,
    marginBottom: spacing.sm,
    marginLeft: 2,
  },

  /* ── List cards ── */
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    gap: 12,
    shadowColor: C.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: C.bgSubtle,
    flexShrink: 0,
  },
  thumbnailPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: C.text,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    marginBottom: 3,
  },
  cardSub:      { color: C.textMuted, fontFamily: fontFamily.regular, fontSize: fontSize.xs, marginTop: 2 },
  cardLocation: { color: C.textMuted, fontFamily: fontFamily.regular, fontSize: fontSize.xs, marginTop: 4 },
  cardTime:     { color: C.textMuted, fontFamily: fontFamily.regular, fontSize: fontSize.xs, marginTop: 2 },

  /* ── Empty state ── */
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.bgSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyText: { color: C.text, fontFamily: fontFamily.bold, fontSize: fontSize.base, textAlign: 'center' },
  emptyHint: { color: C.textMuted, fontFamily: fontFamily.regular, fontSize: fontSize.xs, marginTop: 6 },

  /* ── Detail modal ── */
  backdrop: { flex: 1, backgroundColor: 'rgba(6,26,14,0.55)', justifyContent: 'flex-end' },
  popup: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.md,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  popupTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  popupTitle: { fontFamily: fontFamily.bold, fontSize: fontSize.lg },
  closeBtn: { padding: 4 },
  popupImage: {
    width: '100%',
    height: vs(220),
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: C.bgSubtle,
  },
  noImageBox: {
    width: '100%',
    height: vs(120),
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: C.bgSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
  },
  noImageText: { color: C.textMuted, fontFamily: fontFamily.regular, marginTop: 8, fontSize: fontSize.xs },

  /* ── Info rows in modal ── */
  infoBox: { gap: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoLabel: { color: C.textMuted, fontFamily: fontFamily.regular, fontSize: fontSize.xs, marginBottom: 2 },
  infoValue: { color: C.text, fontFamily: fontFamily.semiBold, fontSize: fontSize.sm },
});
