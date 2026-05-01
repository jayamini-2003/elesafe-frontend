import {
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function Home() {
  const user = {
    name: "Jayamini",
    location: "Pettah, Colombo",
    avatar: "https://i.pravatar.cc/100",
  };

  const [region, setRegion] = useState<any>(null);

  // Dummy alerts (replace later with Firebase)
  const [alerts] = useState([
    {
      id: "1",
      latitude: 6.9285,
      longitude: 79.862,
      title: "Elephant",
    },
    {
      id: "2",
      latitude: 6.9265,
      longitude: 79.8605,
      title: "Fence Damage",
    },
    {
      id: "3",
      latitude: 6.931,
      longitude: 79.864,
      title: "Elephant Movement",
    },
  ]);

  // 📍 Get user location
  useEffect(() => {
    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});

      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  // 📏 Distance function (km)
  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.appHeader}>
        <Text style={styles.appName}>EleSafe Lanka</Text>
        <MaterialIcons
          name="notifications-none"
          size={24}
          color="white"
        />
      </View>

      {/* PROFILE */}
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />

        <View style={{ marginLeft: 12 }}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.location}>{user.location}</Text>

          <Text style={styles.greeting}>Good Evening 👋</Text>

          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              Current Status: Safe
            </Text>
            <Text style={styles.timeText}>
              Updated 2 min ago
            </Text>
          </View>
        </View>
      </View>

      {/* REPORT */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Report Incident</Text>
          <MaterialIcons name="warning" size={22} color="#ff4d4d" />
        </View>

        <Text style={styles.description}>
          Spotted an elephant? Report it immediately.
        </Text>

        <Pressable
          style={styles.reportBtn}
          onPress={() => router.push("/(tabs)/report")}
        >
          <MaterialIcons name="camera-alt" size={20} color="black" />
          <Text style={styles.reportBtnText}>
            REPORT SIGHTING
          </Text>
        </Pressable>
      </View>

      {/* 🗺 LIVE MAP */}
      <Pressable
        style={styles.mapCard}
        onPress={() => router.push("/(tabs)/map")}
      >
        {region && (
          <MapView
            style={{ flex: 1 }}
            region={{
              latitude: region.latitude,
              longitude: region.longitude,
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            {/* 🟢 USER */}
            <Marker
              coordinate={{
                latitude: region.latitude,
                longitude: region.longitude,
              }}
            >
              <View style={styles.userDot} />
            </Marker>

            {/* 🔴 ALERTS (2km radius filter) */}
            {alerts
              .filter(
                (a) =>
                  getDistance(
                    region.latitude,
                    region.longitude,
                    a.latitude,
                    a.longitude
                  ) < 2
              )
              .map((alert) => (
                <Marker
                  key={alert.id}
                  coordinate={{
                    latitude: alert.latitude,
                    longitude: alert.longitude,
                  }}
                >
                  <View style={styles.alertDot} />
                </Marker>
              ))}
          </MapView>
        )}

        {/* MAP TITLE */}
        <View style={styles.mapOverlay}>
          <Text style={styles.mapLabel}>Live Map View</Text>
        </View>

        {/* ↗ EXPAND BUTTON (BOTTOM RIGHT) */}
        <Pressable
          style={styles.expandBtn}
          onPress={() => router.push("/(tabs)/map")}
        >
          <Text style={styles.expandText}>Expand ↗</Text>
        </Pressable>
      </Pressable>

      {/* ALERTS */}
      <View style={{ marginTop: 20 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>

        <View style={styles.alertCard}>
          <MaterialCommunityIcons
            name="paw"
            size={22}
            color="orange"
          />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.alertText}>
              Elephant Spotted
            </Text>
            <Text style={styles.alertSub}>10m ago</Text>
          </View>
          <Text style={styles.badge}>1.2 km</Text>
        </View>
      </View>

      {/* SAFETY */}
      <View style={{ marginTop: 20 }}>
        <Text style={styles.sectionTitle}>
          Safety & Community
        </Text>

        <Pressable
          style={styles.smallCard}
          onPress={() => router.push("/(tabs)/safety")}
        >
          <MaterialIcons
            name="wb-sunny"
            size={22}
            color="#13ec37"
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.smallTitle}>
              Night Safety
            </Text>
            <Text style={styles.smallText}>
              Stay indoors and avoid forest edges.
            </Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#102213",
    padding: 16,
  },

  appHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  appName: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
  },

  name: { color: "white", fontSize: 18, fontWeight: "bold" },
  location: { color: "#9ca3af", fontSize: 13 },
  greeting: { color: "white", marginTop: 5 },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#13ec37",
    marginRight: 6,
  },

  statusText: { color: "#13ec37", fontSize: 12 },
  timeText: { color: "#9ca3af", fontSize: 11, marginLeft: 10 },

  card: {
    marginTop: 20,
    backgroundColor: "#1c3020",
    padding: 15,
    borderRadius: 14,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cardTitle: { color: "white", fontWeight: "bold" },
  description: { color: "#9ca3af", marginTop: 8 },

  reportBtn: {
    marginTop: 12,
    backgroundColor: "#13ec37",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  reportBtnText: { color: "black", fontWeight: "bold" },

  mapCard: {
    marginTop: 20,
    height: 180,
    borderRadius: 14,
    overflow: "hidden",
  },

  mapOverlay: {
    position: "absolute",
    top: 10,
    left: 10,
  },

  mapLabel: { color: "white", fontWeight: "bold" },

  expandBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#1c3020",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#13ec37",
  },

  expandText: {
    color: "#13ec37",
    fontSize: 12,
  },

  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#13ec37",
    borderWidth: 2,
    borderColor: "white",
  },

  alertDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ef4444",
    borderWidth: 2,
    borderColor: "white",
  },

  sectionTitle: { color: "white", fontWeight: "bold" },
  viewAll: { color: "#13ec37" },

  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c3020",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },

  alertText: { color: "white" },
  alertSub: { color: "#9ca3af", fontSize: 12 },

  badge: {
    color: "white",
    backgroundColor: "#ef4444",
    padding: 6,
    borderRadius: 8,
  },

  smallCard: {
    flexDirection: "row",
    backgroundColor: "#1c3020",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },

  smallTitle: { color: "white" },
  smallText: { color: "#9ca3af", fontSize: 12 },
});