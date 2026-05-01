import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Image,
  LayoutAnimation,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  View,
} from "react-native";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function SafetyScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const EMERGENCY_NUMBER = "1124"; // 🔥 change if needed

  const handleSOS = async () => {
    const phoneUrl = `tel:${EMERGENCY_NUMBER}`;

    const supported = await Linking.canOpenURL(phoneUrl);

    if (supported) {
      Linking.openURL(phoneUrl);
    } else {
      Alert.alert("Error", "Cannot open dialer");
    }
  };

  const toggle = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === index ? null : index);
  };

  const rules = [
    {
      title: "Maintain Safe Distance (30m+)",
      icon: "straighten",
      desc: "Always keep at least 30 meters away from elephants.",
    },
    {
      title: "Avoid Loud Noises",
      icon: "volume-off",
      desc: "Loud sounds may provoke elephants unexpectedly.",
    },
    {
      title: "No Flash Photography",
      icon: "no-photography",
      desc: "Flash can scare and trigger aggressive behavior.",
    },
    {
      title: "Retreat Slowly - Don't Run",
      icon: "directions-walk",
      desc: "Move back slowly and calmly without sudden actions.",
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#102213" }}>
      
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 20,
          marginTop:25,
        }}
      >
        <Text style={{ color: "white", fontSize: 22, fontWeight: "bold" }}>
          Safety Guidelines
        </Text>

        <Pressable
          onPress={handleSOS}
          style={{
            backgroundColor: "#ef4444",
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <MaterialIcons name="warning" size={16} color="white" />
          <Text style={{ color: "white", fontWeight: "bold" }}>SOS CALL</Text>
        </Pressable>
      </View>

      {/* HERO */}
      <View style={{ marginHorizontal: 20 }}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?q=80&w=1280",
          }}
          style={{
            width: "100%",
            height: 180,
            borderRadius: 16,
          }}
        />

        <View style={{ position: "absolute", bottom: 15, left: 15 }}>
          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
            Staying safe around Wild Elephants
          </Text>
        </View>
      </View>

      {/* RULES */}
      <View style={{ padding: 20 }}>
        {rules.map((rule, index) => (
          <View key={index} style={{ marginBottom: 10 }}>
            <Pressable
              onPress={() => toggle(index)}
              style={{
                backgroundColor: "#1c3020",
                padding: 15,
                borderRadius: 12,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialIcons
                  name={rule.icon as any}
                  size={20}
                  color="#13ec37"
                />
                <Text style={{ color: "white", marginLeft: 10 }}>
                  {rule.title}
                </Text>
              </View>

              <MaterialIcons
                name={
                  openIndex === index
                    ? "keyboard-arrow-up"
                    : "keyboard-arrow-down"
                }
                size={20}
                color="#9ca3af"
              />
            </Pressable>

            {openIndex === index && (
              <View
                style={{
                  backgroundColor: "#16261a",
                  padding: 12,
                  borderRadius: 10,
                  marginTop: 5,
                }}
              >
                <Text style={{ color: "#9ca3af" }}>{rule.desc}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* VISUAL GUIDE */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 30 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
            Visual Guide
          </Text>

          <Text style={{ color: "#13ec37" }}>Full Manual</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          
          {/* DO */}
          <View style={{ flex: 1, backgroundColor: "#1c3020", borderRadius: 12, padding: 10 }}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1502877338535-766e1452684a" }}
              style={{ width: "100%", height: 80, borderRadius: 10 }}
            />

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
              <MaterialIcons name="check-circle" size={18} color="#13ec37" />
              <Text style={{ color: "#13ec37", marginLeft: 5 }}>DO</Text>
            </View>

            <Text style={{ color: "#9ca3af", marginTop: 5 }}>
              Wait quietly for crossing.
            </Text>
          </View>

          {/* DON'T */}
          <View style={{ flex: 1, backgroundColor: "#1c3020", borderRadius: 12, padding: 10 }}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1589652717521-10c0d092dea9" }}
              style={{ width: "100%", height: 80, borderRadius: 10 }}
            />

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
              <MaterialIcons name="cancel" size={18} color="#ef4444" />
              <Text style={{ color: "#ef4444", marginLeft: 5 }}>DON'T</Text>
            </View>

            <Text style={{ color: "#9ca3af", marginTop: 5 }}>
              Attempt to touch or feed.
            </Text>
          </View>

        </View>
      </View>

    </ScrollView>
  );
}