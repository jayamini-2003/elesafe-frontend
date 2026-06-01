// app/report/sighting.tsx
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { theme } from "../../constants/theme";
import * as Location from "expo-location";
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
import MapView, { Marker } from "react-native-maps";
import { ElephantBehavior, reportService } from "../../services/reportService";
import { fontSize, fontFamily, spacing, vs } from "../../utils/responsive";
import AppHeader from "../../components/AppHeader";
import { uploadReportImage } from "../../services/supabase";

const C = theme.colors;

const SRI_LANKA_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
  "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
  "Mannar", "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
];

function matchDistrict(value: string): string {
  if (!value) return "";
  const normalized = value.replace(/\s+district$/i, "").trim();
  return SRI_LANKA_DISTRICTS.find((d) => d.toLowerCase() === normalized.toLowerCase()) ?? "";
}

export default function SightingReport() {
  const [count, setCount]               = useState(1);
  const [behavior, setBehavior]         = useState("Walking");
  const [image, setImage]               = useState<string | null>(null);
  const [district, setDistrict]         = useState("");
  const [village, setVillage]           = useState("");
  const [notes, setNotes]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [locationText, setLocationText] = useState("Tap GPS to get location");
  const [gpsLoading, setGpsLoading]     = useState(false);
  const [coords, setCoords]             = useState<{ latitude: number; longitude: number } | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const getLocation = async () => {
    try {
      setGpsLoading(true);
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) { Alert.alert("Permission denied", "Enable location services"); return; }
      const loc = await Location.getCurrentPositionAsync({});
      setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      const address = await Location.reverseGeocodeAsync(loc.coords);
      if (address.length > 0) {
        const a = address[0];
        if (a.subregion) setDistrict(matchDistrict(a.subregion));
        else if (a.city) setDistrict(matchDistrict(a.city));
        if (a.name || a.district) setVillage(a.name || a.district || "");
        const place = `${a.name || ""}, ${a.city || ""}`.trim().replace(/^,|,$/, "");
        setLocationText(place);
      } else {
        setLocationText("Location found");
      }
    } catch {
      Alert.alert("Error", "Could not get location. Try again.");
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
          const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
          if (!res.canceled) setImage(res.assets[0].uri);
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) { Alert.alert("Permission required", "Allow gallery access to attach a photo"); return; }
          const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
          if (!res.canceled) setImage(res.assets[0].uri);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const submit = async () => {
    if (!district || !village) { Alert.alert("Missing Info", "Please select district and enter village"); return; }
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
      Alert.alert("Success", "Sighting Report Submitted");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setCount(1); setBehavior("Walking"); setImage(null);
    setDistrict(""); setVillage(""); setNotes("");
    setLocationText("Tap GPS to get location"); setCoords(null);
  };

  const fieldStyle = (field: string) => ({
    borderColor: focusedField === field ? C.primary : C.border,
    backgroundColor: focusedField === field ? C.surface : C.bgSubtle,
  });

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Report Sighting"
        subtitle="Elephant sighting"
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
            <Text style={styles.sectionLabel}>LOCATION</Text>
          </View>

          <View style={styles.mapBox}>
            {coords ? (
              <MapView
                style={styles.map}
                region={{ latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.008, longitudeDelta: 0.008 }}
                scrollEnabled={false} zoomEnabled={false}
              >
                <Marker coordinate={{ latitude: coords.latitude, longitude: coords.longitude }} title="Sighting Location" description={locationText}>
                  <View style={styles.redMarker} />
                </Marker>
              </MapView>
            ) : (
              <View style={styles.mapPlaceholder}>
                <MaterialIcons name="map" size={36} color={C.border} />
                <Text style={styles.mapPlaceholderText}>Tap GPS to show location on map</Text>
              </View>
            )}
          </View>

          <View style={[styles.pickerField, district ? styles.pickerFieldFilled : null, { marginTop: spacing.sm }]}>
            <MaterialIcons name="location-pin" size={18} color={district ? C.primary : C.textMuted} />
            <Picker
              selectedValue={district}
              onValueChange={setDistrict}
              style={styles.picker}
              dropdownIconColor={C.primary}
            >
              <Picker.Item label="Select District" value="" color={C.textMuted} />
              {SRI_LANKA_DISTRICTS.map((d) => (
                <Picker.Item key={d} label={d} value={d} color={C.text} />
              ))}
            </Picker>
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

        {/* ── ANIMALS CARD ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionLabel}>THE ANIMALS</Text>
          </View>

          <Text style={styles.fieldLabel}>HOW MANY ELEPHANTS?</Text>
          <View style={styles.counter}>
            <Pressable onPress={() => setCount(Math.max(1, count - 1))} style={styles.counterBtn}>
              <Text style={styles.counterMinus}>−</Text>
            </Pressable>
            <Text style={styles.countText}>{count}</Text>
            <Pressable onPress={() => setCount(count + 1)} style={[styles.counterBtn, styles.counterBtnPlus]}>
              <Text style={styles.counterPlus}>+</Text>
            </Pressable>
          </View>

          <Text style={[styles.fieldLabel, { marginTop: spacing.sm }]}>WHAT ARE THEY DOING?</Text>
          <View style={styles.tags}>
            {["Walking", "Eating", "Aggressive", "Crossing Road"].map((item) => (
              <Pressable
                key={item}
                onPress={() => setBehavior(item)}
                style={[styles.tag, behavior === item && styles.activeTag]}
              >
                <Text style={[styles.tagText, behavior === item && styles.activeTagText]}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── NOTES CARD ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionLabel}>ADDITIONAL NOTES</Text>
          </View>
          <TextInput
            placeholder="Any extra details..."
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
          <Pressable style={styles.clearBtn} onPress={clear}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
          <Pressable style={styles.submitBtn} onPress={submit} disabled={loading}>
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

  mapBox: {
    height: vs(160), borderRadius: 12, marginBottom: spacing.sm,
    overflow: 'hidden', backgroundColor: C.bgSubtle,
    borderWidth: 1, borderColor: C.border,
  },
  map: { flex: 1 },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  mapPlaceholderText: {
    color: C.textMuted, fontSize: fontSize.sm, textAlign: 'center',
    paddingHorizontal: 20, fontFamily: fontFamily.regular,
  },
  redMarker: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: C.danger, borderWidth: 2.5, borderColor: 'white',
    shadowColor: C.danger, shadowOpacity: 0.6, shadowRadius: 4, elevation: 5,
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

  pickerField: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, borderWidth: 1,
    borderColor: C.border, backgroundColor: C.bgSubtle,
    paddingLeft: 14, overflow: 'hidden',
  },
  pickerFieldFilled: {
    borderColor: C.primary, backgroundColor: C.surface,
  },
  picker: {
    flex: 1, color: C.text, marginLeft: 6,
  },

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
