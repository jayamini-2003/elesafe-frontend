import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function ReportTab() {
  return (
    <View style={{ flex: 1, backgroundColor: "#102213", justifyContent: "center", gap: 20, padding: 20 }}>
      
      <Text style={{ color: "white", fontSize: 22, fontWeight: "bold", textAlign: "center" }}>
        Select Report Type
      </Text>

      <Pressable
        onPress={() => router.push("/report/sighting")}
        style={{ backgroundColor: "#1c3020", padding: 20, borderRadius: 16 }}
      >
        <Text style={{ color: "#13ec37", textAlign: "center", fontWeight: "bold" }}>
          Report Sighting
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/report/damage")}
        style={{ backgroundColor: "#1c3020", padding: 20, borderRadius: 16 }}
      >
        <Text style={{ color: "#ef4444", textAlign: "center", fontWeight: "bold" }}>
          Report Damage
        </Text>
      </Pressable>

    </View>
  );
}