import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function SightingReport() {
  const [count, setCount] = useState(1);
  const [behavior, setBehavior] = useState("Walking");
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!res.canceled) {
      setImage(res.assets[0].uri);
    }
  };

  const submit = () => {
    Alert.alert("Success", "Sighting Report Submitted");
    router.back();
  };

  const clear = () => {
    setCount(1);
    setBehavior("Walking");
    setImage(null);
  };

  return (
    <View style={styles.container}>

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
        <View style={styles.mapDot} />

        <Pressable style={styles.gpsBtn}>
          <MaterialIcons name="my-location" size={18} color="white" />
        </Pressable>
      </View>

      <View style={styles.addressBox}>
        <MaterialIcons name="location-pin" size={18} color="#9ca3af" />
        <Text style={styles.address}>Sigiriya Rd, Dambulla</Text>
        <Text style={styles.gpsBadge}>GPS</Text>
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
            style={[
              styles.tag,
              behavior === item && styles.activeTag,
            ]}
          >
            <Text
              style={[
                styles.tagText,
                behavior === item && { color: "black" },
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* EVIDENCE */}
      <Text style={styles.section}>Evidence</Text>

      <Pressable style={styles.uploadBox} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.preview} />
        ) : (
          <>
            <MaterialIcons name="add-a-photo" size={30} color="#13ec37" />
            <Text style={styles.uploadText}>Tap to upload media</Text>
          </>
        )}
      </Pressable>

      {/* BUTTONS */}
      <View style={styles.buttonRow}>
        <Pressable style={styles.clearBtn} onPress={clear}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>

        <Pressable style={styles.submitBtn} onPress={submit}>
          <Text style={styles.submitText}>Submit</Text>
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#102213",
    padding: 16,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  cancel: {
    color: "#9ca3af",
  },

  section: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
  },

  mapBox: {
    height: 140,
    backgroundColor: "#1c3020",
    borderRadius: 12,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  mapDot: {
    width: 12,
    height: 12,
    backgroundColor: "#13ec37",
    borderRadius: 6,
  },

  gpsBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#1c3020",
    padding: 8,
    borderRadius: 20,
  },

  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c3020",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },

  address: {
    color: "white",
    marginLeft: 5,
    flex: 1,
  },

  gpsBadge: {
    backgroundColor: "#13ec37",
    color: "black",
    paddingHorizontal: 6,
    borderRadius: 6,
    fontSize: 12,
  },

  label: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 10,
  },

  counter: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1c3020",
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
    alignItems: "center",
  },

  minus: {
    color: "#9ca3af",
    fontSize: 22,
  },

  plus: {
    color: "#13ec37",
    fontSize: 22,
  },

  count: {
    color: "white",
    fontSize: 20,
  },

  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },

  tag: {
    borderWidth: 1,
    borderColor: "#6b7280",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  activeTag: {
    backgroundColor: "#13ec37",
    borderColor: "#13ec37",
  },

  tagText: {
    color: "#9ca3af",
  },

  uploadBox: {
    marginTop: 10,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#13ec37",
    borderRadius: 12,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },

  uploadText: {
    color: "#9ca3af",
    marginTop: 5,
  },

  preview: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },

  submitBtn: {
    flex: 1,
    backgroundColor: "#13ec37",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  submitText: {
    color: "black",
    fontWeight: "bold",
  },

  clearBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ef4444",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  clearText: {
    color: "#ef4444",
    fontWeight: "bold",
  },
});