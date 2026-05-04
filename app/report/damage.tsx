import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function DamageReport() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [locationText, setLocationText] = useState("Get current location");
  const [coords, setCoords] = useState<any>(null);

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  // 📍 Get GPS location
  const getLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission denied", "Enable location services");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});

    const newCoords = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };

    setCoords(newCoords);

    const address = await Location.reverseGeocodeAsync(loc.coords);

    if (address.length > 0) {
      const place = `${address[0].name || ""}, ${address[0].city || ""}`;
      setLocationText(place);
    } else {
      setLocationText("Location found");
    }
  };

  // 📷 Pick image
  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow gallery access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // ✅ Submit
  const submit = () => {
    if (!coords) {
      Alert.alert("Missing location", "Please select a location");
      return;
    }

    Alert.alert("Submitted", "Damage report sent");
    router.back();
  };

  const clear = () => {
    setSelectedTypes([]);
    setDescription("");
    setImage(null);
    setLocationText("Get current location");
    setCoords(null);
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

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* LOCATION */}
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
          Location
        </Text>

        {/* 🗺 MAP */}
        <View
          style={{
            height: 200,
            borderRadius: 12,
            overflow: "hidden",
            marginTop: 10,
          }}
        >
          {coords ? (
            <MapView
              style={{ flex: 1 }}
              region={coords}
              onPress={(e) => {
                const newCoord = e.nativeEvent.coordinate;

                setCoords({
                  ...coords,
                  latitude: newCoord.latitude,
                  longitude: newCoord.longitude,
                });

                setLocationText("Custom selected location");
              }}
            >
              <Marker coordinate={coords} />
            </MapView>
          ) : (
            <View
              style={{
                flex: 1,
                backgroundColor: "#1c3020",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#6b7280" }}>
                Tap GPS to load map
              </Text>
            </View>
          )}
        </View>

        {/* LOCATION TEXT + BUTTON */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#1c3020",
            padding: 12,
            borderRadius: 10,
            marginTop: 10,
          }}
        >
          <MaterialIcons name="location-pin" size={20} color="#9ca3af" />

          <Text style={{ color: "white", flex: 1, marginLeft: 5 }}>
            {locationText}
          </Text>

          <Pressable onPress={getLocation}>
            <Text style={{ color: "#13ec37", fontWeight: "bold" }}>GPS</Text>
          </Pressable>
        </View>

        {/* DAMAGE TYPES */}
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", marginTop: 20 }}>
          What kind of damage?
        </Text>

        {["Property Damage", "Crop / Field Damage", "Fence Damage", "Vehicle Damage"].map((type) => {
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

        {/* DESCRIPTION */}
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", marginTop: 20 }}>
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

        {/* IMAGE */}
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", marginTop: 20 }}>
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
                Tap to upload media
              </Text>
            </>
          )}
        </Pressable>

        {/* BUTTONS */}
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
            }}
          >
            <Text style={{ textAlign: "center", color: "#9ca3af" }}>
              Clear
            </Text>
          </Pressable>

          <Pressable
            onPress={submit}
            style={{
              flex: 1,
              padding: 15,
              borderRadius: 12,
              backgroundColor: "#ef4444",
              marginLeft: 10,
            }}
          >
            <Text style={{ textAlign: "center", color: "white", fontWeight: "bold" }}>
              Submit
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}