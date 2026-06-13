// app/report/damage.tsx
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { theme } from "../../constants/theme";
import { router } from "expo-router";
import React, { useState } from "react";
import { uploadReportImage } from '../../services/supabase';
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
import { reportService, DamageType } from "../../services/reportService";
import { fontSize, fontFamily, spacing, vs } from "../../utils/responsive";
import AppHeader from "../../components/AppHeader";
import { AppPicker } from "../../components/AppPicker";
import { fetchCurrentLocation } from "../../utils/locationHelper";

const C = theme.colors;

const SRI_LANKA_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
  "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
  "Mannar", "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
];

export default function DamageReport() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [description, setDescription]     = useState("");
  const [image, setImage]                 = useState<string | null>(null);
  const [locationText, setLocationText]   = useState("Tap GPS to get location");
  const [district, setDistrict]           = useState("");
  const [village, setVillage]             = useState("");
  const [loading, setLoading]             = useState(false);
  const [gpsLoading, setGpsLoading]       = useState(false);
  const [focusedField, setFocusedField]   = useState<string | null>(null);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const getLocation = async () => {
    try {
      setGpsLoading(true);
      const result = await fetchCurrentLocation();
      if (result.district) setDistrict(result.district);
      if (result.village) setVillage(result.village);
      setLocationText(result.locationText);
    } catch (error: any) {
      Alert.alert("GPS Error", error?.message || "Could not get location. Try again.");
    } finally {
      setGpsLoading(false);
    }
  };

  const pickImage = () => {
    Alert.alert("Add Photo", "Choose a source", [
      {
        text: "Camera",
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) { Alert.alert("Permission required", "Allow camera access to take a photo"); return; }
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
          if (!result.canceled) setImage(result.assets[0].uri);
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) { Alert.alert("Permission required", "Allow gallery access to attach a photo"); return; }
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
          if (!result.canceled) setImage(result.assets[0].uri);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const submit = async () => {
    if (!district)               { Alert.alert("Missing Info", "Please select district"); return; }
    if (!village)                { Alert.alert("Missing Info", "Please enter village"); return; }
    if (selectedTypes.length === 0) { Alert.alert("Missing Info", "Please select at least one damage type"); return; }
    try {
      setLoading(true);
      let imageUrl: string | undefined = undefined;
      if (image) imageUrl = await uploadReportImage('damage', image);
      const damageTypeMap: Record<string, DamageType> = {
        "Property Damage":    "PROPERTY",
        "Crop / Field Damage":"CROP",
        "Fence Damage":       "PROPERTY",
        "Vehicle Damage":     "VEHICLE",
      };
      await reportService.submitDamage({
        district, village,
        damageType: damageTypeMap[selectedTypes[0]],
        description, imagePath: imageUrl,
      });
      Alert.alert("Submitted", "Damage report sent successfully");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setSelectedTypes([]); setDescription(""); setImage(null);
    setDistrict(""); setVillage(""); setLocationText("Tap GPS to get location");
  };

  const DAMAGE_TYPES = ["Property Damage", "Crop / Field Damage", "Fence Damage", "Vehicle Damage"];

  const fieldStyle = (field: string) => ({
    borderColor: focusedField === field ? C.primary : C.border,
    backgroundColor: focusedField === field ? C.surface : C.bgSubtle,
  });

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Report Damage"
        subtitle="Property / crop damage"
        mode="back"
        rightIcon="close"
        rightIconColor={C.danger}
        onRightPress={clear}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── LOCATION CARD ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionLabel}>LOCATION</Text>
          </View>

          <View style={styles.pickerRow}>
            <MaterialIcons name="location-pin" size={18} color={district ? C.primary : C.textMuted} />
            <View style={styles.pickerFlex}>
              <AppPicker
                selectedValue={district}
                onValueChange={setDistrict}
                placeholder="Select District"
                filled={!!district}
                items={SRI_LANKA_DISTRICTS.map((d) => ({ label: d, value: d }))}
              />
            </View>
          </View>

          <View style={[styles.inputField, fieldStyle('village'), { marginTop: 10 }]}>
            <MaterialIcons name="location-city" size={18} color={focusedField === 'village' ? C.primary : C.textMuted} />
            <TextInput
              placeholder="Village (e.g. Sigiriya)"
              placeholderTextColor={C.textMuted}
              value={village} onChangeText={setVillage}
              onFocus={() => setFocusedField('village')}
              onBlur={() => setFocusedField(null)}
              style={styles.inputText}
            />
          </View>

          <View style={styles.gpsPill}>
            <MaterialIcons name="my-location" size={15} color={C.primary} />
            <Text style={styles.gpsPillText} numberOfLines={1}>{locationText}</Text>
            <Pressable onPress={getLocation} disabled={gpsLoading} style={styles.gpsBtn}>
              {gpsLoading
                ? <ActivityIndicator size="small" color={C.surface} />
                : <Text style={styles.gpsBtnText}>GPS</Text>}
            </Pressable>
          </View>
        </View>

        {/* ── DAMAGE TYPE CARD ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionLabel}>DAMAGE TYPE</Text>
          </View>

          {DAMAGE_TYPES.map((type) => {
            const selected = selectedTypes.includes(type);
            return (
              <Pressable
                key={type}
                onPress={() => toggleType(type)}
                style={[styles.damageTypeRow, selected && styles.damageTypeRowSelected]}
              >
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  <MaterialIcons
                    name={selected ? "check" : "check-box-outline-blank"}
                    size={selected ? 14 : 20}
                    color={selected ? C.surface : C.border}
                  />
                </View>
                <Text style={[styles.damageTypeText, selected && styles.damageTypeTextSelected]}>
                  {type}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── DESCRIPTION CARD ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionLabel}>DESCRIPTION</Text>
          </View>
          <TextInput
            placeholder="Describe the damage..."
            placeholderTextColor={C.textMuted}
            value={description} onChangeText={setDescription}
            multiline
            onFocus={() => setFocusedField('description')}
            onBlur={() => setFocusedField(null)}
            style={[styles.multilineInput, fieldStyle('description')]}
          />
        </View>

        {/* ── EVIDENCE CARD ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionLabel}>EVIDENCE</Text>
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
                <Text style={styles.imageSlotLabel}>Add Photo</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* ── ACTION BUTTONS ── */}
        <View style={styles.buttonRow}>
          <Pressable onPress={clear} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
          <Pressable onPress={submit} disabled={loading} style={styles.submitBtn}>
            {loading
              ? <ActivityIndicator color={C.surface} />
              : <Text style={styles.submitText}>Submit Report</Text>}
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
    paddingVertical: 5, borderRadius: 12, alignItems: 'center',
  },
  gpsBtnText: { color: C.surface, fontFamily: fontFamily.bold, fontSize: fontSize.xs },

  damageTypeRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 4,
    borderRadius: 12, marginBottom: 4, gap: 12,
  },
  damageTypeRowSelected: {
    backgroundColor: C.bgSubtle,
    paddingHorizontal: 10,
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 6,
    borderWidth: 1.5, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: C.bgSubtle,
  },
  checkboxSelected: { backgroundColor: C.primary, borderColor: C.primary },
  damageTypeText:         { color: C.text, flex: 1, fontSize: fontSize.sm, fontFamily: fontFamily.regular },
  damageTypeTextSelected: { color: C.primary, fontFamily: fontFamily.semiBold },

  multilineInput: {
    borderRadius: 12, borderWidth: 1,
    padding: spacing.sm, height: vs(120),
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
