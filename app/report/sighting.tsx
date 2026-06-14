// app/report/sighting.tsx
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { theme } from "../../constants/theme";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ElephantBehavior, reportService } from "../../services/reportService";
import { fontSize, fontFamily, spacing, vs } from "../../utils/responsive";
import AppHeader from "../../components/AppHeader";
import { AppPicker } from "../../components/AppPicker";
import { useTranslation } from "../../context/LocaleContext";
import { localizeGpsError } from "../../i18n";
import { uploadReportImage } from "../../services/supabase";
import { fetchCurrentLocation } from "../../utils/locationHelper";

const C = theme.colors;

const SRI_LANKA_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
  "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
  "Mannar", "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
];

const BEHAVIOR_OPTIONS = [
  { value: "Walking", labelKey: "sightingForm.walking" },
  { value: "Eating", labelKey: "sightingForm.eating" },
  { value: "Aggressive", labelKey: "sightingForm.aggressive" },
  { value: "Crossing Road", labelKey: "sightingForm.crossingRoad" },
] as const;

export default function SightingReport() {
  const { t } = useTranslation();
  const [count, setCount]               = useState(1);
  const [behavior, setBehavior]         = useState("Walking");
  const [image, setImage]               = useState<string | null>(null);
  const [district, setDistrict]         = useState("");
  const [village, setVillage]           = useState("");
  const [notes, setNotes]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [locationText, setLocationText] = useState("");
  const [gpsLoading, setGpsLoading]     = useState(false);
  const [coords, setCoords]             = useState<{ latitude: number; longitude: number } | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const gpsPlaceholder = t("sightingForm.tapGps");
  const displayLocationText = locationText || gpsPlaceholder;

  const getLocation = async () => {
    try {
      setGpsLoading(true);
      const result = await fetchCurrentLocation();
      setCoords(result.coords);
      if (result.district) setDistrict(result.district);
      if (result.village) setVillage(result.village);
      setLocationText(result.locationText);
    } catch (error: any) {
      Alert.alert(
        t("sightingForm.gpsError"),
        localizeGpsError(error?.message || "", t),
      );
    } finally {
      setGpsLoading(false);
    }
  };

  const pickImage = () => {
    Alert.alert(t("sightingForm.addPhotoTitle"), t("sightingForm.chooseSource"), [
      {
        text: t("sightingForm.camera"),
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) {
            Alert.alert(t("common.permissionRequired"), t("sightingForm.cameraPermission"));
            return;
          }
          const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
          if (!res.canceled) setImage(res.assets[0].uri);
        },
      },
      {
        text: t("sightingForm.gallery"),
        onPress: async () => {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) {
            Alert.alert(t("common.permissionRequired"), t("sightingForm.galleryPermission"));
            return;
          }
          const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
          if (!res.canceled) setImage(res.assets[0].uri);
        },
      },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const submit = async () => {
    if (!district || !village) {
      Alert.alert(t("sightingForm.missingInfo"), t("sightingForm.missingDistrictVillage"));
      return;
    }
    try {
      setLoading(true);
      let imageUrl: string | undefined = undefined;
      if (image) imageUrl = await uploadReportImage("sighting", image);
      const behaviorMap: Record<string, ElephantBehavior> = {
        Walking: "CALM", Eating: "FEEDING", Aggressive: "AGGRESSIVE", "Crossing Road": "MOVING",
      };
      await reportService.submitSighting({
        district, village,
        latitude: coords?.latitude, longitude: coords?.longitude,
        numberOfElephants: count,
        behavior: behaviorMap[behavior] ?? "CALM",
        additionalNotes: notes, imagePath: imageUrl,
      });
      Alert.alert(t("sightingForm.successTitle"), t("sightingForm.submitted"));
      router.back();
    } catch (error: any) {
      Alert.alert(t("common.error"), error.response?.data?.message || t("sightingForm.submitError"));
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setCount(1); setBehavior("Walking"); setImage(null);
    setDistrict(""); setVillage(""); setNotes("");
    setLocationText(""); setCoords(null);
  };

  const fieldStyle = (field: string) => ({
    borderColor: focusedField === field ? C.primary : C.border,
    backgroundColor: focusedField === field ? C.surface : C.bgSubtle,
  });

  return (
    <View style={styles.screen}>
      <AppHeader
        title={t("sightingForm.title")}
        subtitle={t("sightingForm.subtitle")}
        mode="back"
        rightIcon="close"
        rightIconColor={C.danger}
        onRightPress={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── LOCATION CARD ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionLabel}>{t("sightingForm.location")}</Text>
          </View>

          <View style={styles.mapBox}>
            {coords ? (
              <View style={styles.mapPreview}>
                <View style={styles.mapPinCircle}>
                  <MaterialIcons name="location-on" size={32} color={C.danger} />
                </View>
                <Text style={styles.coordsText}>
                  {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
                </Text>
                <Text style={styles.coordsSub} numberOfLines={2}>{displayLocationText}</Text>
              </View>
            ) : (
              <View style={styles.mapPlaceholder}>
                <MaterialIcons name="map" size={36} color={C.border} />
                <Text style={styles.mapPlaceholderText}>{t("sightingForm.tapGpsMap")}</Text>
              </View>
            )}
          </View>

          <View style={[styles.pickerRow, district ? styles.pickerRowFilled : null, { marginTop: spacing.sm }]}>
            <MaterialIcons name="location-pin" size={18} color={district ? C.primary : C.textMuted} />
            <View style={styles.pickerFlex}>
              <AppPicker
                selectedValue={district}
                onValueChange={setDistrict}
                placeholder={t("sightingForm.selectDistrict")}
                filled={!!district}
                items={SRI_LANKA_DISTRICTS.map((d) => ({ label: d, value: d }))}
              />
            </View>
          </View>

          <View style={[styles.inputField, fieldStyle('village'), { marginTop: 10 }]}>
            <MaterialIcons name="location-city" size={18} color={focusedField === 'village' ? C.primary : C.textMuted} />
            <TextInput
              placeholder={t("sightingForm.villagePlaceholder")}
              placeholderTextColor={C.textMuted}
              value={village} onChangeText={setVillage}
              onFocus={() => setFocusedField('village')}
              onBlur={() => setFocusedField(null)}
              style={styles.inputText}
            />
          </View>

          <View style={styles.gpsPill}>
            <MaterialIcons name="my-location" size={15} color={C.primary} />
            <Text style={styles.gpsPillText} numberOfLines={1}>{displayLocationText}</Text>
            <Pressable onPress={getLocation} disabled={gpsLoading} style={styles.gpsBtn}>
              {gpsLoading
                ? <ActivityIndicator size="small" color={C.surface} />
                : <Text style={styles.gpsBtnText}>{t("sightingForm.gps")}</Text>}
            </Pressable>
          </View>
        </View>

        {/* ── ANIMALS CARD ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionLabel}>{t("sightingForm.animals")}</Text>
          </View>

          <Text style={styles.fieldLabel}>{t("sightingForm.howMany")}</Text>
          <View style={styles.counter}>
            <Pressable onPress={() => setCount(Math.max(1, count - 1))} style={styles.counterBtn}>
              <Text style={styles.counterMinus}>−</Text>
            </Pressable>
            <Text style={styles.countText}>{count}</Text>
            <Pressable onPress={() => setCount(count + 1)} style={[styles.counterBtn, styles.counterBtnPlus]}>
              <Text style={styles.counterPlus}>+</Text>
            </Pressable>
          </View>

          <Text style={[styles.fieldLabel, { marginTop: spacing.sm }]}>{t("sightingForm.whatDoing")}</Text>
          <View style={styles.tags}>
            {BEHAVIOR_OPTIONS.map(({ value, labelKey }) => (
              <Pressable
                key={value}
                onPress={() => setBehavior(value)}
                style={[styles.tag, behavior === value && styles.activeTag]}
              >
                <Text style={[styles.tagText, behavior === value && styles.activeTagText]}>
                  {t(labelKey)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── NOTES CARD ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionLabel}>{t("sightingForm.notes")}</Text>
          </View>
          <TextInput
            placeholder={t("sightingForm.extraDetails")}
            placeholderTextColor={C.textMuted}
            value={notes} onChangeText={setNotes}
            multiline
            onFocus={() => setFocusedField('notes')}
            onBlur={() => setFocusedField(null)}
            style={[styles.multilineInput, fieldStyle('notes')]}
          />
        </View>

        {/* ── EVIDENCE CARD ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionLabel}>{t("sightingForm.evidence")}</Text>
          </View>
          <Pressable onPress={pickImage} style={[styles.imageSlot, image ? styles.imageSlotFilled : null]}>
            {image ? (
              <>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <Pressable onPress={() => setImage(null)} style={styles.imageRemoveBtn}>
                  <MaterialIcons name="close" size={14} color={C.surface} />
                </Pressable>
              </>
            ) : (
              <>
                <MaterialIcons name="add-a-photo" size={28} color={C.textMuted} />
                <Text style={styles.imageSlotLabel}>{t("sightingForm.addPhoto")}</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* ── ACTION BUTTONS ── */}
        <View style={styles.buttonRow}>
          <Pressable style={styles.clearBtn} onPress={clear}>
            <Text style={styles.clearText}>{t("common.clear")}</Text>
          </Pressable>
          <Pressable style={styles.submitBtn} onPress={submit} disabled={loading}>
            {loading
              ? <ActivityIndicator color={C.surface} />
              : <Text style={styles.submitText}>{t("sightingForm.submit")}</Text>}
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}

const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 8,
  elevation: 3,
};

const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: 48 },

  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...cardShadow,
  },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  sectionAccent: { width: 3, height: 16, backgroundColor: C.primary, borderRadius: 2, marginRight: 8 },
  sectionLabel:  {
    color: C.textMuted, fontSize: fontSize.sm,
    fontFamily: fontFamily.semiBold, letterSpacing: 1.5,
  },

  mapBox: {
    height: vs(160), borderRadius: 12, marginBottom: spacing.sm,
    overflow: 'hidden', backgroundColor: C.bgSubtle,
    borderWidth: 1, borderColor: C.border,
  },
  mapPreview: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F0F7F4', padding: spacing.md, gap: 6,
  },
  mapPinCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: C.danger + '44',
  },
  coordsText: {
    color: C.text, fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm, marginTop: 4,
  },
  coordsSub: {
    color: C.textMuted, fontFamily: fontFamily.regular,
    fontSize: fontSize.xs, textAlign: 'center',
  },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  mapPlaceholderText: {
    color: C.textMuted, fontSize: fontSize.sm, textAlign: 'center',
    paddingHorizontal: 20, fontFamily: fontFamily.regular,
  },
  inputField: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, borderWidth: 1,
    paddingVertical: spacing.sm, paddingHorizontal: 14,
  },
  inputText: {
    flex: 1, marginLeft: 10,
    color: C.text, fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
  },

  pickerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  pickerRowFilled: {},
  pickerFlex: { flex: 1 },

  gpsPill: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 10, backgroundColor: C.bgSubtle,
    borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14,
    borderWidth: 1, borderColor: C.border, gap: 8,
  },
  gpsPillText: {
    flex: 1, color: C.textMuted, fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
  },
  gpsBtn: {
    backgroundColor: C.primary, paddingHorizontal: 14,
    paddingVertical: 5, borderRadius: 12,
    minWidth: 40, alignItems: 'center',
  },
  gpsBtnText: { color: C.surface, fontFamily: fontFamily.bold, fontSize: fontSize.xs },

  fieldLabel: {
    color: C.textMuted, fontSize: fontSize.xs,
    fontFamily: fontFamily.semiBold, letterSpacing: 0.8,
    marginBottom: 8,
  },

  counter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.bgSubtle, borderRadius: 12,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
  },
  counterBtn:     { width: 52, height: 48, justifyContent: 'center', alignItems: 'center' },
  counterBtnPlus: { backgroundColor: C.primary },
  counterMinus:   { color: C.textMuted, fontSize: fontSize.lg, fontFamily: fontFamily.bold },
  counterPlus:    { color: C.surface, fontSize: fontSize.lg, fontFamily: fontFamily.bold },
  countText:      { color: C.text, fontSize: fontSize.lg, fontFamily: fontFamily.bold },

  tags:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:          { borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.bgSubtle },
  activeTag:    { backgroundColor: C.primary, borderColor: C.primary },
  tagText:      { color: C.textMuted, fontSize: fontSize.sm, fontFamily: fontFamily.medium },
  activeTagText:{ color: C.surface, fontFamily: fontFamily.semiBold },

  multilineInput: {
    borderRadius: 12, borderWidth: 1,
    padding: spacing.sm, height: vs(100),
    textAlignVertical: 'top', fontSize: fontSize.sm,
    fontFamily: fontFamily.regular, color: C.text,
  },

  imageSlot: {
    borderRadius: 14, borderWidth: 1.5,
    borderStyle: 'dashed', borderColor: C.border,
    height: vs(110), justifyContent: 'center', alignItems: 'center',
    backgroundColor: C.bgSubtle, gap: 8,
  },
  imageSlotFilled: { borderStyle: 'solid', borderColor: 'transparent', overflow: 'hidden' },
  imagePreview:    { width: '100%', height: '100%', borderRadius: 14 },
  imageSlotLabel:  { color: C.textMuted, fontSize: fontSize.sm, fontFamily: fontFamily.medium },
  imageRemoveBtn:  {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: C.danger, borderRadius: 12,
    width: 26, height: 26, justifyContent: 'center', alignItems: 'center',
  },

  buttonRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  clearBtn: {
    flex: 1, borderWidth: 1.5, borderColor: C.danger,
    padding: 16, borderRadius: 14, alignItems: 'center',
  },
  clearText:  { color: C.danger, fontFamily: fontFamily.semiBold, fontSize: fontSize.base },
  submitBtn:  { flex: 2, backgroundColor: C.primary, padding: 16, borderRadius: 14, alignItems: 'center' },
  submitText: { color: C.surface, fontFamily: fontFamily.extraBold, fontSize: fontSize.base },
});
