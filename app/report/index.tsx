import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function ReportHome() {
  return (
    <View style={{ flex: 1, justifyContent: "center", gap: 20, padding: 20, backgroundColor: "#102213" }}>
      
      <Text style={{ color: "white", fontSize: 24, fontWeight: "bold", textAlign: "center" }}>
        Report Incident
      </Text>

      <Pressable
        onPress={() => router.push("/(tabs)/report/sighting")}
        style={{ backgroundColor: "#1c3020", padding: 15, borderRadius: 10 }}
      >
        <Text style={{ color: "#13ec37", textAlign: "center", fontWeight: "bold" }}>
          Report Sighting
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/(tabs)/report/damage")}
        style={{ backgroundColor: "#1c3020", padding: 15, borderRadius: 10 }}
      >
        <Text style={{ color: "#ef4444", textAlign: "center", fontWeight: "bold" }}>
          Report Damage
        </Text>
      </Pressable>

    </View>
  );
}