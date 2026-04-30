import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Home() {
  const user = {
    name: "Jayamini",
    location: "Pettah, Colombo",
    avatar: "https://i.pravatar.cc/100",
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* APP HEADER */}
      <View style={styles.appHeader}>
        <Text style={styles.appName}>EleSafe Lanka</Text>
        <MaterialIcons name="notifications-none" size={24} color="white" />
      </View>

      {/* PROFILE SECTION */}
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />

        <View style={{ marginLeft: 12 }}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.location}>{user.location}</Text>

          <Text style={styles.greeting}>Good Evening 👋</Text>

          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Current Status: Safe</Text>
            <Text style={styles.timeText}>Updated 2 min ago</Text>
          </View>
        </View>
      </View>

      {/* REPORT SECTION */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Report Incident</Text>
          <MaterialIcons name="warning" size={22} color="#ff4d4d" />
        </View>

        <Text style={styles.description}>
          Spotted an elephant? Report it immediately to alert nearby villagers.
        </Text>

        <Pressable
          style={styles.reportBtn}
          onPress={() => router.push("/(tabs)/report")}
        >
          <MaterialIcons name="camera-alt" size={20} color="black" />
          <Text style={styles.reportBtnText}>REPORT SIGHTING</Text>
        </Pressable>
      </View>

      {/* LIVE MAP */}
      <Pressable
        style={styles.mapCard}
        onPress={() => router.push("/(tabs)/map")}
      >
        <Text style={styles.mapLabel}>Live Map View</Text>
        <Text style={styles.expand}>Expand ↗</Text>
      </Pressable>

      {/* RECENT ALERTS */}
      <View style={{ marginTop: 20 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>

        <View style={styles.alertCard}>
          <MaterialCommunityIcons name="paw" size={22} color="orange" />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.alertText}>Elephant Spotted</Text>
            <Text style={styles.alertSub}>10m ago</Text>
          </View>
          <Text style={styles.badge}>1.2 km</Text>
        </View>

        <View style={styles.alertCard}>
          <MaterialCommunityIcons name="fence" size={22} color="orange" />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.alertText}>Fence Damaged</Text>
            <Text style={styles.alertSub}>45m ago</Text>
          </View>
          <Text style={styles.badge}>3.5 km</Text>
        </View>
      </View>

      {/* SAFETY */}
      <View style={{ marginTop: 20 }}>
        <Text style={styles.sectionTitle}>Safety & Community</Text>

        {/* ✅ UPDATED: NOW NAVIGATES */}
        <Pressable
          style={styles.smallCard}
          onPress={() => router.push("/(tabs)/safety")}
        >
          <MaterialIcons name="wb-sunny" size={22} color="#13ec37" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.smallTitle}>Night Safety</Text>
            <Text style={styles.smallText}>
              Stay indoors and avoid forest edges at night.
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
    alignItems: "center",
    marginTop: 10,
    marginBottom: 0,
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

  name: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  location: {
    color: "#9ca3af",
    fontSize: 13,
  },

  greeting: {
    color: "white",
    marginTop: 5,
    fontSize: 14,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#13ec37",
    marginRight: 6,
  },

  statusText: {
    color: "#13ec37",
    fontSize: 12,
    fontWeight: "600",
  },

  timeText: {
    color: "#9ca3af",
    fontSize: 11,
    marginLeft: 10,
  },

  card: {
    marginTop: 20,
    backgroundColor: "#1c3020",
    padding: 15,
    borderRadius: 14,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  description: {
    color: "#9ca3af",
    marginTop: 8,
    fontSize: 13,
  },

  reportBtn: {
    marginTop: 12,
    backgroundColor: "#13ec37",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  reportBtnText: {
    color: "black",
    fontWeight: "bold",
  },

  mapCard: {
    marginTop: 20,
    height: 140,
    backgroundColor: "#1a2c1d",
    borderRadius: 14,
    padding: 12,
    justifyContent: "space-between",
  },

  mapLabel: {
    color: "white",
    fontWeight: "bold",
  },

  expand: {
    color: "#9ca3af",
    alignSelf: "flex-end",
  },

  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  viewAll: {
    color: "#13ec37",
  },

  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c3020",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },

  alertText: {
    color: "white",
    fontWeight: "600",
  },

  alertSub: {
    color: "#9ca3af",
    fontSize: 12,
  },

  badge: {
    color: "white",
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
  },

  smallCard: {
    flexDirection: "row",
    backgroundColor: "#1c3020",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },

  smallTitle: {
    color: "white",
    fontWeight: "600",
  },

  smallText: {
    color: "#9ca3af",
    fontSize: 12,
  },
});