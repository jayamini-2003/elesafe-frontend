// app/report/damage.tsx
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import { uploadReportImage } from '../../services/supabase';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { reportService, DamageType } from "../../services/reportService";

export default function DamageReport() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [locationText, setLocationText] = useState("Tap GPS to get location");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const getLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission denied", "Enable location services");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    const address = await Location.reverseGeocodeAsync(loc.coords);

    if (address.length > 0) {
      const a = address[0];
      // Auto-fill district and village from GPS
      if (a.city) setDistrict(a.city);
      if (a.subregion) setDistrict(a.subregion);
      if (a.name || a.district) setVillage(a.name || a.district || "");
      const place = `${a.name || ""}, ${a.city || ""}`.trim().replace(/^,|,$/, "");
      setLocationText(place);
    } else {
      setLocationText("Location found");
    }
  };

  const pickImage = () => {
    Alert.alert(
      "Add Photo",
      "Choose a source",
      [
        {
          text: "Camera",
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              Alert.alert("Permission required", "Allow camera access to take a photo");
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
            });
            if (!result.canceled) {
              setImage(result.assets[0].uri);
            }
          },
        },
        {
          text: "Gallery",
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              Alert.alert("Permission required", "Allow gallery access to attach a photo");
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
            });
            if (!result.canceled) {
              setImage(result.assets[0].uri);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const submit = async () => {
    if (!district) {
      Alert.alert("Missing Info", "Please enter district");
      return;
    }
    if (!village) {
      Alert.alert("Missing Info", "Please enter village");
      return;
    }
    if (selectedTypes.length === 0) {
      Alert.alert("Missing Info", "Please select at least one damage type");
      return;
    }

    try {
      setLoading(true);

      // ✅ Upload image to Supabase first if one was picked
      let imageUrl: string | undefined = undefined;
      if (image) {
        imageUrl = await uploadReportImage('damage', image);
      }

      const damageTypeMap: Record<string, DamageType> = {
        "Property Damage": "PROPERTY",
        "Crop / Field Damage": "CROP",
        "Fence Damage": "PROPERTY",
        "Vehicle Damage": "VEHICLE",
      };

      await reportService.submitDamage({
        district,
        village,
        damageType: damageTypeMap[selectedTypes[0]],
        description,
        // ✅ Pass Supabase URL to backend
        imagePath: imageUrl,
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
    setSelectedTypes([]);
    setDescription("");
    setImage(null);
    setDistrict("");
    setVillage("");
    setLocationText("Tap GPS to get location");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#102213" }}>

      {/* TOP BAR */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 20,
          paddingTop: 40,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={26} color="white" />
        </Pressable>

        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
          Report Damage
        </Text>

        <Pressable onPress={clear}>
          <Text style={{ color: "#6b7280" }}>Cancel</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>

        {/* ── LOCATION SECTION ── */}
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
          Location
        </Text>

        {/* District input */}
        <View style={inputRow}>
          <MaterialIcons name="location-pin" size={20} color="#9ca3af" />
          <TextInput
            placeholder="District (e.g. Dambulla)"
            placeholderTextColor="#6b7280"
            value={district}
            onChangeText={setDistrict}
            style={inputText}
          />
        </View>

        {/* Village input */}
        <View style={[inputRow, { marginTop: 8 }]}>
          <MaterialIcons name="location-city" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Village (e.g. Sigiriya)"
            placeholderTextColor="#6b7280"
            value={village}
            onChangeText={setVillage}
            style={inputText}
          />
        </View>

        {/* GPS auto-fill row */}
        <View style={[inputRow, { marginTop: 8 }]}>
          <MaterialIcons name="my-location" size={20} color="#9ca3af" />
          <Text style={{ color: "#9ca3af", flex: 1, marginLeft: 8, fontSize: 13 }}>
            {locationText}
          </Text>
          <Pressable onPress={getLocation}>
            <Text
              style={{
                color: "#13ec37",
                fontWeight: "bold",
                backgroundColor: "#0d2211",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              GPS
            </Text>
          </Pressable>
        </View>

        {/* ── DAMAGE TYPES SECTION ── */}
        <Text
          style={{
            color: "white",
            fontSize: 18,
            fontWeight: "bold",
            marginTop: 24,
          }}
        >
          What kind of damage?
        </Text>

        {[
          "Property Damage",
          "Crop / Field Damage",
          "Fence Damage",
          "Vehicle Damage",
        ].map((type) => {
          const selected = selectedTypes.includes(type);
          return (
            <Pressable
              key={type}
              onPress={() => toggleType(type)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 15,
                backgroundColor: "#1c3020",
                borderRadius: 12,
                marginTop: 10,
                borderWidth: 1,
                borderColor: selected ? "#13ec37" : "#2d4a34",
              }}
            >
              <MaterialIcons
                name={selected ? "check-box" : "check-box-outline-blank"}
                size={22}
                color={selected ? "#13ec37" : "#6b7280"}
              />
              <Text style={{ color: "white", marginLeft: 10 }}>{type}</Text>
            </Pressable>
          );
        })}

        {/* ── DESCRIPTION SECTION ── */}
        <Text
          style={{
            color: "white",
            fontSize: 18,
            fontWeight: "bold",
            marginTop: 24,
          }}
        >
          Description
        </Text>

        <TextInput
          placeholder="Describe the damage..."
          placeholderTextColor="#6b7280"
          value={description}
          onChangeText={setDescription}
          multiline
          style={{
            backgroundColor: "#1c3020",
            padding: 15,
            borderRadius: 12,
            color: "white",
            height: 120,
            textAlignVertical: "top",
            marginTop: 10,
          }}
        />

        {/* ── EVIDENCE SECTION ── */}
        <Text
          style={{
            color: "white",
            fontSize: 18,
            fontWeight: "bold",
            marginTop: 24,
          }}
        >
          Evidence
        </Text>

        <Pressable
          onPress={pickImage}
          style={{
            borderWidth: 2,
            borderStyle: "dashed",
            borderColor: "#13ec37",
            borderRadius: 15,
            padding: 30,
            marginTop: 10,
            alignItems: "center",
          }}
        >
          {image ? (
            <Image
              source={{ uri: image }}
              style={{ width: "100%", height: 150, borderRadius: 10 }}
            />
          ) : (
            <>
              <MaterialIcons name="add-a-photo" size={30} color="#13ec37" />
              <Text style={{ color: "#9ca3af", marginTop: 10 }}>
                Tap to take photo or upload from gallery
              </Text>
            </>
          )}
        </Pressable>

        {/* ── BUTTONS ── */}
        <View style={{ flexDirection: "row", marginTop: 30 }}>
          <Pressable
            onPress={clear}
            style={{
              flex: 1,
              padding: 15,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#6b7280",
              marginRight: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#9ca3af" }}>Clear</Text>
          </Pressable>

          <Pressable
            onPress={submit}
            disabled={loading}
            style={{
              flex: 1,
              padding: 15,
              borderRadius: 12,
              backgroundColor: "#ef4444",
              marginLeft: 10,
              alignItems: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: "white", fontWeight: "bold" }}>Submit</Text>
            )}
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}

// Shared inline styles for input rows
const inputRow = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  backgroundColor: "#1c3020",
  padding: 12,
  borderRadius: 10,
  marginTop: 10,
};

const inputText = {
  color: "white" as const,
  flex: 1,
  marginLeft: 8,
  fontSize: 14,
};