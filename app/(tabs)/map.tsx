// app/(tabs)/map.tsx
import { MaterialIcons } from "@expo/vector-icons";
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

// ─── Geocode a "village, district" string using Nominatim (free, no API key) ───
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

// ─── Format behavior nicely ───
const formatBehavior = (b: string) => {
  const map: Record<string, string> = {
    CALM: "Calm",
    AGGRESSIVE: "⚠️ Aggressive",
    MOVING: "Moving",
    FEEDING: "Feeding",
  };
  return map[b] || b;
};

// ─── Format date array from Spring ───
const formatDate = (raw: any) => {
  try {
    if (!raw) return "";
    if (Array.isArray(raw)) {
      const [y, mo, d, h, m] = raw;
      return `${d}/${mo}/${y}  ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    return new Date(raw).toLocaleString();
  } catch {
    return "";
  }
};

export default function MapScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const mapRef = useRef<MapView | null>(null);

  const [userLocation, setUserLocation] = useState<any>(null);
  const [sightings, setSightings] = useState<any[]>([]); // reports with coords
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedSighting, setSelectedSighting] = useState<any | null>(null);

  // ─── Pulse animation ───
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    getUserLocation();
  }, []);

  // ─── Reload sightings every time the map tab is opened ───
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

  // ─── Fetch sighting reports and geocode each one ───
  // ─── Fetch sighting reports — use real coords OR geocode as fallback ───
const fetchSightings = async () => {
  try {
    setLoadingReports(true);
    const data = await reportService.getRecentReports();

    const onlySightings = (Array.isArray(data) ? data : []).filter(
      (r: any) =>
        r._class?.includes("SightingReport") ||
        r.numberOfElephants !== undefined
    );

    const withCoords = await Promise.all(
      onlySightings.map(async (report: any) => {

        // ✅ CASE 1: Report has real GPS coords saved — use directly, no geocoding
        if (report.latitude && report.longitude) {
          return {
            ...report,
            coords: {
              latitude: report.latitude,
              longitude: report.longitude,
            },
            coordSource: "gps", // for debugging
          };
        }

        // ✅ CASE 2: No GPS coords — fall back to geocoding village + district
        if (report.village || report.district) {
          const coords = await geocodeAddress(
            report.village || "",
            report.district || ""
          );
          return coords ? { ...report, coords, coordSource: "geocode" } : null;
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
        {/* 🔴 Red markers for each sighting report */}
        {sightings.map((report: any) => (
          <Marker
            key={report.reportId}
            coordinate={{
              latitude: report.coords.latitude,
              longitude: report.coords.longitude,
            }}
            onPress={() => setSelectedSighting(report)}
          >
            {/* Red pulsing dot */}
            <View style={styles.markerOuter}>
              <View style={styles.markerInner} />
            </View>

            {/* Callout popup on tap */}
            <Callout tooltip>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>
                  🐘 {report.numberOfElephants} Elephant
                  {report.numberOfElephants > 1 ? "s" : ""}
                </Text>
                <Text style={styles.calloutSub}>
                  📍 {report.village}, {report.district}
                </Text>
                <Text style={styles.calloutSub}>
                  Behavior: {formatBehavior(report.behavior)}
                </Text>
                {report.additionalNotes ? (
                  <Text style={styles.calloutNote}>
                    📝 {report.additionalNotes}
                  </Text>
                ) : null}
                <Text style={styles.calloutTime}>
                  ⏱ {formatDate(report.dateTime)}
                </Text>
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
      </View>

      {/* ── LIVE ALERT BANNER (latest sighting) ── */}
      {latestSighting && (
        <Pressable onPress={() => focusOnSighting(latestSighting)}>
          <Animated.View
            style={[
              styles.warningCard,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Text style={styles.warningTitle}>
              🚨 SIGHTING — {latestSighting.village}, {latestSighting.district}
            </Text>
            <Text style={styles.warningText}>
              {latestSighting.numberOfElephants} elephant
              {latestSighting.numberOfElephants > 1 ? "s" : ""} spotted •{" "}
              {formatBehavior(latestSighting.behavior)} • Tap to view
            </Text>
          </Animated.View>
        </Pressable>
      )}

      {/* ── BOTTOM SHEET — list of sightings ── */}
      <View style={styles.bottomSheet}>
        <View style={styles.bottomHeader}>
          <Text style={styles.bottomTitle}>
            🐘 Sighting Reports ({sightings.length})
          </Text>
          <Pressable onPress={fetchSightings} style={styles.refreshBtn}>
            <MaterialIcons name="refresh" size={16} color="black" />
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>

        {loadingReports ? (
          <ActivityIndicator
            color="#13ec37"
            style={{ marginTop: 12, marginBottom: 8 }}
          />
        ) : sightings.length === 0 ? (
          <Text style={styles.emptyText}>
            No sighting reports yet. Submit one to see it here!
          </Text>
        ) : (
          <ScrollView
            style={{ maxHeight: 160 }}
            showsVerticalScrollIndicator={false}
          >
            {sightings.map((report: any) => {
              const isSelected =
                selectedSighting?.reportId === report.reportId;
              return (
                <Pressable
                  key={report.reportId}
                  onPress={() => focusOnSighting(report)}
                  style={[
                    styles.sightingRow,
                    isSelected && styles.sightingRowSelected,
                  ]}
                >
                  {/* Red dot */}
                  <View style={styles.rowDot} />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>
                      🐘 {report.numberOfElephants} Elephant
                      {report.numberOfElephants > 1 ? "s" : ""} —{" "}
                      {formatBehavior(report.behavior)}
                    </Text>
                    <Text style={styles.rowSub}>
                      📍 {report.village}, {report.district}
                    </Text>
                    <Text style={styles.rowTime}>
                      ⏱ {formatDate(report.dateTime)}
                    </Text>
                  </View>

                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    color={isSelected ? "#13ec37" : "#4a6650"}
                  />
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
  topBar: {
    position: "absolute",
    top: 50,
    left: 15,
    right: 15,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c3020ee",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },

  searchLabel: {
    flex: 1,
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },

  // ── Warning banner ──
  warningCard: {
    position: "absolute",
    top: 118,
    left: 15,
    right: 15,
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 12,
  },

  warningTitle: {
    color: "white",
    fontWeight: "bold",
  },

  warningText: {
    color: "white",
    marginTop: 4,
    fontSize: 12,
  },

  // ── Red marker ──
  markerOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ef444440",
    justifyContent: "center",
    alignItems: "center",
  },

  markerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ef4444",
    borderWidth: 2,
    borderColor: "white",
  },

  // ── Callout ──
  callout: {
    backgroundColor: "#1c3020",
    borderRadius: 10,
    padding: 12,
    minWidth: 180,
    maxWidth: 240,
    borderWidth: 1,
    borderColor: "#ef4444",
  },

  calloutTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },

  calloutSub: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },

  calloutNote: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },

  calloutTime: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 6,
  },

  // ── Bottom sheet ──
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1c3020",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  bottomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  bottomTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },

  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#13ec37",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },

  refreshText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 12,
  },

  emptyText: {
    color: "#4a6650",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
    fontSize: 13,
  },

  // ── Sighting list rows ──
  sightingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#0d2211",
    gap: 10,
  },

  sightingRowSelected: {
    backgroundColor: "#0d2211",
    borderRadius: 8,
    paddingHorizontal: 6,
  },

  rowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444",
  },

  rowTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },

  rowSub: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },

  rowTime: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 1,
  },
});