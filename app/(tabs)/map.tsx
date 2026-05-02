// app/(tabs)/map.tsx
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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

// ✅ Check if report is within last 24 hours
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
    const now = Date.now();
    const diff = now - reportTime;
    return diff <= 24 * 60 * 60 * 1000; // 24 hours in ms
  } catch { return false; }
};

// ✅ How long ago label
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
    const diff = Math.floor((Date.now() - reportTime) / 60000); // minutes
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    const hrs = Math.floor(diff / 60);
    return `${hrs}h ago`;
  } catch { return ""; }
};

export default function MapScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const mapRef = useRef<MapView | null>(null);

  const [userLocation, setUserLocation] = useState<any>(null);
  const [sightings, setSightings] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedSighting, setSelectedSighting] = useState<any | null>(null);

  // ── Pulse animation ──
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
    getUserLocation();
  }, []);

  // ── Reload on tab focus ──
  useFocusEffect(
    useCallback(() => {
      fetchSightings();
    }, [])
  );

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    const loc = await Location.getCurrentPositionAsync({});
    setUserLocation(loc.coords);
  };

  // ── Fetch sightings — only last 24 hours ──
  const fetchSightings = async () => {
    try {
      setLoadingReports(true);
      const data = await reportService.getRecentReports();

      const onlySightings = (Array.isArray(data) ? data : []).filter(
        (r: any) =>
          r._class?.includes("SightingReport") ||
          r.numberOfElephants !== undefined
      );

      // ✅ Filter to last 24 hours only
      const last24h = onlySightings.filter((r: any) =>
        isWithin24Hours(r.dateTime || r.submittedAt)
      );

      // Geocode each — use real GPS coords if available, else geocode
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
      {
        latitude: sighting.coords.latitude,
        longitude: sighting.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      800
    );
  };

  const latestSighting = sightings[0] || null;

  // ✅ Marker icon based on behavior
  const getMarkerIcon = (behavior: string) => {
    switch (behavior) {
      case "AGGRESSIVE": return { name: "skull", color: "#ef4444" };      // dangerous
      case "MOVING":     return { name: "run-fast", color: "#f59e0b" };   // on the move
      case "FEEDING":    return { name: "food", color: "#13ec37" };       // calm feeding
      case "CALM":       return { name: "elephant", color: "#60a5fa" };   // calm
      default:           return { name: "elephant", color: "#9ca3af" };
    }
  };

  return (
    <View style={styles.container}>

      {/* ── FULL SCREEN MAP ── */}
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
    coordinate={{
      latitude: report.coords.latitude,
      longitude: report.coords.longitude,
    }}
    onPress={() => setSelectedSighting(report)}
  >
    {/* ✅ Simple red dot */}

      
    <Callout tooltip>
      <View style={styles.callout}>
        <Text style={styles.calloutTitle}>
          🐘 {report.numberOfElephants} Elephant{report.numberOfElephants > 1 ? "s" : ""}
        </Text>
        <Text style={styles.calloutSub}>
          📍 {report.village}, {report.district}
        </Text>
        <Text style={styles.calloutSub}>
          Behavior: {formatBehavior(report.behavior)}
        </Text>
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
        <View style={styles.searchBox}>
          <MaterialIcons name="map" size={22} color="#13ec37" />
          <Text style={styles.searchLabel}>
            EleSafe Live Map
          </Text>
          {loadingReports ? (
            <ActivityIndicator size="small" color="#13ec37" />
          ) : (
            <Pressable onPress={fetchSightings}>
              <MaterialIcons name="refresh" size={22} color="white" />
            </Pressable>
          )}
        </View>

        {/* ✅ 24h badge */}
        <View style={styles.badge24h}>
          <MaterialIcons name="access-time" size={12} color="#13ec37" />
          <Text style={styles.badge24hText}>
            Showing last 24h • {sightings.length} sighting{sightings.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {/* ── LIVE ALERT BANNER ── */}
      {latestSighting && (
        <Pressable onPress={() => focusOnSighting(latestSighting)}>
          <Animated.View
            style={[styles.warningCard, { transform: [{ scale: pulseAnim }] }]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <MaterialCommunityIcons name="elephant" size={20} color="white" />
              <Text style={styles.warningTitle}>
                SIGHTING — {latestSighting.village}, {latestSighting.district}
              </Text>
            </View>
            <Text style={styles.warningText}>
              {latestSighting.numberOfElephants} elephant{latestSighting.numberOfElephants > 1 ? "s" : ""} •{" "}
              {formatBehavior(latestSighting.behavior)} •{" "}
              {timeAgo(latestSighting.dateTime)} • Tap to view
            </Text>
          </Animated.View>
        </Pressable>
      )}

      {/* ── BOTTOM SHEET ── */}
      <View style={styles.bottomSheet}>
        <View style={styles.bottomHeader}>
          <Text style={styles.bottomTitle}>
            🐘 Last 24h Sightings ({sightings.length})
          </Text>
          <Pressable onPress={fetchSightings} style={styles.refreshBtn}>
            <MaterialIcons name="refresh" size={16} color="black" />
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>

        {/* Behavior legend */}
        <View style={styles.legend}>
          {[
            { behavior: "AGGRESSIVE", label: "Aggressive" },
            { behavior: "MOVING",     label: "Moving" },
            { behavior: "FEEDING",    label: "Feeding" },
            { behavior: "CALM",       label: "Calm" },
          ].map(({ behavior, label }) => {
            const icon = getMarkerIcon(behavior);
            return (
              <View key={behavior} style={styles.legendItem}>
                <MaterialCommunityIcons name={icon.name as any} size={14} color={icon.color} />
                <Text style={[styles.legendText, { color: icon.color }]}>{label}</Text>
              </View>
            );
          })}
        </View>

        {loadingReports ? (
          <ActivityIndicator color="#13ec37" style={{ marginTop: 8 }} />
        ) : sightings.length === 0 ? (
          <Text style={styles.emptyText}>
            No sightings in the last 24 hours
          </Text>
        ) : (
          <ScrollView style={{ maxHeight: 130 }} showsVerticalScrollIndicator={false}>
            {sightings.map((report: any) => {
              const icon = getMarkerIcon(report.behavior);
              const isSelected = selectedSighting?.reportId === report.reportId;
              return (
                <Pressable
                  key={report.reportId}
                  onPress={() => focusOnSighting(report)}
                  style={[styles.sightingRow, isSelected && styles.sightingRowSelected]}
                >
                  {/* ✅ Behavior icon instead of red dot */}
                  <MaterialCommunityIcons
                    name={icon.name as any}
                    size={18}
                    color={icon.color}
                  />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>
                      {report.numberOfElephants} Elephant{report.numberOfElephants > 1 ? "s" : ""} — {formatBehavior(report.behavior)}
                    </Text>
                    <Text style={styles.rowSub}>
                      📍 {report.village}, {report.district}
                    </Text>
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

  // ── Top bar ──
  topBar: { position: "absolute", top: 50, left: 15, right: 15 },

  searchBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1c3020ee", borderRadius: 12,
    padding: 12, gap: 10,
  },

  searchLabel: { flex: 1, color: "white", fontWeight: "bold", fontSize: 15 },

  badge24h: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#0d2211dd", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    marginTop: 6, alignSelf: "flex-start",
    borderWidth: 1, borderColor: "#13ec3744",
  },

  badge24hText: { color: "#13ec37", fontSize: 11 },

  // ── Warning banner ──
  warningCard: {
    position: "absolute", top: 138, left: 15, right: 15,
    backgroundColor: "#dc2626", padding: 12, borderRadius: 12,
    borderLeftWidth: 4, borderLeftColor: "#fca5a5",
  },

  warningTitle: { color: "white", fontWeight: "bold", fontSize: 13 },
  warningText: { color: "#fecaca", marginTop: 4, fontSize: 12 },

  // ✅ Marker bubble
  markerBubble: {
    backgroundColor: "#1c3020",
    borderRadius: 12, borderWidth: 2,
    paddingHorizontal: 6, paddingVertical: 4,
    alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.3,
    shadowRadius: 4, elevation: 5,
  },

  markerTime: { fontSize: 9, fontWeight: "bold", marginTop: 1 },

  // ── Callout ──
  callout: {
    backgroundColor: "#1c3020", borderRadius: 10,
    padding: 12, minWidth: 180, maxWidth: 240,
    borderWidth: 1, borderColor: "#13ec37",
  },

  calloutTitle: { color: "white", fontWeight: "bold", fontSize: 14, marginBottom: 4 },
  calloutSub: { color: "#9ca3af", fontSize: 12, marginTop: 2 },
  calloutNote: { color: "#9ca3af", fontSize: 12, marginTop: 4, fontStyle: "italic" },
  calloutTime: { color: "#6b7280", fontSize: 11, marginTop: 6 },

  // ── Bottom sheet ──
  bottomSheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#1c3020", padding: 16,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },

  bottomHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 8,
  },

  bottomTitle: { color: "white", fontWeight: "bold", fontSize: 15 },

  refreshBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#13ec37", paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 8, gap: 4,
  },

  refreshText: { color: "black", fontWeight: "bold", fontSize: 12 },

  // ✅ Legend
  legend: {
    flexDirection: "row", gap: 12, marginBottom: 8,
    flexWrap: "wrap",
  },

  legendItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  legendText: { fontSize: 10, fontWeight: "600" },

  emptyText: {
    color: "#4a6650", textAlign: "center",
    marginTop: 10, marginBottom: 8, fontSize: 13,
  },

  // ── Sighting list rows ──
  sightingRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 8, borderBottomWidth: 1,
    borderBottomColor: "#0d2211", gap: 10,
  },

  sightingRowSelected: {
    backgroundColor: "#0d2211", borderRadius: 8, paddingHorizontal: 6,
  },

  rowTitle: { color: "white", fontWeight: "bold", fontSize: 12 },
  rowSub: { color: "#9ca3af", fontSize: 11, marginTop: 1 },
  rowTime: { fontSize: 11, fontWeight: "bold" },
});