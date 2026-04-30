import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function ReportTab() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#102213",
        padding: 20,
      }}
    >
      {/* HEADER */}
      <Text
        style={{
          color: "white",
          fontSize: 24,
          fontWeight: "bold",
          marginTop:30,
        }}
      >
        Select Report Type
      </Text>

      {/* OPTIONS */}
      <View style={{ marginTop: 25, gap: 15 }}>

        {/* SIGHTING CARD */}
        <Pressable
          onPress={() => router.push("/report/sighting")}
          style={{
            backgroundColor: "#1c3020",
            height: 140,
            padding: 20,
            borderRadius: 16,
            justifyContent: "flex-start",
          }}
        >
          <Text
            style={{
              color: "#13ec37",
              fontSize: 22,
              fontWeight: "bold",
            }}
          >
            Report Sighting
          </Text>

          <Text
            style={{
              color: "#9ca3af",
              marginTop: 5,
              fontSize: 13,
            }}
          >
            Report elephant presence or movement in your area.
          </Text>
        </Pressable>

        {/* DAMAGE CARD */}
        <Pressable
          onPress={() => router.push("/report/damage")}
          style={{
            backgroundColor: "#1c3020",
            height: 140,
            padding: 20,
            borderRadius: 16,
            justifyContent: "flex-start",
          }}
        >
          <Text
            style={{
              color: "#ef4444",
              fontSize: 22,
              fontWeight: "bold",
            }}
          >
            Report Damage
          </Text>

          <Text
            style={{
              color: "#9ca3af",
              marginTop: 5,
              fontSize: 13,
            }}
          >
            Report property, crop, or fence damage caused by elephants.
          </Text>
        </Pressable>

      </View>
    </View>
  );
}