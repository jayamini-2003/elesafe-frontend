// app/(auth)/login.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authService } from "../../services/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // ✅ Uses main project's authService — saves full user object
      await authService.login({ email, password });
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ── Hero image header ── */}
      <ImageBackground
        source={{
          uri: "https://images.newscientist.com/wp-content/uploads/2020/10/05175158/2-oct_elephant.jpg?crop=1:1,smart&width=1200&height=1200&upscale=true",
        }}
        style={styles.header}
        imageStyle={{ opacity: 0.6 }}
      >
        <Text style={styles.title}>EleSafe Lanka</Text>
      </ImageBackground>

      {/* ── Form ── */}
      <View style={styles.form}>
        <Text style={styles.welcome}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to report incidents and track activity.
        </Text>

        {/* Inline error */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.label}>EMAIL</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#aaa" />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>PASSWORD</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#aaa" />
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#aaa"
            secureTextEntry={!passwordVisible}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Ionicons
              name={passwordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={20} color="#000" />
              <Text style={styles.loginText}>LOG IN</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.footer, { padding: 20 }]}>
          Don't have an account?{" "}
          <Text
            style={{ color: "#00ff66" }}
            onPress={() => router.push("/(auth)/register")}
          >
            Register Here
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#021d0f" },
  header: { height: 220, justifyContent: "center", alignItems: "center" },
  title: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  form: { flex: 1, padding: 24 },
  welcome: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  subtitle: { color: "#aaa", marginBottom: 20 },
  label: { color: "#888", fontSize: 12, marginTop: 10, marginBottom: 5, letterSpacing: 1 },
  inputContainer: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#0b2e1a", borderRadius: 10,
    padding: 12, marginBottom: 10,
  },
  input: { flex: 1, color: "#fff", marginLeft: 10 },
  forgot: { color: "#00ff66", textAlign: "right", marginBottom: 20 },
  loginBtn: {
    flexDirection: "row", backgroundColor: "#00ff66",
    padding: 15, borderRadius: 12,
    justifyContent: "center", alignItems: "center", gap: 10,
  },
  loginText: { fontWeight: "bold", color: "#000", fontSize: 15 },
  footer: { color: "#aaa", textAlign: "center", marginTop: 10 },
  errorText: { color: "#ff4444", marginBottom: 10, textAlign: "center" },
});