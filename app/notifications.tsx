import { FlatList, Text, View } from "react-native";

const alerts = [
  { id: "1", message: "⚠️ Elephant spotted near Village Road" },
  { id: "2", message: "🚨 High risk movement detected in your area" },
  { id: "3", message: "ℹ️ Safety patrol active in your zone" },
];

export default function Notifications() {
  return (
    <View style={{ flex: 1, backgroundColor: "#102213", padding: 20 }}>
      
      <Text style={{ color: "white", fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
        Notifications
      </Text>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#1c3020",
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "white" }}>{item.message}</Text>
          </View>
        )}
      />
    </View>
  );
}