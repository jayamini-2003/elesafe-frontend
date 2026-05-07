// app/report/sighting.tsx
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
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
import { uploadReportImage } from "../../services/supabase";

export default function SightingReport() {
  const [count, setCount] = useState(1);
  const [behavior, setBehavior] = useState("Walking");
  const [image, setImage] = useState<string | null>(null);
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationText, setLocationText] = useState("Tap GPS to get location");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const getLocation = async () => {
    try {
      setGpsLoading(true);
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission denied", "Enable location services");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      const address = await Location.reverseGeocodeAsync(loc.coords);
      if (address.length > 0) {
        const a = address[0];
        if (a.subregion) setDistrict(a.subregion);
        else if (a.city) setDistrict(a.city);
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

  // ✅ Fixed: permission check was missing — this caused the picker to silently fail
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Allow gallery access to attach a photo");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!res.canceled) {
      setImage(res.assets[0].uri);
    }
  };

  const submit = async () => {
    if (!district || !village) {
      Alert.alert("Missing Info", "Please enter district and village");
      return;
    }
    try {
      setLoading(true);
      let imageUrl: string | undefined = undefined;
      if (image) {
        imageUrl = await uploadReportImage("sighting", image);
      }
      const behaviorMap: Record<string, ElephantBehavior> = {
        Walking: "CALM",
        Eating: "FEEDING",
        Aggressive: "AGGRESSIVE",
        "Crossing Road": "MOVING",
      };
      await reportService.submitSighting({
        district,
        village,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        numberOfElephants: count,
        behavior: behaviorMap[behavior] ?? "CALM",
        additionalNotes: notes,
        imagePath: imageUrl,
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
    setCount(1);
    setBehavior("Walking");
    setImage(null);
    setDistrict("");
    setVillage("");
    setNotes("");
    setLocationText("Tap GPS to get location");
    setCoords(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text style={styles.title}>Report Sighting</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
      </View>

      {/* LOCATION */}
      <Text style={styles.section}>Location</Text>
      <View style={styles.mapBox}>
        {coords ? (
          <MapView
            style={styles.map}
            region={{
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{ latitude: coords.latitude, longitude: coords.longitude }}
              title="Sighting Location"
              description={locationText}
            >
              <View style={styles.redMarker} />
            </Marker>
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <MaterialIcons name="map" size={36} color="#2d4a34" />
            <Text style={styles.mapPlaceholderText}>Tap GPS to show location on map</Text>
          </View>
        )}
      </View>

      <View style={styles.inputRow}>
        <MaterialIcons name="location-pin" size={20} color="#9ca3af" />
        <TextInput
          placeholder="District (e.g. Dambulla)"
          placeholderTextColor="#6b7280"
          value={district}
          onChangeText={setDistrict}
          style={styles.inputText}
        />
      </View>
      <View style={[styles.inputRow, { marginTop: 8 }]}>
        <MaterialIcons name="location-city" size={20} color="#9ca3af" />
        <TextInput
          placeholder="Village (e.g. Sigiriya)"
          placeholderTextColor="#6b7280"
          value={village}
          onChangeText={setVillage}
          style={styles.inputText}
        />
      </View>
      <View style={[styles.inputRow, { marginTop: 8 }]}>
        <MaterialIcons name="my-location" size={20} color="#9ca3af" />
        <Text style={{ color: "#9ca3af", flex: 1, marginLeft: 8, fontSize: 13 }}>{locationText}</Text>
        <Pressable onPress={getLocation} disabled={gpsLoading}>
          {gpsLoading ? (
            <ActivityIndicator size="small" color="#13ec37" />
          ) : (
            <Text style={styles.gpsBadge}>GPS</Text>
          )}
        </Pressable>
      </View>

      {/* ANIMALS */}
      <Text style={styles.section}>The Animals</Text>
      <Text style={styles.label}>HOW MANY ELEPHANTS?</Text>
      <View style={styles.counter}>
        <Pressable onPress={() => setCount(Math.max(1, count - 1))}>
          <Text style={styles.minus}>-</Text>
        </Pressable>
        <Text style={styles.count}>{count}</Text>
        <Pressable onPress={() => setCount(count + 1)}>
          <Text style={styles.plus}>+</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>WHAT ARE THEY DOING?</Text>
      <View style={styles.tags}>
        {["Walking", "Eating", "Aggressive", "Crossing Road"].map((item) => (
          <Pressable
            key={item}
            onPress={() => setBehavior(item)}
            style={[styles.tag, behavior === item && styles.activeTag]}
          >
            <Text style={[styles.tagText, behavior === item && { color: "black" }]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      {/* NOTES */}
      <Text style={styles.section}>Additional Notes</Text>
      <TextInput
        placeholder="Any extra details..."
        placeholderTextColor="#9ca3af"
        value={notes}
        onChangeText={setNotes}
        multiline
        style={styles.notesInput}
      />

      {/* EVIDENCE */}
      <Text style={styles.section}>Evidence</Text>
      <Pressable style={styles.uploadBox} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.preview} />
        ) : (
          <>
            <MaterialIcons name="add-a-photo" size={30} color="#13ec37" />
            <Text style={styles.uploadText}>Tap to upload photo</Text>
          </>
        )}
      </Pressable>

      {/* BUTTONS */}
      <View style={styles.buttonRow}>
        <Pressable style={styles.clearBtn} onPress={clear}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
        <Pressable style={styles.submitBtn} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="black" /> : <Text style={styles.submitText}>Submit</Text>}
        </Pressable>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#102213", padding: 16 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  title: { color: "white", fontSize: 18, fontWeight: "bold" },
  cancel: { color: "#9ca3af" },
  section: { color: "white", fontSize: 16, fontWeight: "bold", marginTop: 20 },
  mapBox: { height: 160, borderRadius: 12, marginTop: 10, overflow: "hidden", backgroundColor: "#1c3020" },
  map: { flex: 1 },
  mapPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  mapPlaceholderText: { color: "#4a6650", fontSize: 13, textAlign: "center", paddingHorizontal: 20 },
  redMarker: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#ef4444", borderWidth: 2.5, borderColor: "white", shadowColor: "#ef4444", shadowOpacity: 0.6, shadowRadius: 4, elevation: 5 },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#1c3020", padding: 12, borderRadius: 10, marginTop: 10 },
  inputText: { color: "white", flex: 1, marginLeft: 8, fontSize: 14 },
  gpsBadge: { color: "#13ec37", fontWeight: "bold", backgroundColor: "#0d2211", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  label: { color: "#9ca3af", fontSize: 12, marginTop: 10 },
  counter: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#1c3020", padding: 12, borderRadius: 10, marginTop: 5, alignItems: "center" },
  minus: { color: "#9ca3af", fontSize: 22 },
  plus: { color: "#13ec37", fontSize: 22 },
  count: { color: "white", fontSize: 20 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  tag: { borderWidth: 1, borderColor: "#6b7280", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  activeTag: { backgroundColor: "#13ec37", borderColor: "#13ec37" },
  tagText: { color: "#9ca3af" },
  notesInput: { backgroundColor: "#1c3020", color: "white", padding: 12, borderRadius: 10, marginTop: 10, height: 90, textAlignVertical: "top", fontSize: 14 },
  uploadBox: { marginTop: 10, borderWidth: 2, borderStyle: "dashed", borderColor: "#13ec37", borderRadius: 12, height: 120, justifyContent: "center", alignItems: "center" },
  uploadText: { color: "#9ca3af", marginTop: 5 },
  preview: { width: "100%", height: "100%", borderRadius: 10 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, marginBottom: 40, gap: 10 },
  submitBtn: { flex: 1, backgroundColor: "#13ec37", padding: 15, borderRadius: 12, alignItems: "center" },
  submitText: { color: "black", fontWeight: "bold" },
  clearBtn: { flex: 1, borderWidth: 1, borderColor: "#ef4444", padding: 15, borderRadius: 12, alignItems: "center" },
  clearText: { color: "#ef4444", fontWeight: "bold" },
});
