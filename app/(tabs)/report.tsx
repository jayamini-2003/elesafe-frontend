// app/(tabs)/report.tsx
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const REPORT_TYPES = [
  {
    id: "sighting",
    route: "/report/sighting",
    title: "Elephant Sighting",
    subtitle: "Spotted elephants nearby?",
    description: "Report presence, movement or behavior of elephants in your area.",
    icon: "elephant",
    iconLib: "community",
    accentColor: "#13ec37",
    bgColor: "#0d2a12",
    borderColor: "#13ec3733",
    tag: "Most Common",
    tagColor: "#13ec37",
    stats: [
      { label: "Quick", icon: "flash-on" },
      { label: "GPS", icon: "location-on" },
      { label: "Photo", icon: "camera-alt" },
    ],
  },
  {
    id: "damage",
    route: "/report/damage",
    title: "Damage Report",
    subtitle: "Property or crop damage?",
    description: "Report damage to property, crops, fences or vehicles caused by elephants.",
    icon: "home-alert",
    iconLib: "community",
    accentColor: "#ef4444",
    bgColor: "#2a0d0d",
    borderColor: "#ef444433",
    tag: "Urgent",
    tagColor: "#ef4444",
    stats: [
      { label: "Evidence", icon: "camera-alt" },
      { label: "Location", icon: "location-on" },
      { label: "Type", icon: "category" },
    ],
  },
];

export default function ReportTab() {
  const [pressing, setPressing] = useState<string | null>(null);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Report Incident</Text>
        <Text style={styles.headerSub}>
          Help protect your community by reporting elephant activity
        </Text>
      </View>

      {/* ── ALERT BANNER ── */}
      <View style={styles.alertBanner}>
        <MaterialIcons name="info-outline" size={16} color="#f59e0b" />
        <Text style={styles.alertText}>
          Reports are reviewed by wildlife officers within 24 hours
        </Text>
      </View>

      {/* ── REPORT CARDS ── */}
      <View style={styles.cardGrid}>
        {REPORT_TYPES.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => router.push(item.route as any)}
            onPressIn={() => setPressing(item.id)}
            onPressOut={() => setPressing(null)}
            style={[
              styles.card,
              {
                backgroundColor: item.bgColor,
                borderColor: pressing === item.id ? item.accentColor : item.borderColor,
                borderWidth: pressing === item.id ? 2 : 1,
              },
            ]}
          >
            {/* Tag */}
            <View style={[styles.tag, { backgroundColor: item.accentColor + "22", borderColor: item.accentColor + "55" }]}>
              <Text style={[styles.tagText, { color: item.accentColor }]}>
                {item.tag}
              </Text>
            </View>

            {/* Icon */}
            <View style={[styles.iconCircle, { backgroundColor: item.accentColor + "18" }]}>
              <MaterialCommunityIcons
                name={item.icon as any}
                size={44}
                color={item.accentColor}
              />
            </View>

            {/* Text */}
            <Text style={[styles.cardTitle, { color: item.accentColor }]}>
              {item.title}
            </Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>

            {/* Feature pills */}
            <View style={styles.pillRow}>
              {item.stats.map((s) => (
                <View key={s.label} style={[styles.pill, { borderColor: item.accentColor + "44" }]}>
                  <MaterialIcons name={s.icon as any} size={11} color={item.accentColor} />
                  <Text style={[styles.pillText, { color: item.accentColor }]}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Arrow button */}
            <View style={[styles.arrowBtn, { backgroundColor: item.accentColor }]}>
              <Text style={styles.arrowBtnText}>Start Report</Text>
              <MaterialIcons name="arrow-forward" size={16} color="black" />
            </View>
          </Pressable>
        ))}
      </View>

      {/* ── QUICK TIPS ── */}
      <View style={styles.tipsBox}>
        <Text style={styles.tipsTitle}>📋 Before you report</Text>
        {[
          "Stay at a safe distance from elephants",
          "Enable GPS for accurate location",
          "Take a photo as evidence if safe to do so",
          "Add as many details as possible",
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#102213" },
  content: { padding: 20, paddingBottom: 40 },

  // ── Header ──
  header: { marginTop: 35, marginBottom: 16 },
  headerTitle: {
    color: "white", fontSize: 26, fontWeight: "bold",
  },
  headerSub: {
    color: "#6b7280", fontSize: 13, marginTop: 4, lineHeight: 18,
  },

  // ── Alert banner ──
  alertBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#2a1f0d", borderWidth: 1,
    borderColor: "#f59e0b44", borderRadius: 10,
    padding: 10, marginBottom: 20,
  },
  alertText: { color: "#f59e0b", fontSize: 12, flex: 1 },

  // ── Cards ──
  cardGrid: { gap: 16 },

  card: {
    borderRadius: 20, padding: 20,
    borderWidth: 1,
  },

  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20, borderWidth: 1,
    marginBottom: 14,
  },
  tagText: { fontSize: 11, fontWeight: "bold" },

  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: "center", alignItems: "center",
    marginBottom: 16, alignSelf: "center",
  },

  cardTitle: {
    fontSize: 22, fontWeight: "bold",
    textAlign: "center",
  },
  cardSubtitle: {
    color: "#9ca3af", fontSize: 13,
    textAlign: "center", marginTop: 4,
  },
  cardDesc: {
    color: "#6b7280", fontSize: 12,
    textAlign: "center", marginTop: 8,
    lineHeight: 18,
  },

  // Feature pills
  pillRow: {
    flexDirection: "row", justifyContent: "center",
    gap: 8, marginTop: 14, flexWrap: "wrap",
  },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
    backgroundColor: "#ffffff08",
  },
  pillText: { fontSize: 10, fontWeight: "600" },

  // Arrow button
  arrowBtn: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", gap: 6,
    marginTop: 16, padding: 13, borderRadius: 12,
  },
  arrowBtnText: { color: "black", fontWeight: "bold", fontSize: 14 },

  // ── Tips ──
  tipsBox: {
    marginTop: 24, backgroundColor: "#1c3020",
    borderRadius: 16, padding: 16,
  },
  tipsTitle: {
    color: "white", fontWeight: "bold",
    fontSize: 14, marginBottom: 12,
  },
  tipRow: {
    flexDirection: "row", alignItems: "flex-start",
    gap: 10, marginBottom: 8,
  },
  tipDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: "#13ec37", marginTop: 5,
  },
  tipText: { color: "#9ca3af", fontSize: 12, flex: 1, lineHeight: 18 },
});