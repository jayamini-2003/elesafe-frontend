import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export default function MapScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
  }, []);

  return (
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

          <TextInput
            placeholder="Search zones..."
            placeholderTextColor="#6b7280"
            style={{ flex: 1, color: "white", marginLeft: 10 }}
          />

          <MaterialIcons name="search" size={22} color="white" />
        </View>
      </View>

      {/* MAP CARD (REDUCED HEIGHT) */}
      <View style={{ paddingHorizontal: 15 }}>

        <View
          style={{
            height: 220,   // 🔥 reduced size
            backgroundColor: "#0f1f14",
            borderRadius: 18,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#6b7280" }}>🌄 Map View</Text>

          {/* Marker */}
          <View
            style={{
              position: "absolute",
              top: "40%",
              left: "45%",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "red",
                padding: 6,
                borderRadius: 20,
              }}
            >
              <MaterialIcons name="warning" size={18} color="white" />
            </View>

            <Text style={{ color: "white", fontSize: 12 }}>
              LONE BULL
            </Text>
          </View>
        </View>

        {/* 🔴 WARNING UNDER MAP (JUMPING) */}
        <Animated.View
          style={{
            marginTop: 10,
            backgroundColor: "#ef4444",
            padding: 12,
            borderRadius: 12,
            transform: [{ scale: pulseAnim }],
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="warning" size={20} color="white" />
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                marginLeft: 8,
              }}
            >
              IMMEDIATE WARNING
            </Text>
          </View>

          <Text style={{ color: "white", marginTop: 5 }}>
            Lone Bull spotted 500m North moving towards village.
          </Text>
        </Animated.View>
      </View>

      {/* BOTTOM SHEET */}
      <View
        style={{
          marginTop: 15,
          backgroundColor: "#1c3020",
          padding: 15,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Nearby Activity
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 12 }}>
              3 reports in last 2 hours
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/report")}
            style={{
              backgroundColor: "#13ec37",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontWeight: "bold", color: "black" }}>
              + Report
            </Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 15 }}>
          <Text style={{ color: "white" }}>Lone Bull Alert • 12m ago</Text>
          <Text style={{ color: "#6b7280", fontSize: 12 }}>
            0.5 km away
          </Text>
        </View>
      </View>

    </View>
  );
}