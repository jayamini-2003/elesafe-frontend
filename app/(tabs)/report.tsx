// app/(tabs)/report.tsx
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  Pressable,
  View,
} from "react-native";

export default function ReportTab() {
  return (
    <View style={styles.container}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>ELESAFE LANKA</Text>
        <Text style={styles.headerTitle}>Report{"\n"}Incident</Text>
        <Text style={styles.headerSub}>
          Select the type of incident to report
        </Text>
      </View>

      <View style={styles.divider} />

      {/* ── CARDS ── */}
      <View style={styles.cardGrid}>

        {/* ── SIGHTING CARD ── */}
        <View style={[styles.card, styles.cardSighting]}>
          {/* Left accent bar */}
          <View style={[styles.accentBar, { backgroundColor: "#13ec37" }]} />

          <View style={styles.cardInner}>
            {/* Top row */}
            <View style={styles.cardTopRow}>
              <View style={[styles.iconBox, { backgroundColor: "#13ec3722" }]}>
                <MaterialCommunityIcons name="elephant" size={32} color="#13ec37" />
              </View>
              <View style={[styles.tagBadge, { backgroundColor: "#13ec3722", borderColor: "#13ec3755" }]}>
                <View style={[styles.tagDot, { backgroundColor: "#13ec37" }]} />
                <Text style={[styles.tagLabel, { color: "#13ec37" }]}>SIGHTING</Text>
              </View>
            </View>

            {/* Title + desc */}
            <Text style={[styles.cardTitle, { color: "#13ec37" }]}>
              Elephant Sighting
            </Text>
            <Text style={styles.cardDesc}>
              Report elephant presence, movement or behavior in your area.
            </Text>

            {/* Pills */}
            <View style={styles.pillsRow}>
              {["📍 Location", "📷 Photo", "⚡ Quick"].map((p) => (
                <View key={p} style={[styles.pill, { borderColor: "#13ec3744" }]}>
                  <Text style={[styles.pillText, { color: "#13ec37" }]}>{p}</Text>
                </View>
              ))}
            </View>

            {/* ✅ Only the button is pressable */}
            <Pressable
              onPress={() => router.push("/report/sighting")}
              style={({ pressed }) => [
                styles.cardBtn,
                { backgroundColor: pressed ? "#0fbc2c" : "#13ec37" },
              ]}
            >
              <Text style={[styles.cardBtnText, { color: "#0a1a0d" }]}>
                Start Sighting Report
              </Text>
              <MaterialIcons name="arrow-forward" size={16} color="#0a1a0d" />
            </Pressable>
          </View>
        </View>

        {/* ── DAMAGE CARD ── */}
        <View style={[styles.card, styles.cardDamage]}>
          {/* Left accent bar */}
          <View style={[styles.accentBar, { backgroundColor: "#ef4444" }]} />

          <View style={styles.cardInner}>
            {/* Top row */}
            <View style={styles.cardTopRow}>
              <View style={[styles.iconBox, { backgroundColor: "#ef444422" }]}>
                <MaterialCommunityIcons name="home-alert" size={32} color="#ef4444" />
              </View>
              <View style={[styles.tagBadge, { backgroundColor: "#ef444422", borderColor: "#ef444455" }]}>
                <View style={[styles.tagDot, { backgroundColor: "#ef4444" }]} />
                <Text style={[styles.tagLabel, { color: "#ef4444" }]}>URGENT</Text>
              </View>
            </View>

            {/* Title + desc */}
            <Text style={[styles.cardTitle, { color: "#ef4444" }]}>
              Damage Report
            </Text>
            <Text style={styles.cardDesc}>
              Report property, crop, fence or vehicle damage caused by elephants.
            </Text>

            {/* Pills */}
            <View style={styles.pillsRow}>
              {["📍 Location", "📷 Evidence", "🏷️ Type"].map((p) => (
                <View key={p} style={[styles.pill, { borderColor: "#ef444444" }]}>
                  <Text style={[styles.pillText, { color: "#ef4444" }]}>{p}</Text>
                </View>
              ))}
            </View>

            {/* ✅ Only the button is pressable */}
            <Pressable
              onPress={() => router.push("/report/damage")}
              style={({ pressed }) => [
                styles.cardBtn,
                { backgroundColor: pressed ? "#c53030" : "#ef4444" },
              ]}
            >
              <Text style={[styles.cardBtnText, { color: "white" }]}>
                Start Damage Report
              </Text>
              <MaterialIcons name="arrow-forward" size={16} color="white" />
            </Pressable>
          </View>
        </View>

      </View>

      {/* ── TIPS STRIP ── */}
      <View style={styles.tipsStrip}>
        <MaterialIcons name="info-outline" size={13} color="#f59e0b" />
        <Text style={styles.tipsText}>
          Stay safe • Enable GPS • Take photo if safe • Add full details
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#102213",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  header: { marginTop: 50, marginBottom: 16 },

  headerEyebrow: {
    color: "#13ec37", fontSize: 11,
    fontWeight: "800", letterSpacing: 3, marginBottom: 6,
  },

  headerTitle: {
    color: "white", fontSize: 36,
    fontWeight: "800", lineHeight: 40, letterSpacing: -0.5,
  },

  headerSub: { color: "#4a6650", fontSize: 13, marginTop: 6 },

  divider: { height: 1, backgroundColor: "#1c3020", marginBottom: 16 },

  // ── Cards ──
  cardGrid: { flex: 1, gap: 12 },

  card: {
    flex: 1, borderRadius: 18,
    borderWidth: 1, flexDirection: "row", overflow: "hidden",
  },

  cardSighting: { backgroundColor: "#0d1f10", borderColor: "#13ec3322" },
  cardDamage:   { backgroundColor: "#1a0d0d", borderColor: "#ef444422" },

  accentBar: { width: 4 },

  cardInner: {
    flex: 1, padding: 18,
    justifyContent: "space-between",
  },

  cardTopRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
  },

  iconBox: {
    width: 56, height: 56, borderRadius: 16,
    justifyContent: "center", alignItems: "center",
  },

  tagBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },

  tagDot: { width: 6, height: 6, borderRadius: 3 },

  tagLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },

  cardTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3, marginBottom: 6 },

  cardDesc: { color: "#6b7280", fontSize: 12, lineHeight: 17, marginBottom: 12 },

  pillsRow: { flexDirection: "row", gap: 6, marginBottom: 14, flexWrap: "wrap" },

  pill: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, backgroundColor: "#ffffff05",
  },

  pillText: { fontSize: 10, fontWeight: "600" },

  // ✅ Button — full width, centered, with press feedback
  cardBtn: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    paddingVertical: 13, borderRadius: 12, width: "100%",
  },

  cardBtnText: { fontWeight: "800", fontSize: 13, letterSpacing: 0.3 },

  // ── Tips ──
  tipsStrip: {
    flexDirection: "row", alignItems: "center", gap: 7,
    backgroundColor: "#1c1a0d", borderWidth: 1,
    borderColor: "#f59e0b22", borderRadius: 10,
    padding: 10, marginTop: 12,
  },

  tipsText: { color: "#9a8a50", fontSize: 11, flex: 1 },
});