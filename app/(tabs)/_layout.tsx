// app/(tabs)/_layout.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useAlertSocket } from "../../hooks/useAlertSocket";

// Badge dot shown on the Home tab icon when there are unread alerts
function TabBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
    </View>
  );
}

export default function TabLayout() {
  const { unreadCount } = useAlertSocket();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#102213",
          borderTopColor: "#1c3020",
        },
        tabBarActiveTintColor: "#13ec37",
        tabBarInactiveTintColor: "#6b7280",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <View>
              <MaterialIcons name="home" size={size} color={color} />
              {/* Red badge on Home tab when there are unread alerts */}
              <TabBadge count={unreadCount} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="map" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="report"
        options={{
          title: "Report",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="report" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="history" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="safety"
        options={{
          title: "Safety",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="health-and-safety" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#ef4444",
    borderRadius: 99,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#102213",
  },
  badgeText: {
    color: "white",
    fontSize: 9,
    fontWeight: "800",
    lineHeight: 11,
  },
});
