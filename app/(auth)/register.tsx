// app/(auth)/register.tsx
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authService } from "../../services/authService";

export default function RegisterScreen() {
  const [form, setForm] = useState({
    nic: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: "" as string,
    password: "",
    address: "",
    village: "",
    role: "" as string,
    badgeNumber: "",
    station: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password || !form.role || !form.gender) {
      setError("Please fill all required fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload: any = {
        nic: form.nic,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        gender: form.gender,
        password: form.password,
        address: form.address,
        village: form.village,
        // ✅ Map display value to backend enum
        role: form.role === "Wild Officer" ? "WILD_OFFICER" : "USER",
      };

      if (form.role === "Wild Officer") {
        payload.badgeNumber = form.badgeNumber;
        payload.station = form.station;
      }

      // ✅ Uses main project's authService — saves full user object
      await authService.register(payload);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* ── Hero image header ── */}
      <ImageBackground
        source={{
          uri: "https://images.newscientist.com/wp-content/uploads/2020/10/05175158/2-oct_elephant.jpg",
        }}
        style={{ height: 150, justifyContent: "center" }}
        imageStyle={{ opacity: 0.6 }}
      >
        <Text style={styles.title}>EleSafe Lanka</Text>
        <Text style={styles.title}>Create Account</Text>
      </ImageBackground>

      <View style={styles.formContainer}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.label}>NIC</Text>
        <TextInput style={styles.input} placeholder="Enter NIC"
          placeholderTextColor="#888" value={form.nic}
          onChangeText={(v) => handleChange("nic", v)} />

        <Text style={styles.label}>FIRST NAME</Text>
        <TextInput style={styles.input} placeholder="Enter First Name"
          placeholderTextColor="#888" value={form.firstName}
          onChangeText={(v) => handleChange("firstName", v)} />

        <Text style={styles.label}>LAST NAME</Text>
        <TextInput style={styles.input} placeholder="Enter Last Name"
          placeholderTextColor="#888" value={form.lastName}
          onChangeText={(v) => handleChange("lastName", v)} />

        <Text style={styles.label}>EMAIL</Text>
        <TextInput style={styles.input} placeholder="Enter Email"
          placeholderTextColor="#888" value={form.email}
          keyboardType="email-address" autoCapitalize="none"
          onChangeText={(v) => handleChange("email", v)} />

        <Text style={styles.label}>PHONE NUMBER</Text>
        <TextInput style={styles.input} placeholder="Enter Phone Number"
          placeholderTextColor="#888" value={form.phoneNumber}
          keyboardType="phone-pad"
          onChangeText={(v) => handleChange("phoneNumber", v)} />

        <Text style={styles.label}>GENDER</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.gender}
            onValueChange={(v) => handleChange("gender", v)}
            dropdownIconColor="#00ff66"
            style={{ color: "#fff" }}
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="MALE" />
            <Picker.Item label="Female" value="FEMALE" />
          </Picker>
        </View>

        <Text style={styles.label}>PASSWORD</Text>
        <TextInput style={styles.input} placeholder="Enter Password"
          placeholderTextColor="#888" value={form.password}
          secureTextEntry onChangeText={(v) => handleChange("password", v)} />

        <Text style={styles.label}>ADDRESS</Text>
        <TextInput style={styles.input} placeholder="Enter Address"
          placeholderTextColor="#888" value={form.address}
          onChangeText={(v) => handleChange("address", v)} />

        <Text style={styles.label}>VILLAGE</Text>
        <TextInput style={styles.input} placeholder="Enter Village"
          placeholderTextColor="#888" value={form.village}
          onChangeText={(v) => handleChange("village", v)} />

        <Text style={styles.label}>ROLE</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.role}
            onValueChange={(v) => handleChange("role", v)}
            dropdownIconColor="#00ff66"
            style={{ color: "#fff" }}
          >
            <Picker.Item label="Select Role" value="" />
            <Picker.Item label="User" value="USER" />
            <Picker.Item label="Wild Officer" value="Wild Officer" />
          </Picker>
        </View>

        {/* ✅ Wild Officer only fields */}
        {form.role === "Wild Officer" && (
          <>
            <Text style={styles.label}>BADGE NUMBER</Text>
            <TextInput style={styles.input} placeholder="Enter Badge Number"
              placeholderTextColor="#888" value={form.badgeNumber}
              onChangeText={(v) => handleChange("badgeNumber", v)} />

            <Text style={styles.label}>STATION</Text>
            <TextInput style={styles.input} placeholder="Enter Station"
              placeholderTextColor="#888" value={form.station}
              onChangeText={(v) => handleChange("station", v)} />
          </>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>REGISTER</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/(auth)/login")}
          style={{ marginBottom: 60 }}
        >
          <Text style={styles.loginLink}>
            Already have an account?{" "}
            <Text style={{ color: "#00ff66" }}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#021e12" },
  formContainer: { padding: 20 },
  title: {
    fontSize: 22, color: "#f8f3f3",
    textAlign: "center", fontWeight: "bold", marginBottom: 4,
  },
  label: {
    color: "#888", fontSize: 11,
    marginTop: 14, marginBottom: 6, letterSpacing: 1,
  },
  input: {
    backgroundColor: "#0a2f1f", padding: 14,
    borderRadius: 10, color: "#fff",
  },
  pickerContainer: {
    backgroundColor: "#0a2f1f", borderRadius: 10, marginBottom: 4,
  },
  button: {
    backgroundColor: "#00ff66", padding: 15,
    borderRadius: 12, marginTop: 24, marginBottom: 16,
    alignItems: "center",
  },
  buttonText: { textAlign: "center", fontWeight: "bold", fontSize: 15 },
  errorText: { color: "#ff4444", textAlign: "center", margin: 10 },
  loginLink: { color: "#aaa", textAlign: "center", marginBottom: 20 },
});