import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

type Report = {
  id: string;
  type: "SIGHTING" | "DAMAGE";
  title: string;
  location: string;
  time: string;
};

export default function HistoryScreen() {
  const [activeTab, setActiveTab] = useState<"SIGHTING" | "DAMAGE">(
    "SIGHTING"
  );

  // 🔥 Dummy reports (later replace with backend)
  const reports: Report[] = [
    {
      id: "1",
      type: "SIGHTING",
      title: "Elephant Herd",
      location: "Sigiriya Rd",
      time: "10 min ago",
    },
    {
      id: "2",
      type: "DAMAGE",
      title: "Crop Damage",
      location: "Dambulla Field",
      time: "45 min ago",
    },
    {
      id: "3",
      type: "SIGHTING",
      title: "Lone Elephant",
      location: "Habarana",
      time: "1 hour ago",
    },
  ];

  const filtered = reports.filter((r) => r.type === activeTab);

  return (
    <View style={{ flex: 1, backgroundColor: "#102213", padding: 20 }}>
      
      {/* HEADER */}
      <Text style={{ color: "white", fontSize: 22, fontWeight: "bold" ,paddingTop:25 ,}}>
        History
      </Text>

      {/* TABS */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 20,
          backgroundColor: "#1c3020",
          borderRadius: 12,
        }}
      >
        <Pressable
          onPress={() => setActiveTab("SIGHTING")}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            backgroundColor:
              activeTab === "SIGHTING" ? "#13ec37" : "transparent",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontWeight: "bold",
              color: activeTab === "SIGHTING" ? "black" : "#9ca3af",
            }}
          >
            Sightings
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("DAMAGE")}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            backgroundColor:
              activeTab === "DAMAGE" ? "#13ec37" : "transparent",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontWeight: "bold",
              color: activeTab === "DAMAGE" ? "black" : "#9ca3af",
            }}
          >
            Damage
          </Text>
        </Pressable>
      </View>

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#1c3020",
              padding: 15,
              borderRadius: 12,
              marginBottom: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                {item.title}
              </Text>

              <MaterialIcons
                name={
                  item.type === "SIGHTING"
                    ? "visibility"
                    : "warning"
                }
                size={18}
                color={item.type === "SIGHTING" ? "#13ec37" : "#ef4444"}
              />
            </View>

            <Text style={{ color: "#9ca3af", marginTop: 5 }}>
              📍 {item.location}
            </Text>

            <Text style={{ color: "#6b7280", marginTop: 3 }}>
              ⏱ {item.time}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: "#9ca3af", textAlign: "center", marginTop: 40 }}>
            No reports yet
          </Text>
        }
      />
    </View>
  );
}