// app/(tabs)/home.tsx
import {
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useAlertSocket } from "../../hooks/useAlertSocket";
import { authService } from "../../services/authService";
import { uploadProfilePicture } from "../../services/supabase";

function timeAgo(receivedAt: number): string {
  const diff = Math.floor((Date.now() - receivedAt) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Home() {
  const [region, setRegion] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    village: "",
    profilePicture: "",
  });

  const [alerts] = useState([
    { id: "1", latitude: 6.9285, longitude: 79.862, title: "Elephant" },
    { id: "2", latitude: 6.9265, longitude: 79.8605, title: "Fence Damage" },
    { id: "3", latitude: 6.931, longitude: 79.864, title: "Elephant Movement" },
  ]);

  // ── Live WebSocket alerts ──
  const { alertHistory, unreadCount } = useAlertSocket();
  const latestLiveAlert = alertHistory[0] ?? null;

  // ── Load stored user ──
  useEffect(() => {
    authService.getStoredUser().then((u) => {
      if (u) setUser(u);
    });
  }, []);

  // ── Device location ──
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning 🌅";
    if (h < 17) return "Good Afternoon ☀️";
    return "Good Evening 👋";
  };

  // ── Open profile modal ──
  const openProfile = () => {
    setForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: user?.phoneNumber || "",
      village: user?.village || "",
      profilePicture: user?.profilePicture || "",
    });
    setEditMode(false);
    setShowProfile(true);
  };

  // ── Pick image → upload to Supabase → auto-save ──
  const pickAndUploadPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Allow gallery access to change photo");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    try {
      setUploadingPhoto(true);
      const imageUri = result.assets[0].uri;
      const userId = user?.userId || user?.email || "unknown";

      // Upload to Supabase — returns URL with cache-busting timestamp
      const publicUrl = await uploadProfilePicture(userId, imageUri);

      // ✅ Update form state
      setForm((f) => ({ ...f, profilePicture: publicUrl }));

      // ✅ Update user state immediately so avatar refreshes right away
      setUser((u: any) => ({ ...u, profilePicture: publicUrl }));

      // ✅ Auto-save to backend immediately — no need to press Save
      const updated = await authService.updateProfile({
        firstName: form.firstName || user?.firstName || "",
        lastName: form.lastName || user?.lastName || "",
        phoneNumber: form.phoneNumber || user?.phoneNumber || "",
        village: form.village || user?.village || "",
        profilePicture: publicUrl,
      });

      // ✅ Sync final state from backend response
      setUser(updated);
      setForm((f) => ({ ...f, profilePicture: updated.profilePicture || publicUrl }));

      Alert.alert("✅ Photo updated", "Profile picture changed successfully");
    } catch (err: any) {
      Alert.alert("Upload failed", err.message || "Could not upload image");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── Save other profile fields ──
  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await authService.updateProfile(form);
      setUser(updated);
      setEditMode(false);
      Alert.alert("Saved", "Profile updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Logout ──
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await authService.logout();
          setShowProfile(false);
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const fullName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "User";

  // ✅ During edit show form picture, otherwise show saved user picture
  const currentPicture = editMode
    ? form.profilePicture
    : user?.profilePicture;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── APP HEADER ── */}
      <View style={styles.appHeader}>
        <Text style={styles.appName}>EleSafe Lanka</Text>
        <Pressable onPress={() => router.push("/notifications")} style={styles.bellWrap}>
          <MaterialIcons name="notifications-none" size={24} color="white" />
          {unreadCount > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* ── PROFILE ROW ── */}
      <Pressable style={styles.header} onPress={openProfile}>
        <View style={styles.avatarContainer}>
          {user?.profilePicture ? (
            <Image
              source={{ uri: user.profilePicture }}
              style={styles.avatarCircle}
              // ✅ Forces reload — no stale cache
              key={user.profilePicture}
            />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.initialsText}>
                {(user?.firstName?.[0] || "").toUpperCase()}
                {(user?.lastName?.[0] || "").toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.onlineDot} />
        </View>

        <View style={{ marginLeft: 14, flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={styles.name}>{fullName}</Text>
            <MaterialIcons name="chevron-right" size={18} color="#4a6650" />
          </View>
          <Text style={styles.location}>
            📍 {user?.village || "Location not set"}
          </Text>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Current Status: Safe</Text>
          </View>
        </View>
      </Pressable>

      {/* ── REPORT CARD ── */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Report Incident</Text>
          <MaterialIcons name="warning" size={22} color="#ff4d4d" />
        </View>
        <Text style={styles.description}>
          Spotted an elephant? Report it immediately.
        </Text>
        <Pressable
          style={styles.reportBtn}
          onPress={() => router.push("/(tabs)/report")}
        >
          <MaterialIcons name="camera-alt" size={20} color="black" />
          <Text style={styles.reportBtnText}>REPORT SIGHTING</Text>
        </Pressable>
      </View>

      {/* ── LIVE MAP ── */}
      <Pressable
        style={styles.mapCard}
        onPress={() => router.push("/(tabs)/map")}
      >
        {region && (
          <MapView
            style={{ flex: 1 }}
            region={{
              latitude: region.latitude,
              longitude: region.longitude,
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }}>
              <View style={styles.userDot} />
            </Marker>
            {alerts
              .filter((a) => getDistance(region.latitude, region.longitude, a.latitude, a.longitude) < 2)
              .map((alert) => (
                <Marker key={alert.id} coordinate={{ latitude: alert.latitude, longitude: alert.longitude }}>
                  <View style={styles.alertDot} />
                </Marker>
              ))}
          </MapView>
        )}
        <View style={styles.mapOverlay}>
          <Text style={styles.mapLabel}>Live Map View</Text>
        </View>
        <Pressable style={styles.expandBtn} onPress={() => router.push("/(tabs)/map")}>
          <Text style={styles.expandText}>Expand ↗</Text>
        </Pressable>
      </Pressable>

      {/* ── RECENT ALERTS ── */}
      <View style={{ marginTop: 20 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          <Pressable onPress={() => router.push("/notifications")}>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </View>

        {latestLiveAlert ? (
          <Pressable
            style={styles.alertCard}
            onPress={() => router.push({
              pathname: "/alert-detail",
              params: { alert: JSON.stringify(latestLiveAlert) },
            })}
          >
            <MaterialCommunityIcons name="paw" size={22} color="orange" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.alertText}>
                🐘 {latestLiveAlert.village}, {latestLiveAlert.district}
              </Text>
              <Text style={styles.alertSub}>
                {timeAgo(latestLiveAlert.receivedAt)} · {latestLiveAlert.numberOfElephants} elephant{latestLiveAlert.numberOfElephants > 1 ? "s" : ""} · {latestLiveAlert.behavior}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={18} color="#4a6650" />
          </Pressable>
        ) : (
          <View style={styles.alertCard}>
            <MaterialCommunityIcons name="paw" size={22} color="orange" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.alertText}>No recent alerts</Text>
              <Text style={styles.alertSub}>All clear in your area</Text>
            </View>
          </View>
        )}
      </View>

      {/* ── SAFETY ── */}
      <View style={{ marginTop: 20, marginBottom: 30 }}>
        <Text style={styles.sectionTitle}>Safety & Community</Text>
        <Pressable
          style={styles.smallCard}
          onPress={() => router.push("/(tabs)/safety")}
        >
          <MaterialIcons name="wb-sunny" size={22} color="#13ec37" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.smallTitle}>Night Safety</Text>
            <Text style={styles.smallText}>
              Stay indoors and avoid forest edges.
            </Text>
          </View>
        </Pressable>
      </View>

      {/* ════════════════════════════════
            PROFILE MODAL
          ════════════════════════════════ */}
      <Modal
        visible={showProfile}
        animationType="slide"
        transparent
        onRequestClose={() => setShowProfile(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowProfile(false)}
        >
          <Pressable style={styles.profileCard} onPress={() => {}}>

            {/* ── Top bar ── */}
            <View style={styles.modalTopBar}>
              <Pressable onPress={() => setShowProfile(false)}>
                <MaterialIcons name="close" size={22} color="#9ca3af" />
              </Pressable>

              {editMode ? (
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable
                    onPress={() => setEditMode(false)}
                    style={styles.cancelEditBtn}
                  >
                    <Text style={styles.cancelEditText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSave}
                    disabled={saving}
                    style={styles.saveBtn}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="black" />
                    ) : (
                      <Text style={styles.saveBtnText}>Save</Text>
                    )}
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => setEditMode(true)}
                  style={styles.editBtn}
                >
                  <MaterialIcons name="edit" size={15} color="#13ec37" />
                  <Text style={styles.editBtnText}>Edit</Text>
                </Pressable>
              )}
            </View>

            {/* ── Avatar with camera button ── */}
            <View style={styles.avatarWrapper}>
              {currentPicture ? (
                <Image
                  // ✅ key forces React Native to treat new URL as new image
                  key={currentPicture}
                  source={{ uri: currentPicture }}
                  style={styles.profileAvatar}
                />
              ) : (
                <View style={[styles.profileAvatar, styles.profileAvatarFallback]}>
                  <Text style={styles.profileInitials}>
                    {(user?.firstName?.[0] || "").toUpperCase()}
                    {(user?.lastName?.[0] || "").toUpperCase()}
                  </Text>
                </View>
              )}

              {/* Camera button — always visible in modal so user can tap avatar to change */}
              <Pressable
                style={styles.cameraBtn}
                onPress={pickAndUploadPhoto}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <MaterialIcons name="camera-alt" size={16} color="white" />
                )}
              </Pressable>
            </View>

            {/* Upload hint — always shown */}
            <Text style={styles.photoHint}>
              {uploadingPhoto ? "Uploading..." : "Tap camera to change photo"}
            </Text>

            {/* Name + role */}
            <Text style={styles.profileName}>{fullName}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user?.role?.replace("_", " ") || "USER"}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Read-only fields */}
            <ProfileRow
              icon="credit-card"
              label="NIC"
              value={user?.nic || "—"}
              editable={false}
            />
            <ProfileRow
              icon="email"
              label="Email"
              value={user?.email || "—"}
              editable={false}
            />

            {/* Editable fields */}
            <ProfileRow
              icon="person"
              label="First Name"
              value={form.firstName}
              editable={editMode}
              onChangeText={(v) => setForm((f) => ({ ...f, firstName: v }))}
            />
            <ProfileRow
              icon="person-outline"
              label="Last Name"
              value={form.lastName}
              editable={editMode}
              onChangeText={(v) => setForm((f) => ({ ...f, lastName: v }))}
            />
            <ProfileRow
              icon="phone"
              label="Phone"
              value={form.phoneNumber}
              editable={editMode}
              keyboardType="phone-pad"
              onChangeText={(v) => setForm((f) => ({ ...f, phoneNumber: v }))}
            />
            <ProfileRow
              icon="location-city"
              label="Village"
              value={form.village}
              editable={editMode}
              onChangeText={(v) => setForm((f) => ({ ...f, village: v }))}
            />

            <View style={styles.divider} />

            {/* Logout */}
            <Pressable style={styles.logoutBtn} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color="white" />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>

          </Pressable>
        </Pressable>
      </Modal>

    </ScrollView>
  );
}

// ── Reusable profile row ──
function ProfileRow({
  icon, label, value, editable = false, onChangeText, keyboardType = "default",
}: {
  icon: any; label: string; value: string;
  editable?: boolean; onChangeText?: (v: string) => void; keyboardType?: any;
}) {
  return (
    <View style={styles.profileRow}>
      <View style={[
        styles.profileRowIcon,
        editable && { borderColor: "#13ec37", borderWidth: 1 },
      ]}>
        <MaterialIcons name={icon} size={18} color="#13ec37" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.profileRowLabel}>{label}</Text>
        {editable && onChangeText ? (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            style={styles.profileRowInput}
            placeholderTextColor="#6b7280"
            autoCapitalize="words"
          />
        ) : (
          <Text style={styles.profileRowValue}>{value || "—"}</Text>
        )}
      </View>
      {editable && (
        <MaterialIcons name="edit" size={14} color="#4a6650" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#102213", padding: 16 },

  appHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: 35, marginBottom: 10,
  },
  appName: { color: "white", fontSize: 22, fontWeight: "bold" },

  bellWrap: { position: "relative", padding: 4 },
  bellBadge: {
    position: "absolute", top: 0, right: 0,
    backgroundColor: "#ef4444",
    borderRadius: 99, minWidth: 18, height: 18,
    justifyContent: "center", alignItems: "center",
    paddingHorizontal: 3,
    borderWidth: 2, borderColor: "#102213",
  },
  bellBadgeText: { color: "white", fontSize: 9, fontWeight: "800" },

  header: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1c3020", padding: 12,
    borderRadius: 14, marginBottom: 4,
  },

  avatarContainer: { position: "relative" },

  avatarCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "#0d2211", borderWidth: 2, borderColor: "#13ec37",
    justifyContent: "center", alignItems: "center",
  },

  initialsText: { color: "#13ec37", fontSize: 20, fontWeight: "bold" },

  onlineDot: {
    position: "absolute", bottom: 2, right: 2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: "#13ec37", borderWidth: 2, borderColor: "#1c3020",
  },

  name: { color: "white", fontSize: 17, fontWeight: "bold" },
  location: { color: "#9ca3af", fontSize: 12, marginTop: 2 },
  greeting: { color: "#d1fae5", marginTop: 3, fontSize: 13 },

  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#13ec37", marginRight: 5 },
  statusText: { color: "#13ec37", fontSize: 11 },

  card: { marginTop: 16, backgroundColor: "#1c3020", padding: 15, borderRadius: 14 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  cardTitle: { color: "white", fontWeight: "bold" },
  description: { color: "#9ca3af", marginTop: 8 },

  reportBtn: {
    marginTop: 12, backgroundColor: "#13ec37", padding: 12,
    borderRadius: 10, flexDirection: "row",
    justifyContent: "center", alignItems: "center", gap: 8,
  },
  reportBtnText: { color: "black", fontWeight: "bold" },

  mapCard: { marginTop: 16, height: 180, borderRadius: 14, overflow: "hidden" },
  mapOverlay: { position: "absolute", top: 10, left: 10 },
  mapLabel: { color: "white", fontWeight: "bold" },

  expandBtn: {
    position: "absolute", bottom: 10, right: 10,
    backgroundColor: "#1c3020", paddingHorizontal: 10,
    paddingVertical: 6, borderRadius: 10,
    borderWidth: 1, borderColor: "#13ec37",
  },
  expandText: { color: "#13ec37", fontSize: 12 },

  userDot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: "#13ec37", borderWidth: 2, borderColor: "white",
  },
  alertDot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: "#ef4444", borderWidth: 2, borderColor: "white",
  },

  sectionTitle: { color: "white", fontWeight: "bold" },
  viewAll: { color: "#13ec37" },

  alertCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1c3020", padding: 12,
    borderRadius: 12, marginTop: 10,
  },
  alertText: { color: "white" },
  alertSub: { color: "#9ca3af", fontSize: 12 },
  badge: { color: "white", backgroundColor: "#ef4444", padding: 6, borderRadius: 8 },

  smallCard: {
    flexDirection: "row", backgroundColor: "#1c3020",
    padding: 12, borderRadius: 12, marginTop: 10,
  },
  smallTitle: { color: "white" },
  smallText: { color: "#9ca3af", fontSize: 12 },

  // ── Modal ──
  modalBackdrop: {
    flex: 1, backgroundColor: "#000000aa", justifyContent: "flex-end",
  },
  profileCard: {
    backgroundColor: "#1c3020", borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: 24, paddingBottom: 40,
  },
  modalTopBar: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
  },
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: "#0d2211", borderWidth: 1, borderColor: "#13ec37",
  },
  editBtnText: { color: "#13ec37", fontWeight: "bold", fontSize: 13 },
  cancelEditBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: "#6b7280",
  },
  cancelEditText: { color: "#9ca3af", fontWeight: "bold" },
  saveBtn: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8,
    backgroundColor: "#13ec37", minWidth: 60, alignItems: "center",
  },
  saveBtnText: { color: "black", fontWeight: "bold" },

  // ── Avatar in modal ──
  avatarWrapper: { alignSelf: "center", marginBottom: 4 },

  profileAvatar: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: "#13ec37",
  },
  profileAvatarFallback: {
    backgroundColor: "#0d2211",
    justifyContent: "center", alignItems: "center",
  },
  profileInitials: { color: "#13ec37", fontSize: 30, fontWeight: "bold" },

  cameraBtn: {
    position: "absolute", bottom: 0, right: 0,
    backgroundColor: "#13ec37", width: 28, height: 28,
    borderRadius: 14, justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "#1c3020",
  },

  photoHint: {
    color: "#6b7280", fontSize: 11,
    textAlign: "center", marginBottom: 8,
  },

  profileName: {
    color: "white", fontSize: 22, fontWeight: "bold",
    textAlign: "center", marginTop: 6,
  },
  roleBadge: {
    alignSelf: "center", backgroundColor: "#0d2211",
    borderWidth: 1, borderColor: "#13ec37",
    paddingHorizontal: 14, paddingVertical: 4,
    borderRadius: 20, marginTop: 6,
  },
  roleText: { color: "#13ec37", fontSize: 12, fontWeight: "bold" },

  divider: { height: 1, backgroundColor: "#2d4a34", marginVertical: 16 },

  profileRow: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 12 },
  profileRowIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#0d2211", justifyContent: "center", alignItems: "center",
  },
  profileRowLabel: { color: "#6b7280", fontSize: 11, marginBottom: 1 },
  profileRowValue: { color: "white", fontSize: 14, fontWeight: "600" },
  profileRowInput: {
    color: "white", fontSize: 14, fontWeight: "600",
    borderBottomWidth: 1, borderBottomColor: "#13ec37",
    paddingVertical: 2, marginTop: 1, minWidth: 160,
  },

  logoutBtn: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    gap: 8, backgroundColor: "#ef4444",
    padding: 14, borderRadius: 12, marginTop: 4,
  },
  logoutText: { color: "white", fontWeight: "bold", fontSize: 16 },
});