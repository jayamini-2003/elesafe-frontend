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
import { WebView } from "react-native-webview";
import { reportService } from "../../services/reportService";
import { safeTop, spacing, fontSize, fontFamily } from "../../utils/responsive";
import AppHeader from "../../components/AppHeader";

const C = theme.colors;

const geocodeAddress = async (
  village: string,
  district: string
): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const query = encodeURIComponent(`${village}, ${district}, Sri Lanka`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { "User-Agent": "EleSafeLanka/1.0" } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
    }
    return null;
  } catch { return null; }
};

const formatBehavior = (b: string) => {
  const map: Record<string, string> = {
    CALM: "Calm", AGGRESSIVE: "Aggressive", MOVING: "Moving", FEEDING: "Feeding",
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
    let t: number;
    if (Array.isArray(raw)) {
      const [y, mo, d, h = 0, m = 0, s = 0] = raw;
      t = new Date(y, mo - 1, d, h, m, s).getTime();
    } else { t = new Date(raw).getTime(); }
    return Date.now() - t <= 24 * 60 * 60 * 1000;
  } catch { return false; }
};

const timeAgo = (raw: any): string => {
  try {
    if (!raw) return "";
    let t: number;
    if (Array.isArray(raw)) {
      const [y, mo, d, h = 0, m = 0, s = 0] = raw;
      t = new Date(y, mo - 1, d, h, m, s).getTime();
    } else { t = new Date(raw).getTime(); }
    const diff = Math.floor((Date.now() - t) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  } catch { return ""; }
};

const getBehaviorChip = (behavior: string) => {
  switch (behavior) {
    case "AGGRESSIVE": return { label: "Aggressive", bg: '#FDE8E7', text: C.danger };
    case "MOVING":     return { label: "Moving",     bg: '#FEF3DC', text: C.warning };
    case "FEEDING":    return { label: "Feeding",    bg: '#E6F4EA', text: C.primary };
    case "CALM":       return { label: "Calm",       bg: '#EDF5E6', text: C.primaryLight };
    default:           return { label: behavior,     bg: C.bgSubtle, text: C.textMuted };
  }
};

const buildLeafletHTML = (userLat: number, userLng: number, sightings: any[]) => {
  const colors: Record<string, string> = {
    AGGRESSIVE: "#E63946", MOVING: "#F4A261", FEEDING: "#2D6A4F", CALM: "#52B788",
  };

  const markersJS = sightings.map((s) => {
    const color = colors[s.behavior] || "#6C757D";
    const label = formatBehavior(s.behavior);
    const n = s.numberOfElephants;
    const loc = `${(s.village || "").replace(/'/g, "")} ${(s.district || "").replace(/'/g, "")}`;
    return `L.circleMarker([${s.coords.latitude},${s.coords.longitude}],{radius:10,color:'#fff',fillColor:'${color}',fillOpacity:0.9,weight:2}).addTo(map).bindPopup('<b>${n} elephant${n > 1 ? "s" : ""}</b><br/>${label}<br/>${loc}');`;
  }).join("\n");

  const boundsJS = sightings.length > 0
    ? `map.fitBounds([[${userLat},${userLng}],${sightings.map(s => `[${s.coords.latitude},${s.coords.longitude}]`).join(",")}],{padding:[40,40]});`
    : "";

  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><style>*{margin:0;padding:0}html,body,#map{width:100%;height:100%}.leaflet-control-attribution{font-size:8px!important}</style></head><body><div id="map"></div><script>var map=L.map('map',{zoomControl:true}).setView([${userLat},${userLng}],13);L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Esri'}).addTo(map);L.circleMarker([${userLat},${userLng}],{radius:9,color:'#fff',fillColor:'#2D6A4F',fillOpacity:1,weight:3}).addTo(map).bindPopup('Your Location');${markersJS}${boundsJS}</script></body></html>`;
};

export default function MapScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [sightings, setSightings] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedSighting, setSelectedSighting] = useState<any | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ])).start();
    getUserLocation();
  }, []);

  useFocusEffect(useCallback(() => { fetchSightings(); }, []));

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") { setUserLocation({ latitude: 7.8731, longitude: 80.7718 }); return; }
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc.coords);
    } catch { setUserLocation({ latitude: 7.8731, longitude: 80.7718 }); }
  };

  const fetchSightings = async () => {
    try {
      setLoadingReports(true);
      const data = await reportService.getRecentReports();
      const only = (Array.isArray(data) ? data : []).filter(
        (r: any) => r._class?.includes("SightingReport") || r.numberOfElephants !== undefined
      );
      const last24h = only.filter((r: any) => isWithin24Hours(r.dateTime || r.submittedAt));
      const withCoords = await Promise.all(last24h.map(async (report: any) => {
        if (report.latitude && report.longitude) return { ...report, coords: { latitude: report.latitude, longitude: report.longitude } };
        if (report.village || report.district) {
          const coords = await geocodeAddress(report.village || "", report.district || "");
          return coords ? { ...report, coords } : null;
        }
        return null;
      }));
      setSightings(withCoords.filter(Boolean));
    } catch (err) { console.log("Fetch error:", err); }
    finally { setLoadingReports(false); }
  };

  const latestSighting = sightings[0] || null;
  const getMarkerIcon = (behavior: string) => {
    switch (behavior) {
      case "AGGRESSIVE": return { name: "skull",    color: C.danger };
      case "MOVING":     return { name: "run-fast", color: C.warning };
      case "FEEDING":    return { name: "food",     color: C.primary };
      case "CALM":       return { name: "elephant", color: C.primaryLight };
      default:           return { name: "elephant", color: C.textMuted };
    }
  };

  const mapLat = userLocation?.latitude || 7.8731;
  const mapLng = userLocation?.longitude || 80.7718;

  return (
    <View style={styles.container}>
      {/* WebView Leaflet Map */}
      <WebView
        style={StyleSheet.absoluteFillObject}
        source={{ html: buildLeafletHTML(mapLat, mapLng, sightings) }}
        onLoadEnd={() => setMapReady(true)}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        mixedContentMode="always"
      />

      {!mapReady && (
        <View style={[StyleSheet.absoluteFillObject, styles.mapLoading]}>
          <ActivityIndicator color={C.primary} size="large" />
          <Text style={styles.mapLoadingText}>Loading map…</Text>
        </View>
      )}

      {/* TOP BAR */}
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

      {/* LIVE ALERT BANNER */}
      {latestSighting && (
        <Pressable onPress={() => setSelectedSighting(latestSighting)} style={styles.warningCardWrap}>
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

      {/* BOTTOM SHEET */}
      <View style={styles.bottomSheet}>
        <View style={styles.handleBar} />

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
              <Text style={styles.detailLocation}>{selectedSighting.village}, {selectedSighting.district}</Text>
            </View>
            {selectedSighting.additionalNotes ? (
              <Text style={styles.detailNotes}>{selectedSighting.additionalNotes}</Text>
            ) : null}
            <View style={styles.detailBtnRow}>
              <Pressable style={styles.detailBtnPrimary} onPress={() => setSelectedSighting(selectedSighting)}>
                <MaterialIcons name="my-location" size={14} color={C.surface} />
                <Text style={styles.detailBtnPrimaryText}>Focus Map</Text>
              </Pressable>
              <Pressable style={styles.detailBtnOutline} onPress={() => setSelectedSighting(null)}>
                <Text style={styles.detailBtnOutlineText}>Dismiss</Text>
              </Pressable>
            </View>
          </View>
        ) : (
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
                  onPress={() => setSelectedSighting(report)}
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
                  <Text style={[styles.rowTime, { color: icon.color }]}>{timeAgo(report.dateTime)}</Text>
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
  mapLoading: { backgroundColor: '#F0F7F4', justifyContent: 'center', alignItems: 'center', gap: 12 },
  mapLoadingText: { color: '#2D6A4F', fontSize: fontSize.sm, fontFamily: fontFamily.regular },
  topBar: { position: "absolute", top: safeTop, left: 15, right: 15 },
  badge24h: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: C.surface + 'EE', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, marginTop: 8, alignSelf: "flex-start",
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  badge24hText: { color: C.primary, fontSize: fontSize.xs, fontFamily: fontFamily.semiBold },
  warningCardWrap: { position: "absolute", top: safeTop + 88, left: 15, right: 15 },
  warningCard: {
    backgroundColor: C.danger, borderRadius: 16,
    shadowColor: C.danger, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  warningCardInner: { flexDirection: "row", alignItems: "center", padding: 12, gap: 10 },
  warningIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  warningTitle: { color: C.surface, fontFamily: fontFamily.bold, fontSize: fontSize.sm },
  warningText: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.xs, fontFamily: fontFamily.regular, marginTop: 1 },
  bottomSheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: C.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: spacing.md, paddingBottom: 80,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: -4 }, elevation: 12,
  },
  handleBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.mist, alignSelf: 'center', marginBottom: spacing.sm },
  detailCard: { marginBottom: 8 },
  detailTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  behaviorChip: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  behaviorChipText: { fontSize: fontSize.xs, fontFamily: fontFamily.semiBold },
  detailTime: { color: C.textMuted, fontSize: fontSize.xs, fontFamily: fontFamily.regular },
  detailElephants: { color: C.text, fontFamily: fontFamily.bold, fontSize: fontSize.md, marginBottom: 4 },
  detailLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  detailLocation: { color: C.textMuted, fontSize: fontSize.sm, fontFamily: fontFamily.regular },
  detailNotes: { color: C.textMuted, fontSize: fontSize.sm, fontFamily: fontFamily.regular, fontStyle: 'italic', marginBottom: 10 },
  detailBtnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  detailBtnPrimary: { flex: 1, backgroundColor: C.primary, borderRadius: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  detailBtnPrimaryText: { color: C.surface, fontFamily: fontFamily.semiBold, fontSize: fontSize.sm },
  detailBtnOutline: { flex: 1, borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  detailBtnOutlineText: { color: C.textMuted, fontFamily: fontFamily.semiBold, fontSize: fontSize.sm },
  bottomHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  bottomTitle: { color: C.text, fontFamily: fontFamily.bold, fontSize: fontSize.base },
  bottomSubtitle: { color: C.textMuted, fontSize: fontSize.xs, fontFamily: fontFamily.regular, marginTop: 1 },
  refreshBtn: { flexDirection: "row", alignItems: "center", backgroundColor: C.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4 },
  refreshText: { color: C.surface, fontFamily: fontFamily.semiBold, fontSize: fontSize.xs },
  legend: { flexDirection: "row", gap: 10, marginBottom: 10, flexWrap: "wrap" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendText: { fontSize: fontSize.xs, fontFamily: fontFamily.semiBold },
  emptyText: { color: C.textMuted, textAlign: "center", marginVertical: 12, fontSize: fontSize.sm, fontFamily: fontFamily.regular },
  sightingRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 10, borderBottomWidth: 1, borderBottomColor: C.bgSubtle },
  sightingRowSelected: { backgroundColor: C.bgSubtle, borderRadius: 10, paddingHorizontal: 8, borderBottomWidth: 0 },
  sightingIconWrap: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rowTitle: { color: C.text, fontFamily: fontFamily.semiBold, fontSize: fontSize.xs },
  rowSub: { color: C.textMuted, fontFamily: fontFamily.regular, fontSize: fontSize.xs, marginTop: 1 },
  rowTime: { fontSize: fontSize.xs, fontFamily: fontFamily.bold },
});
