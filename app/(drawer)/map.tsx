// app/(drawer)/map.tsx
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { theme } from "../../constants/theme";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { reportService } from "../../services/reportService";
import { safeTop, spacing, fontSize, fontFamily } from "../../utils/responsive";
import AppHeader from "../../components/AppHeader";

const C = theme.colors;

// ── Geocode village + district using Nominatim ──
const geocodeAddress = async (
  village: string,
  district: string
): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const query = encodeURIComponent(`${village}, ${district}, Sri Lanka`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { "User-Agent": "EleSafe/1.0" } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch {
    return null;
  }
};

const formatBehavior = (b: string) => {
  const map: Record<string, string> = {
    CALM: "Calm", AGGRESSIVE: "⚠️ Aggressive",
    MOVING: "Moving", FEEDING: "Feeding",
  };
  return map[b] || b;
};

const formatDate = (raw: any) => {
  try {
    if (!raw) return "";
    if (Array.isArray(raw)) {
      const [y, mo, d, h = 0, m = 0] = raw;
      return `${d}/${mo}/${y}  ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    return new Date(raw).toLocaleString();
  } catch { return ""; }
};

const isWithin24Hours = (raw: any): boolean => {
  try {
    if (!raw) return false;
    let reportTime: number;
    if (Array.isArray(raw)) {
      const [y, mo, d, h = 0, m = 0, s = 0] = raw;
      reportTime = new Date(y, mo - 1, d, h, m, s).getTime();
    } else {
      reportTime = new Date(raw).getTime();
    }
    return Date.now() - reportTime <= 24 * 60 * 60 * 1000;
  } catch { return false; }
};

const timeAgo = (raw: any): string => {
  try {
    if (!raw) return "";
    let reportTime: number;
    if (Array.isArray(raw)) {
      const [y, mo, d, h = 0, m = 0, s = 0] = raw;
      reportTime = new Date(y, mo - 1, d, h, m, s).getTime();
    } else {
      reportTime = new Date(raw).getTime();
    }
    const diff = Math.floor((Date.now() - reportTime) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  } catch { return ""; }
};

const getBehaviorChip = (behavior: string) => {
  switch (behavior) {
    case "AGGRESSIVE": return { label: "⚠️ Aggressive", bg: '#FDE8E7', text: C.danger };
    case "MOVING":     return { label: "🏃 Moving",     bg: '#FEF3DC', text: C.warning };
    case "FEEDING":    return { label: "🌿 Feeding",    bg: '#E6F4EA', text: C.primary };
    case "CALM":       return { label: "🐘 Calm",       bg: '#EDF5E6', text: C.primaryLight };
    default:           return { label: behavior,        bg: C.bgSubtle, text: C.textMuted };
  }
};

export default function MapScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const mapRef = useRef<MapView | null>(null);

  const [userLocation, setUserLocation] = useState<any>(null);
  const [sightings, setSightings] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedSighting, setSelectedSighting] = useState<any | null>(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
    getUserLocation();
  }, []);

  useFocusEffect(
    useCallback(() => { fetchSightings(); }, [])
  );

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    const loc = await Location.getCurrentPositionAsync({});
    setUserLocation(loc.coords);
  };

  const fetchSightings = async () => {
    try {
      setLoadingReports(true);
      const data = await reportService.getRecentReports();
      const onlySightings = (Array.isArray(data) ? data : []).filter(
        (r: any) => r._class?.includes("SightingReport") || r.numberOfElephants !== undefined
      );
      const last24h = onlySightings.filter((r: any) =>
        isWithin24Hours(r.dateTime || r.submittedAt)
      );
      const withCoords = await Promise.all(
        last24h.map(async (report: any) => {
          if (report.latitude && report.longitude) {
            return { ...report, coords: { latitude: report.latitude, longitude: report.longitude } };
          }
          if (report.village || report.district) {
            const coords = await geocodeAddress(report.village || "", report.district || "");
            return coords ? { ...report, coords } : null;
          }
          return null;
        })
      );
      setSightings(withCoords.filter(Boolean));
    } catch (err) {
      console.log("Fetch sightings error:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  const focusOnSighting = (sighting: any) => {
    setSelectedSighting(sighting);
    mapRef.current?.animateToRegion(
      { latitude: sighting.coords.latitude, longitude: sighting.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      800
    );
  };

  const latestSighting = sightings[0] || null;

  const getMarkerIcon = (behavior: string) => {
    switch (behavior) {
      case "AGGRESSIVE": return { name: "skull",    color: C.danger      };
      case "MOVING":     return { name: "run-fast", color: C.warning     };
      case "FEEDING":    return { name: "food",     color: C.primary     };
      case "CALM":       return { name: "elephant", color: C.primaryLight };
      default:           return { name: "elephant", color: C.textMuted   };
    }
  };

  return (
    <View style={styles.container}>

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        showsUserLocation
        showsMyLocationButton
        initialRegion={{
          latitude: userLocation?.latitude || 7.8731,
          longitude: userLocation?.longitude || 80.7718,
          latitudeDelta: 2.5,
          longitudeDelta: 2.5,
        }}
      >
        {sightings.map((report: any) => (
          <Marker
            key={report.reportId}
            coordinate={{ latitude: report.coords.latitude, longitude: report.coords.longitude }}
            onPress={() => setSelectedSighting(report)}
          >
            <Callout tooltip>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>
                  🐘 {report.numberOfElephants} Elephant{report.numberOfElephants > 1 ? "s" : ""}
                </Text>
                <Text style={styles.calloutSub}>📍 {report.village}, {report.district}</Text>
                <Text style={styles.calloutSub}>Behavior: {formatBehavior(report.behavior)}</Text>
                {report.additionalNotes ? (
                  <Text style={styles.calloutNote}>📝 {report.additionalNotes}</Text>
                ) : null}
                <Text style={styles.calloutTime}>⏱ {formatDate(report.dateTime)}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* ── TOP BAR ── */}
      <View style={styles.topBar}>
        <AppHeader
          title="EleSafe Live Map"
          floating
          rightIcon={loadingReports ? undefined : "refresh"}
          onRightPress={fetchSightings}
        />
        <View style={styles.badge24h}>
          <MaterialIcons name="access-time" size={12} color={C.primary} />
          <Text style={styles.badge24hText}>
            Last 24h · {sightings.length} sighting{sightings.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {/* ── LIVE ALERT BANNER ── */}
      {latestSighting && (
        <Pressable onPress={() => focusOnSighting(latestSighting)} style={styles.warningCardWrap}>
          <Animated.View style={[styles.warningCard, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.warningCardInner}>
              <View style={styles.warningIconWrap}>
                <MaterialCommunityIcons name="elephant" size={18} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.warningTitle} numberOfLines={1}>
                  {latestSighting.village}, {latestSighting.district}
                </Text>
                <Text style={styles.warningText}>
                  {latestSighting.numberOfElephants} elephant{latestSighting.numberOfElephants > 1 ? "s" : ""} · {formatBehavior(latestSighting.behavior)} · {timeAgo(latestSighting.dateTime)}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color="rgba(255,255,255,0.7)" />
            </View>
          </Animated.View>
        </Pressable>
      )}

      {/* ── BOTTOM SHEET ── */}
      <View style={styles.bottomSheet}>
        {/* Handle bar */}
        <View style={styles.handleBar} />

        {/* Selected sighting detail */}
        {selectedSighting ? (
          <View style={styles.detailCard}>
            <View style={styles.detailTopRow}>
              {(() => {
                const chip = getBehaviorChip(selectedSighting.behavior);
                return (
                  <View style={[styles.behaviorChip, { backgroundColor: chip.bg }]}>
                    <Text style={[styles.behaviorChipText, { color: chip.text }]}>{chip.label}</Text>
                  </View>
                );
              })()}
              <Text style={styles.detailTime}>{timeAgo(selectedSighting.dateTime)}</Text>
            </View>
            <Text style={styles.detailElephants}>
              🐘 {selectedSighting.numberOfElephants} Elephant{selectedSighting.numberOfElephants > 1 ? "s" : ""}
            </Text>
            <View style={styles.detailLocationRow}>
              <MaterialIcons name="location-pin" size={14} color={C.textMuted} />
              <Text style={styles.detailLocation}>
                {selectedSighting.village}, {selectedSighting.district}
              </Text>
            </View>
            {selectedSighting.additionalNotes ? (
              <Text style={styles.detailNotes}>{selectedSighting.additionalNotes}</Text>
            ) : null}
            <View style={styles.detailBtnRow}>
              <Pressable
                style={styles.detailBtnPrimary}
                onPress={() => focusOnSighting(selectedSighting)}
              >
                <MaterialIcons name="my-location" size={14} color={C.surface} />
                <Text style={styles.detailBtnPrimaryText}>Focus Map</Text>
              </Pressable>
              <Pressable
                style={styles.detailBtnOutline}
                onPress={() => setSelectedSighting(null)}
              >
                <Text style={styles.detailBtnOutlineText}>Dismiss</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          /* Default list header */
          <View style={styles.bottomHeader}>
            <View>
              <Text style={styles.bottomTitle}>🐘 Last 24h Sightings</Text>
              <Text style={styles.bottomSubtitle}>{sightings.length} report{sightings.length !== 1 ? "s" : ""} found</Text>
            </View>
            <Pressable onPress={fetchSightings} style={styles.refreshBtn}>
              <MaterialIcons name="refresh" size={15} color={C.surface} />
              <Text style={styles.refreshText}>Refresh</Text>
            </Pressable>
          </View>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { behavior: "AGGRESSIVE", label: "Aggressive" },
            { behavior: "MOVING",     label: "Moving"     },
            { behavior: "FEEDING",    label: "Feeding"    },
            { behavior: "CALM",       label: "Calm"       },
          ].map(({ behavior, label }) => {
            const icon = getMarkerIcon(behavior);
            return (
              <View key={behavior} style={styles.legendItem}>
                <MaterialCommunityIcons name={icon.name as any} size={13} color={icon.color} />
                <Text style={[styles.legendText, { color: icon.color }]}>{label}</Text>
              </View>
            );
          })}
        </View>

        {loadingReports ? (
          <ActivityIndicator color={C.primary} style={{ marginVertical: 10 }} />
        ) : sightings.length === 0 ? (
          <Text style={styles.emptyText}>No sightings in the last 24 hours</Text>
        ) : (
          <ScrollView style={{ maxHeight: 140 }} showsVerticalScrollIndicator={false}>
            {sightings.map((report: any) => {
              const icon = getMarkerIcon(report.behavior);
              const isSelected = selectedSighting?.reportId === report.reportId;
              return (
                <Pressable
                  key={report.reportId}
                  onPress={() => focusOnSighting(report)}
                  style={[styles.sightingRow, isSelected && styles.sightingRowSelected]}
                >
                  <View style={[styles.sightingIconWrap, { backgroundColor: icon.color + '22' }]}>
                    <MaterialCommunityIcons name={icon.name as any} size={16} color={icon.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>
                      {report.numberOfElephants} Elephant{report.numberOfElephants > 1 ? "s" : ""} · {formatBehavior(report.behavior)}
                    </Text>
                    <Text style={styles.rowSub}>📍 {report.village}, {report.district}</Text>
                  </View>
                  <Text style={[styles.rowTime, { color: icon.color }]}>
                    {timeAgo(report.dateTime)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  topBar: { position: "absolute", top: safeTop, left: 15, right: 15 },

  badge24h: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: C.surface + 'EE', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    marginTop: 8, alignSelf: "flex-start",
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  badge24hText: { color: C.primary, fontSize: fontSize.xs, fontFamily: fontFamily.semiBold },

  warningCardWrap: {
    position: "absolute", top: safeTop + 88, left: 15, right: 15,
  },
  warningCard: {
    backgroundColor: C.danger,
    borderRadius: 16,
    shadowColor: C.danger, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  warningCardInner: {
    flexDirection: "row", alignItems: "center",
    padding: 12, gap: 10,
  },
  warningIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  warningTitle: { color: C.surface, fontFamily: fontFamily.bold, fontSize: fontSize.sm },
  warningText:  { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.xs, fontFamily: fontFamily.regular, marginTop: 1 },

  callout: {
    backgroundColor: C.surface, borderRadius: 12,
    padding: 12, minWidth: 180, maxWidth: 240,
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  calloutTitle: { color: C.text, fontFamily: fontFamily.bold, fontSize: fontSize.sm, marginBottom: 4 },
  calloutSub:   { color: C.textMuted, fontSize: fontSize.xs, fontFamily: fontFamily.regular, marginTop: 2 },
  calloutNote:  { color: C.textMuted, fontSize: fontSize.xs, fontFamily: fontFamily.regular, marginTop: 4, fontStyle: "italic" },
  calloutTime:  { color: C.textMuted, fontSize: fontSize.xs, fontFamily: fontFamily.regular, marginTop: 6 },

  bottomSheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: C.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: spacing.md, paddingBottom: 80,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  handleBar: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.mist,
    alignSelf: 'center', marginBottom: spacing.sm,
  },

  detailCard: { marginBottom: 8 },
  detailTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  behaviorChip: {
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
  },
  behaviorChipText: { fontSize: fontSize.xs, fontFamily: fontFamily.semiBold },
  detailTime: { color: C.textMuted, fontSize: fontSize.xs, fontFamily: fontFamily.regular },
  detailElephants: { color: C.text, fontFamily: fontFamily.bold, fontSize: fontSize.md, marginBottom: 4 },
  detailLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  detailLocation: { color: C.textMuted, fontSize: fontSize.sm, fontFamily: fontFamily.regular },
  detailNotes: {
    color: C.textMuted, fontSize: fontSize.sm, fontFamily: fontFamily.regular,
    fontStyle: 'italic', marginBottom: 10,
  },
  detailBtnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  detailBtnPrimary: {
    flex: 1, backgroundColor: C.primary, borderRadius: 12,
    paddingVertical: 10, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  detailBtnPrimaryText: { color: C.surface, fontFamily: fontFamily.semiBold, fontSize: fontSize.sm },
  detailBtnOutline: {
    flex: 1, borderWidth: 1.5, borderColor: C.border, borderRadius: 12,
    paddingVertical: 10, alignItems: 'center', justifyContent: 'center',
  },
  detailBtnOutlineText: { color: C.textMuted, fontFamily: fontFamily.semiBold, fontSize: fontSize.sm },

  bottomHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 10,
  },
  bottomTitle:    { color: C.text, fontFamily: fontFamily.bold, fontSize: fontSize.base },
  bottomSubtitle: { color: C.textMuted, fontSize: fontSize.xs, fontFamily: fontFamily.regular, marginTop: 1 },

  refreshBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.primary, paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 20, gap: 4,
  },
  refreshText: { color: C.surface, fontFamily: fontFamily.semiBold, fontSize: fontSize.xs },

  legend:     { flexDirection: "row", gap: 10, marginBottom: 10, flexWrap: "wrap" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendText: { fontSize: fontSize.xs, fontFamily: fontFamily.semiBold },

  emptyText: {
    color: C.textMuted, textAlign: "center",
    marginVertical: 12, fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
  },

  sightingRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 8, gap: 10,
    borderBottomWidth: 1, borderBottomColor: C.bgSubtle,
  },
  sightingRowSelected: {
    backgroundColor: C.bgSubtle, borderRadius: 10,
    paddingHorizontal: 8, borderBottomWidth: 0,
  },
  sightingIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  rowTitle: { color: C.text, fontFamily: fontFamily.semiBold, fontSize: fontSize.xs },
  rowSub:   { color: C.textMuted, fontFamily: fontFamily.regular, fontSize: fontSize.xs, marginTop: 1 },
  rowTime:  { fontSize: fontSize.xs, fontFamily: fontFamily.bold },
});
