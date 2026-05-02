// app/(tabs)/history.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { reportService } from '../../services/reportService';

// ✅ Detect type from MongoDB _class field
const getReportType = (item: any): 'SIGHTING' | 'DAMAGE' => {
  if (item._class && item._class.includes('SightingReport')) return 'SIGHTING';
  if (item._class && item._class.includes('DamageReport')) return 'DAMAGE';
  // fallback: if it has numberOfElephants it's a sighting
  if (item.numberOfElephants !== undefined) return 'SIGHTING';
  return 'DAMAGE';
};

// ✅ Format behavior for display
const formatBehavior = (b: string) => {
  const map: Record<string, string> = {
    CALM: 'Calm',
    AGGRESSIVE: 'Aggressive',
    MOVING: 'Moving',
    FEEDING: 'Feeding',
  };
  return map[b] || b;
};

// ✅ Format damage type for display
const formatDamageType = (d: string) => {
  const map: Record<string, string> = {
    CROP: 'Crop Damage',
    PROPERTY: 'Property Damage',
    VEHICLE: 'Vehicle Damage',
    HUMAN_INJURY: 'Human Injury',
  };
  return map[d] || d;
};

// ✅ Format date safely
const formatDate = (item: any) => {
  try {
    const raw = item.dateTime || item.submittedAt;
    if (!raw) return 'Unknown time';
    // Backend sends LocalDateTime array [year,month,day,hour,min,sec]
    if (Array.isArray(raw)) {
      const [y, mo, d, h, m] = raw;
      return `${d}/${mo}/${y}  ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    return new Date(raw).toLocaleString();
  } catch {
    return 'Unknown time';
  }
};

export default function HistoryScreen() {
  const [activeTab, setActiveTab] = useState<'SIGHTING' | 'DAMAGE'>('SIGHTING');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Reload every time this tab comes into focus (after submit)
  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getMyReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Fetch error:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filter using _class based detection
  const filtered = reports.filter((r) => getReportType(r) === activeTab);

  return (
    <View style={{ flex: 1, backgroundColor: '#102213', padding: 20 }}>

      <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold', paddingTop: 25 }}>
        History
      </Text>

      {/* TABS */}
      <View style={{
        flexDirection: 'row', marginTop: 20,
        backgroundColor: '#1c3020', borderRadius: 12,
      }}>
        {(['SIGHTING', 'DAMAGE'] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: 12, borderRadius: 12,
              backgroundColor: activeTab === tab ? '#13ec37' : 'transparent',
            }}
          >
            <Text style={{
              textAlign: 'center', fontWeight: 'bold',
              color: activeTab === tab ? 'black' : '#9ca3af',
            }}>
              {tab === 'SIGHTING' ? 'Sightings' : 'Damage'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* COUNT BADGE */}
      <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 10, marginLeft: 2 }}>
        {filtered.length} report{filtered.length !== 1 ? 's' : ''} found
      </Text>

      {loading ? (
        <ActivityIndicator color="#13ec37" style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.reportId || item.id || Math.random().toString()}
          contentContainerStyle={{ marginTop: 10, paddingBottom: 20 }}
          onRefresh={fetchReports}
          refreshing={loading}
          renderItem={({ item }) => {
            const type = getReportType(item);
            return (
              <View style={{
                backgroundColor: '#1c3020',
                padding: 15,
                borderRadius: 14,
                marginBottom: 12,
                borderLeftWidth: 3,
                borderLeftColor: type === 'SIGHTING' ? '#13ec37' : '#ef4444',
              }}>

                {/* TOP ROW */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15, flex: 1 }}>
                    {type === 'SIGHTING'
                      ? `🐘 ${item.numberOfElephants} Elephant(s)`
                      : `⚠️ ${formatDamageType(item.damageType)}`}
                  </Text>
                  <MaterialIcons
                    name={type === 'SIGHTING' ? 'visibility' : 'warning'}
                    size={18}
                    color={type === 'SIGHTING' ? '#13ec37' : '#ef4444'}
                  />
                </View>

                {/* DETAILS */}
                {type === 'SIGHTING' && item.behavior && (
                  <Text style={{ color: '#13ec37', fontSize: 12, marginTop: 4 }}>
                    Behavior: {formatBehavior(item.behavior)}
                  </Text>
                )}
                {type === 'DAMAGE' && item.status && (
                  <Text style={{
                    color: item.status === 'PENDING' ? '#f59e0b' : '#13ec37',
                    fontSize: 12, marginTop: 4,
                  }}>
                    Status: {item.status}
                  </Text>
                )}
                {type === 'SIGHTING' && item.additionalNotes && (
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>
                    📝 {item.additionalNotes}
                  </Text>
                )}
                {type === 'DAMAGE' && item.description && (
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>
                    📝 {item.description}
                  </Text>
                )}

                {/* LOCATION */}
                <Text style={{ color: '#9ca3af', marginTop: 6 }}>
                  📍 {item.village}{item.district ? `, ${item.district}` : ''}
                </Text>

                {/* TIME */}
                <Text style={{ color: '#6b7280', marginTop: 3, fontSize: 12 }}>
                  ⏱ {formatDate(item)}
                </Text>

              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <MaterialIcons
                name={activeTab === 'SIGHTING' ? 'visibility-off' : 'warning'}
                size={48}
                color="#2d4a34"
              />
              <Text style={{ color: '#9ca3af', marginTop: 12, fontSize: 15 }}>
                No {activeTab === 'SIGHTING' ? 'sighting' : 'damage'} reports yet
              </Text>
              <Text style={{ color: '#6b7280', marginTop: 4, fontSize: 12 }}>
                Pull down to refresh
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}