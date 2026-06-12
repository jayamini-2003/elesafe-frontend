// app/(drawer)/safety.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { fontSize, fontFamily, spacing, vs } from "../../utils/responsive";
import { theme } from "../../constants/theme";
import AppHeader from "../../components/AppHeader";
import React, { useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const C = theme.colors;
const { regular, medium, semiBold, bold, extraBold } = fontFamily;

function AccordionItem({
  rule,
  isOpen,
  onToggle,
}: {
  rule: { title: string; icon: string; desc: string };
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [animHeight] = useState(new Animated.Value(isOpen ? 1 : 0));

  React.useEffect(() => {
    Animated.timing(animHeight, {
      toValue: isOpen ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  const maxHeight = animHeight.interpolate({ inputRange: [0, 1], outputRange: [0, 80] });
  const opacity   = animHeight.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });

  return (
    <View style={styles.accordionWrap}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.accordionHeader, pressed && styles.accordionHeaderPressed]}
      >
        <View style={styles.accordionLeft}>
          <View style={[styles.accordionIconBox, isOpen && styles.accordionIconBoxOpen]}>
            <MaterialIcons
              name={rule.icon as any}
              size={18}
              color={isOpen ? C.primary : C.textMuted}
            />
          </View>
          <Text style={[styles.accordionTitle, isOpen && styles.accordionTitleOpen]}>
            {rule.title}
          </Text>
        </View>
        <MaterialIcons
          name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={20}
          color={isOpen ? C.primary : C.textMuted}
        />
      </Pressable>

      <Animated.View style={[styles.accordionBody, { maxHeight, opacity }]}>
        <Text style={styles.accordionDesc}>{rule.desc}</Text>
      </Animated.View>
    </View>
  );
}

export default function SafetyScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const EMERGENCY_NUMBER = "1124";

  const handleSOS = async () => {
    const phoneUrl = `tel:${EMERGENCY_NUMBER}`;
    try {
      await Linking.openURL(phoneUrl);
    } catch {
      Alert.alert(
        "Emergency Number",
        `Call ${EMERGENCY_NUMBER} immediately.\n\nIf the dialer did not open, dial manually from your phone.`,
        [{ text: "OK" }]
      );
    }
  };

  const toggle = (index: number) =>
    setOpenIndex((prev) => (prev === index ? null : index));

  const rules = [
    { title: "Maintain Safe Distance (30m+)", icon: "straighten",      desc: "Always keep at least 30 meters away from elephants in the wild." },
    { title: "Avoid Loud Noises",             icon: "volume-off",       desc: "Loud sounds can provoke elephants and trigger a charge unexpectedly." },
    { title: "No Flash Photography",          icon: "no-photography",   desc: "Camera flash can scare and trigger aggressive defensive behavior." },
    { title: "Retreat Slowly — Don't Run",    icon: "directions-walk",  desc: "Move back slowly and calmly. Running triggers a chase response." },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AppHeader
        title="Safety Guidelines"
        subtitle="Stay safe around wild elephants"
        rightIcon="warning"
        rightIconColor={C.danger}
        onRightPress={handleSOS}
      />

      {/* HERO IMAGE */}
      <View style={styles.heroWrap}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?q=80&w=1280" }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlayTop} />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroText}>Staying safe around Wild Elephants</Text>
        </View>
      </View>

      {/* SOS BANNER */}
      <Pressable
        style={({ pressed }) => [styles.sosBanner, pressed && { opacity: 0.88 }]}
        onPress={handleSOS}
      >
        <View style={styles.sosIconWrap}>
          <MaterialIcons name="warning" size={22} color={C.danger} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sosTitle}>Emergency SOS</Text>
          <Text style={styles.sosSubtitle}>Tap to call Wildlife Hotline • {EMERGENCY_NUMBER}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={C.danger} />
      </Pressable>

      {/* RULES ACCORDION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Rules</Text>
        {rules.map((rule, index) => (
          <AccordionItem
            key={index}
            rule={rule}
            isOpen={openIndex === index}
            onToggle={() => toggle(index)}
          />
        ))}
      </View>

      {/* VISUAL GUIDE */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Visual Guide</Text>
          <Text style={styles.sectionLink}>Full Manual</Text>
        </View>

        <View style={styles.guideRow}>
          <View style={[styles.guideCard, styles.guideCardDo]}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1502877338535-766e1452684a" }}
              style={styles.guideImage}
              resizeMode="cover"
            />
            <View style={styles.guideLabel}>
              <MaterialIcons name="check-circle" size={16} color={C.primary} />
              <Text style={[styles.guideLabelText, { color: C.primary }]}>DO</Text>
            </View>
            <Text style={styles.guideDesc}>Wait quietly for crossing.</Text>
          </View>

          <View style={[styles.guideCard, styles.guideCardDont]}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9" }}
              style={styles.guideImage}
              resizeMode="cover"
            />
            <View style={styles.guideLabel}>
              <MaterialIcons name="cancel" size={16} color={C.danger} />
              <Text style={[styles.guideLabelText, { color: C.danger }]}>DON'T</Text>
            </View>
            <Text style={styles.guideDesc}>Attempt to touch or feed.</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 40 },

  /* ── Hero ── */
  heroWrap: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: 20,
    overflow: "hidden",
    height: vs(200),
  },
  heroImage: { width: "100%", height: "100%" },
  heroOverlayTop: {
    position: "absolute",
    top: 0, left: 0, right: 0, height: "40%",
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: 16,
    backgroundColor: "rgba(6,26,14,0.62)",
  },
  heroText: {
    color: "#FFFFFF",
    fontSize: fontSize.md,
    fontFamily: extraBold,
    lineHeight: 26,
  },

  /* ── SOS Banner ── */
  sosBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: spacing.md,
    marginTop: 14,
    backgroundColor: "rgba(192,57,43,0.04)",
    borderWidth: 1,
    borderColor: C.danger + "33",
    borderRadius: 20,
    borderLeftWidth: 4,
    borderLeftColor: C.danger,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  sosIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.danger + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  sosTitle: {
    color: C.danger,
    fontFamily: bold,
    fontSize: fontSize.sm,
  },
  sosSubtitle: {
    color: C.textMuted,
    fontFamily: regular,
    fontSize: fontSize.xs,
    marginTop: 2,
  },

  /* ── Sections ── */
  section: { paddingHorizontal: spacing.md, paddingTop: spacing.lg },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: C.text,
    fontSize: fontSize.md,
    fontFamily: bold,
    marginBottom: 12,
  },
  sectionLink: {
    color: C.primary,
    fontFamily: medium,
    fontSize: fontSize.sm,
  },

  /* ── Accordion ── */
  accordionWrap: {
    marginBottom: 8,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.surface,
    padding: spacing.md,
  },
  accordionHeaderPressed: { backgroundColor: C.bgSubtle },
  accordionLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  accordionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bgSubtle,
    justifyContent: "center",
    alignItems: "center",
  },
  accordionIconBoxOpen: { backgroundColor: C.primary + "22" },
  accordionTitle: {
    color: C.textMuted,
    fontFamily: medium,
    fontSize: fontSize.sm,
    flex: 1,
  },
  accordionTitleOpen: {
    color: C.text,
    fontFamily: semiBold,
  },
  accordionBody: {
    backgroundColor: C.bgSubtle,
    overflow: "hidden",
    paddingHorizontal: spacing.md,
  },
  accordionDesc: {
    color: C.textMuted,
    fontFamily: regular,
    fontSize: fontSize.sm,
    lineHeight: 20,
    paddingVertical: 12,
  },

  /* ── Visual Guide ── */
  guideRow: { flexDirection: "row", gap: 10 },
  guideCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
  },
  guideCardDo:   { borderColor: C.primary + "44" },
  guideCardDont: { borderColor: C.danger  + "44" },
  guideImage: { width: "100%", height: vs(90), borderRadius: 10 },
  guideLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  guideLabelText: {
    fontFamily: bold,
    fontSize: fontSize.sm,
  },
  guideDesc: {
    color: C.textMuted,
    fontFamily: regular,
    marginTop: 5,
    fontSize: fontSize.xs,
  },
});
