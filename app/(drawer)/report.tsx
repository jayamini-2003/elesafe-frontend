// app/(drawer)/report.tsx
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { theme } from "../../constants/theme";
import { StyleSheet, Text, Pressable, View } from "react-native";
import AppHeader from "../../components/AppHeader";
import { useTranslation } from "../../context/LocaleContext";
import { fontSize, fontFamily, spacing } from "../../utils/responsive";

const C = theme.colors;
const { regular, medium, semiBold, bold, extraBold } = fontFamily;

export default function ReportTab() {
  const { t } = useTranslation();

  return (
    <View style={styles.screen}>

      <AppHeader title={t('reportHub.title')} subtitle={t('reportHub.subtitle')} />

      <View style={styles.container}>
        <View style={styles.subHeader}>
          <Text style={styles.headerEyebrow}>{t('reportHub.brand')}</Text>
          <Text style={styles.headerSub}>{t('reportHub.selectType')}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardGrid}>

          <View style={[styles.card, styles.cardSighting]}>
            <View style={[styles.accentBar, { backgroundColor: C.primary }]} />
            <View style={styles.cardInner}>
              <View style={styles.cardTopRow}>
                <View style={[styles.iconBox, { backgroundColor: C.primary + "22" }]}>
                  <MaterialCommunityIcons name="elephant" size={32} color={C.primary} />
                </View>
                <View style={[styles.tagBadge, { backgroundColor: C.primary + "18", borderColor: C.primary + "44" }]}>
                  <View style={[styles.tagDot, { backgroundColor: C.primary }]} />
                  <Text style={[styles.tagLabel, { color: C.primary }]}>{t('reportHub.sightingTag')}</Text>
                </View>
              </View>

              <Text style={[styles.cardTitle, { color: C.primaryDark }]}>{t('reportHub.sighting')}</Text>
              <Text style={styles.cardDesc}>{t('reportHub.sightingDesc')}</Text>

              <View style={styles.pillsRow}>
                {[t('reportHub.pillLocation'), t('reportHub.pillPhoto'), t('reportHub.pillQuick')].map((p) => (
                  <View key={p} style={[styles.pill, { borderColor: C.primary + "44" }]}>
                    <Text style={[styles.pillText, { color: C.primary }]}>{p}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                onPress={() => router.push("/report/sighting")}
                style={({ pressed }) => [
                  styles.cardBtn,
                  { backgroundColor: pressed ? C.primaryDark : C.primary },
                ]}
              >
                <Text style={[styles.cardBtnText, { color: C.surface }]}>{t('reportHub.startSighting')}</Text>
                <MaterialIcons name="arrow-forward" size={16} color={C.surface} />
              </Pressable>
            </View>
          </View>

          <View style={[styles.card, styles.cardDamage]}>
            <View style={[styles.accentBar, { backgroundColor: C.danger }]} />
            <View style={styles.cardInner}>
              <View style={styles.cardTopRow}>
                <View style={[styles.iconBox, { backgroundColor: C.danger + "18" }]}>
                  <MaterialCommunityIcons name="home-alert" size={32} color={C.danger} />
                </View>
                <View style={[styles.tagBadge, { backgroundColor: C.danger + "18", borderColor: C.danger + "44" }]}>
                  <View style={[styles.tagDot, { backgroundColor: C.danger }]} />
                  <Text style={[styles.tagLabel, { color: C.danger }]}>{t('reportHub.urgent')}</Text>
                </View>
              </View>

              <Text style={[styles.cardTitle, { color: C.primaryDark }]}>{t('reportHub.damage')}</Text>
              <Text style={styles.cardDesc}>{t('reportHub.damageDesc')}</Text>

              <View style={styles.pillsRow}>
                {[t('reportHub.pillLocation'), t('reportHub.pillEvidence'), t('reportHub.pillType')].map((p) => (
                  <View key={p} style={[styles.pill, { borderColor: C.danger + "44" }]}>
                    <Text style={[styles.pillText, { color: C.danger }]}>{p}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                onPress={() => router.push("/report/damage")}
                style={({ pressed }) => [
                  styles.cardBtn,
                  { backgroundColor: pressed ? "#a93025" : C.danger },
                ]}
              >
                <Text style={[styles.cardBtnText, { color: C.surface }]}>{t('reportHub.startDamage')}</Text>
                <MaterialIcons name="arrow-forward" size={16} color={C.surface} />
              </Pressable>
            </View>
          </View>

        </View>

        <View style={styles.tipsStrip}>
          <MaterialIcons name="info-outline" size={15} color="#f59e0b" />
          <Text style={styles.tipsText}>{t('reportHub.tips')}</Text>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },

  subHeader: {
    paddingTop: spacing.md,
    marginBottom: 4,
  },
  headerEyebrow: {
    color: C.primary,
    fontSize: fontSize.xs,
    fontFamily: extraBold,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  headerSub: {
    color: C.textMuted,
    fontFamily: regular,
    fontSize: fontSize.sm,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 12,
  },

  cardGrid: { flex: 1, gap: 14 },
  card: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: C.surface,
  },
  cardSighting: { borderColor: C.primary + "22" },
  cardDamage:   { borderColor: C.danger  + "22" },

  accentBar: { width: 4 },

  cardInner: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  tagBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
  },
  tagDot:  { width: 6, height: 6, borderRadius: 3 },
  tagLabel: {
    fontSize: fontSize.xxs,
    fontFamily: extraBold,
    letterSpacing: 1.5,
  },

  cardTitle: {
    fontSize: fontSize.lg,
    fontFamily: extraBold,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  cardDesc: {
    color: C.textMuted,
    fontFamily: regular,
    fontSize: fontSize.sm,
    lineHeight: 19,
    marginBottom: 12,
  },

  pillsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  pill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
    backgroundColor: C.surface,
  },
  pillText: {
    fontSize: fontSize.xxs,
    fontFamily: semiBold,
  },

  cardBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    width: "100%",
  },
  cardBtnText: {
    fontFamily: bold,
    fontSize: fontSize.sm,
    letterSpacing: 0.3,
  },

  tipsStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: "#f59e0b22",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  tipsText: {
    color: C.textMuted,
    fontFamily: regular,
    fontSize: fontSize.sm,
    flex: 1,
  },
});
