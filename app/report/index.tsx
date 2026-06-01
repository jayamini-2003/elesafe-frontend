import { fontSize } from "../../utils/responsive";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";

const C = theme.colors;

export default function ReportHome() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Report Incident</Text>

      <Pressable
        onPress={() => router.push("/report/sighting")}
        style={styles.sightingBtn}
      >
        <Text style={styles.sightingText}>Report Sighting</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/report/damage")}
        style={styles.damageBtn}
      >
        <Text style={styles.damageText}>Report Damage</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, justifyContent: "center", gap: 20, padding: 20, backgroundColor: C.bg },
  title:        { color: C.text, fontSize: fontSize.xl, fontWeight: "bold", textAlign: "center" },
  sightingBtn:  { backgroundColor: C.surface, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: C.border },
  sightingText: { color: C.primary, textAlign: "center", fontWeight: "bold", fontSize: fontSize.base },
  damageBtn:    { backgroundColor: C.surface, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: C.border },
  damageText:   { color: C.danger, textAlign: "center", fontWeight: "bold", fontSize: fontSize.base },
});
