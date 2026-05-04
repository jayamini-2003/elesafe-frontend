import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";

const alerts = [
  {
    id: "1",
    title: "Elephant Spotted",
    message: "Elephant spotted near Village Road",
    time: "5 min ago",
    distance: "0.8 km",
    type: "danger",
  },
  {
    id: "2",
    title: "High Risk Movement",
    message: "High risk movement detected in your area",
    time: "15 min ago",
    distance: "1.5 km",
    type: "danger",
  },
  {
    id: "3",
    title: "Safety Patrol",
    message: "Safety patrol active in your zone",
    time: "1 hr ago",
    distance: "3.2 km",
    type: "info",
  },
];

export default function Notifications() {
  return (
    <View style={{ flex: 1, backgroundColor: "#102213", padding: 20 }}>

      {/* HEADER */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20,paddingTop:25, }}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </Pressable>

        <Text
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "bold",
            marginLeft: 15,
          }}
        >
          Notifications
        </Text>
      </View>

      {/* LIST */}
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#1c3020",
              padding: 15,
              borderRadius: 12,
              marginBottom: 12,
            }}
          >
            {/* TOP ROW */}
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "white", fontWeight: "bold" }}>
                {item.title}
              </Text>

              <MaterialIcons
                name={item.type === "danger" ? "warning" : "info"}
                size={20}
                color={item.type === "danger" ? "#ef4444" : "#13ec37"}
              />
            </View>

            {/* MESSAGE */}
            <Text style={{ color: "#9ca3af", marginTop: 5 }}>
              {item.message}
            </Text>

            {/* FOOTER */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <Text style={{ color: "#6b7280", fontSize: 12 }}>
                ⏱ {item.time}
              </Text>

              <Text
                style={{
                  backgroundColor: "#ef4444",
                  color: "white",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                  fontSize: 12,
                }}
              >
                {item.distance}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: "#9ca3af", textAlign: "center", marginTop: 40 }}>
            No alerts yet
          </Text>
        }
      />
    </View>
  );
}