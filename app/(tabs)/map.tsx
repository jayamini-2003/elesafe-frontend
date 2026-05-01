import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function MapScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const mapRef = useRef<MapView | null>(null);

  const [location, setLocation] = useState<any>(null);

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      title: "LONE BULL",
      locationName: "Mahiyanganaya",
      latitude: 7.3333,
      longitude: 81.0,
      distance: "500m",
      time: "12m ago",
    },
  ]);

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

    const interval = setInterval(() => {
      setAlerts((prev) => [
        ...prev,
        {
          id: Date.now(),
          title: "ELEPHANT ALERT",
          locationName: "Mahiyanganaya",
          latitude: 7.3333 + Math.random() * 0.01,
          longitude: 81.0 + Math.random() * 0.01,
          distance: `${Math.floor(Math.random() * 1000)}m`,
          time: "Just now",
        },
      ]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getUserLocation = async () => {
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") return;

    const userLocation =
      await Location.getCurrentPositionAsync({});

    setLocation(userLocation.coords);
  };

  const focusOnAlert = (alert: any) => {
    mapRef.current?.animateToRegion(
      {
        latitude: alert.latitude,
        longitude: alert.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000
    );
  };

  const latestAlert = alerts[alerts.length - 1];

  return (
    <View style={styles.container}>
      {/* 🗺 FULL MAP */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        showsUserLocation={true}
        followsUserLocation={true}
        showsMyLocationButton={true}   // ✅ DEFAULT BUTTON ENABLED
        initialRegion={{
          latitude: location?.latitude || 7.3333,
          longitude: location?.longitude || 81.0,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }}
      >
        {alerts.map((alert) => (
          <Marker
            key={alert.id}
            coordinate={{
              latitude: alert.latitude,
              longitude: alert.longitude,
            }}
            title={alert.title}
          >
            <MaterialIcons name="warning" size={30} color="red" />
          </Marker>
        ))}
      </MapView>
    <View style={{ flex: 1, backgroundColor: "#102213" }}>

      {/* TOP BAR */}
      <View style={{ padding: 15 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#1c3020",
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 8,
            marginTop:25,
          }}
        >
          <MaterialIcons name="menu" size={22} color="white" />

      {/* 🔍 SEARCH BAR */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <MaterialIcons name="menu" size={22} color="white" />
          <TextInput
            placeholder="Search zones..."
            placeholderTextColor="#6b7280"
            style={styles.input}
          />
          <MaterialIcons name="search" size={22} color="white" />
        </View>
      </View>

      {/* 🚨 LIVE ALERT */}
      <Pressable onPress={() => focusOnAlert(latestAlert)}>
        <Animated.View
          style={[
            styles.warningCard,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Text style={styles.warningTitle}>
            🚨 LIVE ALERT - {latestAlert.locationName}
          </Text>

          <Text style={styles.warningText}>
            Elephant detected in {latestAlert.locationName}. Tap to
            view location.
          </Text>
        </Animated.View>
      </Pressable>

      {/* 📊 BOTTOM SHEET */}
      <View style={styles.bottomSheet}>
        <View style={styles.bottomHeader}>
          <Text style={styles.bottomTitle}>Live Activity</Text>

          <Pressable
            onPress={() => router.push("/report")}
            style={styles.reportButton}
          >
            <Text style={styles.reportText}>+ Report</Text>
          </Pressable>
        </View>

        {alerts.slice(-3).map((alert) => (
          <View key={alert.id} style={{ marginTop: 10 }}>
            <Text style={{ color: "white" }}>
              {alert.title} • {alert.time}
            </Text>
            <Text style={{ color: "#6b7280" }}>
              {alert.distance} away
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  topBar: {
    position: "absolute",
    top: 50,
    left: 15,
    right: 15,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c3020",
    borderRadius: 12,
    padding: 10,
  },

  input: {
    flex: 1,
    color: "white",
    marginLeft: 10,
  },

  warningCard: {
    position: "absolute",
    top: 120,
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
    marginTop: 5,
  },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1c3020",
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  bottomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  bottomTitle: {
    color: "white",
    fontWeight: "bold",
  },

  reportButton: {
    backgroundColor: "#13ec37",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },

  reportText: {
    color: "black",
    fontWeight: "bold",
  },
});