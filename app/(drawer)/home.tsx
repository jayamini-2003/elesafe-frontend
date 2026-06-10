// app/(drawer)/home.tsx
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, Modal, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { AppHeaderLogo } from '../../components/AppHeader';
import { theme } from '../../constants/theme';
import { useAlertSocket } from '../../hooks/useAlertSocket';
import { authService } from '../../services/authService';
import { uploadProfilePicture } from '../../services/supabase';
import { fontFamily, fontSize, spacing, vs } from '../../utils/responsive';

function timeAgo(receivedAt: number): string {
  const diff = Math.floor((Date.now() - receivedAt) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
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
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '', village: '', profilePicture: '' });

  const staticAlerts = [
    { id: '1', latitude: 6.9285, longitude: 79.862, title: 'Elephant' },
    { id: '2', latitude: 6.9265, longitude: 79.8605, title: 'Fence Damage' },
    { id: '3', latitude: 6.931, longitude: 79.864, title: 'Elephant Movement' },
  ];

  const { alertHistory, unreadCount } = useAlertSocket();
  const latestLiveAlert = alertHistory[0] ?? null;

  useEffect(() => {
    authService.getStoredUser().then((u) => { if (u) setUser(u); });
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    })();
  }, []);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180, dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning 🌅'; if (h < 17) return 'Good Afternoon ☀️'; return 'Good Evening 👋';
  };

  const openProfile = () => {
    setForm({ firstName: user?.firstName || '', lastName: user?.lastName || '', phoneNumber: user?.phoneNumber || '', village: user?.village || '', profilePicture: user?.profilePicture || '' });
    setEditMode(false); setShowProfile(true);
  };

  const pickAndUploadPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission required', 'Allow gallery access to change photo'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (result.canceled) return;
    try {
      setUploadingPhoto(true);
      const publicUrl = await uploadProfilePicture(user?.userId || user?.email || 'unknown', result.assets[0].uri);
      setForm(f => ({ ...f, profilePicture: publicUrl })); setUser((u: any) => ({ ...u, profilePicture: publicUrl }));
      const updated = await authService.updateProfile({ firstName: form.firstName || user?.firstName || '', lastName: form.lastName || user?.lastName || '', phoneNumber: form.phoneNumber || user?.phoneNumber || '', village: form.village || user?.village || '', profilePicture: publicUrl });
      setUser(updated); setForm(f => ({ ...f, profilePicture: updated.profilePicture || publicUrl }));
      Alert.alert('✅ Photo updated', 'Profile picture changed successfully');
    } catch (err: any) { Alert.alert('Upload failed', err.message || 'Could not upload image'); } finally { setUploadingPhoto(false); }
  };

  const handleSave = async () => {
    try { setSaving(true); const updated = await authService.updateProfile(form); setUser(updated); setEditMode(false); Alert.alert('Saved', 'Profile updated successfully'); }
    catch (error: any) { Alert.alert('Error', error.response?.data?.message || 'Update failed'); } finally { setSaving(false); }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: async () => { await authService.logout(); setShowProfile(false); router.replace('/(auth)/login'); } }]);
  };

  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User';
  const currentPicture = editMode ? form.profilePicture : user?.profilePicture;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <AppHeaderLogo rightIcon="notifications-none" rightBadge={unreadCount} onRightPress={() => router.push('/notifications')} />

      {/* ── Hero Profile Card ── */}
      <Pressable style={styles.heroCard} onPress={openProfile}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {user?.profilePicture ? (
            <Image source={{ uri: user.profilePicture }} style={styles.avatarCircle} key={user.profilePicture} />
          ) : (
            <View style={[styles.avatarCircle, styles.avatarFallback]}>
              <Text style={styles.initialsText}>{(user?.firstName?.[0] || '').toUpperCase()}{(user?.lastName?.[0] || '').toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.onlineDot} />
        </View>

        {/* Info */}
        <View style={styles.heroInfo}>
          <Text style={styles.heroGreeting}>{getGreeting()}</Text>
          <View style={styles.heroNameRow}>
            <Text style={styles.heroName}>{fullName}</Text>
            <MaterialIcons name="chevron-right" size={20} color={C.mist} />
          </View>
          <Text style={styles.heroLocation}>📍 {user?.village || 'Location not set'}</Text>
        </View>

        {/* Status chip */}
        <View style={styles.statusChip}>
          <View style={styles.statusChipDot} />
          <Text style={styles.statusChipText}>Safe</Text>
        </View>
      </Pressable>

      {/* ── Quick Stats row ── */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <MaterialCommunityIcons name="map-marker-radius" size={14} color={C.primary} />
          <Text style={styles.statChipText}>Active Zone</Text>
        </View>
        <View style={[styles.statChip, unreadCount > 0 && styles.statChipAlert]}>
          <MaterialIcons name="notifications-active" size={14} color={unreadCount > 0 ? C.warning : C.primary} />
          <Text style={[styles.statChipText, unreadCount > 0 && { color: C.warning }]}>
            {unreadCount > 0 ? `${unreadCount} Alerts` : 'No Alerts'}
          </Text>
        </View>
        <View style={styles.statChip}>
          <MaterialCommunityIcons name="shield-check" size={14} color={C.primary} />
          <Text style={styles.statChipText}>System Active</Text>
        </View>
      </View>

      {/* ── Report Incident Card ── */}
      <View style={styles.reportCard}>
        <View style={styles.reportCardAccent} />
        <View style={styles.reportCardBody}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Report Incident</Text>
            <View style={styles.warningIconWrap}>
              <MaterialIcons name="warning" size={20} color={C.warning} />
            </View>
          </View>
          <Text style={styles.description}>Spotted an elephant nearby? Report it immediately to protect your community.</Text>
          <Pressable style={styles.reportBtn} onPress={() => router.push('/(drawer)/report')}>
            <MaterialIcons name="camera-alt" size={18} color={C.cream} />
            <Text style={styles.reportBtnText}>REPORT SIGHTING</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Live Map Card ── */}
      <View style={styles.mapCardWrapper}>
        <Pressable style={styles.mapCard} onPress={() => router.push('/(drawer)/map')}>
          {region ? (
            <WebView
              style={{ flex: 1 }}
              scrollEnabled={false}
              pointerEvents="none"
              source={{ html: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><style>*{margin:0;padding:0}html,body,#map{width:100%;height:100%;overflow:hidden}.leaflet-control-zoom,.leaflet-control-attribution{display:none!important}</style></head><body><div id="map"></div><script>var map=L.map('map',{zoomControl:false,attributionControl:false,dragging:false,touchZoom:false,doubleClickZoom:false,scrollWheelZoom:false,keyboard:false}).setView([${region.latitude},${region.longitude}],15);L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:19}).addTo(map);L.circleMarker([${region.latitude},${region.longitude}],{radius:8,color:'#fff',fillColor:'#2D6A4F',fillOpacity:1,weight:2}).addTo(map);</script></body></html>` }}
            />
          ) : (
            <View style={styles.mapPlaceholder}>
              <ActivityIndicator color={C.primary} />
              <Text style={styles.mapPlaceholderText}>Loading map…</Text>
            </View>
          )}
          <View style={styles.mapOverlay}>
            <MaterialCommunityIcons name="map-marker-radius" size={14} color={C.cream} style={{ marginRight: 4 }} />
            <Text style={styles.mapLabel}>Live Map View</Text>
          </View>
          <Pressable style={styles.expandBtn} onPress={() => router.push('/(drawer)/map')}>
            <Text style={styles.expandText}>Expand ↗</Text>
          </Pressable>
        </Pressable>
      </View>

      {/* ── Recent Alerts ── */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          <Pressable onPress={() => router.push('/notifications')}>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </View>
        <Pressable
          style={styles.alertCard}
          onPress={latestLiveAlert ? () => router.push({ pathname: '/alert-detail', params: { alert: JSON.stringify(latestLiveAlert) } }) : undefined}
        >
          <View style={styles.alertCardAccent} />
          <View style={styles.alertIconWrap}>
            <MaterialCommunityIcons name="paw" size={22} color={C.warning} />
          </View>
          <View style={styles.alertContent}>
            {latestLiveAlert ? (
              <>
                <Text style={styles.alertText}>🐘 {latestLiveAlert.village}, {latestLiveAlert.district}</Text>
                <Text style={styles.alertSub}>{timeAgo(latestLiveAlert.receivedAt)} · {latestLiveAlert.numberOfElephants} elephant{latestLiveAlert.numberOfElephants > 1 ? 's' : ''} · {latestLiveAlert.behavior}</Text>
              </>
            ) : (
              <>
                <Text style={styles.alertText}>No recent alerts</Text>
                <Text style={styles.alertSub}>All clear in your area</Text>
              </>
            )}
          </View>
          {latestLiveAlert && (
            <MaterialIcons name="chevron-right" size={20} color={C.mist} />
          )}
        </Pressable>
      </View>

      {/* ── Safety & Community ── */}
      <View style={[styles.section, { marginBottom: 32 }]}>
        <Text style={styles.sectionTitle}>Safety & Community</Text>
        <Pressable style={styles.safetyCard} onPress={() => router.push('/(drawer)/safety')}>
          <View style={styles.safetyIconWrap}>
            <MaterialIcons name="wb-sunny" size={22} color={C.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.safetyTitle}>Night Safety</Text>
            <Text style={styles.safetyText}>Stay indoors and avoid forest edges after dark.</Text>
          </View>
          <MaterialIcons name="chevron-right" size={18} color={C.mist} />
        </Pressable>
      </View>

      {/* ════ PROFILE MODAL ════ */}
      <Modal visible={showProfile} animationType="slide" transparent onRequestClose={() => setShowProfile(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowProfile(false)}>
          <Pressable style={styles.profileCard} onPress={() => { }}>

            <View style={styles.modalHandle} />

            <View style={styles.modalTopBar}>
              <Pressable onPress={() => setShowProfile(false)} style={styles.modalCloseBtn}>
                <MaterialIcons name="close" size={20} color={C.textMuted} />
              </Pressable>
              {editMode ? (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Pressable onPress={() => setEditMode(false)} style={styles.cancelEditBtn}>
                    <Text style={styles.cancelEditText}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={handleSave} disabled={saving} style={styles.saveBtn}>
                    {saving ? <ActivityIndicator size="small" color={C.cream} /> : <Text style={styles.saveBtnText}>Save</Text>}
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={() => setEditMode(true)} style={styles.editBtn}>
                  <MaterialIcons name="edit" size={15} color={C.primary} />
                  <Text style={styles.editBtnText}>Edit Profile</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.avatarWrapper}>
              {currentPicture ? (
                <Image key={currentPicture} source={{ uri: currentPicture }} style={styles.profileAvatar} />
              ) : (
                <View style={[styles.profileAvatar, styles.profileAvatarFallback]}>
                  <Text style={styles.profileInitials}>{(user?.firstName?.[0] || '').toUpperCase()}{(user?.lastName?.[0] || '').toUpperCase()}</Text>
                </View>
              )}
              <Pressable style={styles.cameraBtn} onPress={pickAndUploadPhoto} disabled={uploadingPhoto}>
                {uploadingPhoto ? <ActivityIndicator size="small" color="white" /> : <MaterialIcons name="camera-alt" size={16} color="white" />}
              </Pressable>
            </View>

            <Text style={styles.photoHint}>{uploadingPhoto ? 'Uploading...' : 'Tap camera to change photo'}</Text>
            <Text style={styles.profileModalName}>{fullName}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role?.replace('_', ' ') || 'USER'}</Text>
            </View>
            <View style={styles.divider} />

            <ProfileRow icon="credit-card" label="NIC" value={user?.nic || '—'} editable={false} />
            <ProfileRow icon="email" label="Email" value={user?.email || '—'} editable={false} />
            <ProfileRow icon="person" label="First Name" value={form.firstName} editable={editMode} onChangeText={v => setForm(f => ({ ...f, firstName: v }))} />
            <ProfileRow icon="person-outline" label="Last Name" value={form.lastName} editable={editMode} onChangeText={v => setForm(f => ({ ...f, lastName: v }))} />
            <ProfileRow icon="phone" label="Phone" value={form.phoneNumber} editable={editMode} keyboardType="phone-pad" onChangeText={v => setForm(f => ({ ...f, phoneNumber: v }))} />
            <ProfileRow icon="location-city" label="Village" value={form.village} editable={editMode} onChangeText={v => setForm(f => ({ ...f, village: v }))} />

            <View style={styles.divider} />
            <Pressable style={styles.logoutBtn} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color={C.cream} />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function ProfileRow({ icon, label, value, editable = false, onChangeText, keyboardType = 'default' }:
  { icon: any; label: string; value: string; editable?: boolean; onChangeText?: (v: string) => void; keyboardType?: any }) {
  return (
    <View style={styles.profileRowItem}>
      <View style={[styles.profileRowIcon, editable && { borderColor: theme.colors.primary, borderWidth: 1 }]}>
        <MaterialIcons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.profileRowLabel}>{label}</Text>
        {editable && onChangeText ? (
          <TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType}
            style={styles.profileRowInput} placeholderTextColor={theme.colors.placeholder} autoCapitalize="words" />
        ) : (
          <Text style={styles.profileRowValue}>{value || '—'}</Text>
        )}
      </View>
      {editable && <MaterialIcons name="edit" size={14} color={theme.colors.primaryMist} />}
    </View>
  );
}

const C = theme.colors;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // ── Hero Card ──────────────────────────────────────────────────────────────
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primaryDark,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: 0,
    borderRadius: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: spacing.md,
    paddingVertical: 18,
    ...theme.shadow.strong,
  },
  avatarContainer: { position: 'relative' },
  avatarCircle: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 2, borderColor: C.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarFallback: { backgroundColor: C.primaryDark },
  initialsText: {
    color: C.primaryLight,
    fontSize: fontSize.md,
    fontFamily: fontFamily.bold,
  },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: C.primaryLight,
    borderWidth: 2, borderColor: C.primaryDark,
  },
  heroInfo: { marginLeft: 14, flex: 1 },
  heroGreeting: {
    color: C.primaryLight,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.medium,
    opacity: 0.9,
    marginBottom: 2,
  },
  heroNameRow: { flexDirection: 'row', alignItems: 'center' },
  heroName: {
    color: C.cream,
    fontSize: fontSize.md,
    fontFamily: fontFamily.extraBold,
  },
  heroLocation: {
    color: C.mist,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    marginTop: 3,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(162,186,100,0.18)',
    borderWidth: 1,
    borderColor: C.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
    alignSelf: 'flex-start',
  },
  statusChipDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: C.primaryLight,
  },
  statusChipText: {
    color: C.primaryLight,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semiBold,
  },

  // ── Quick Stats ────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  statChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 6,
    ...theme.shadow.card,
  },
  statChipAlert: {
    borderColor: C.warning,
    backgroundColor: C.warningLight,
  },
  statChipText: {
    color: C.textMuted,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.medium,
  },

  // ── Report Incident Card ───────────────────────────────────────────────────
  reportCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: C.surface,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  reportCardAccent: {
    width: 4,
    backgroundColor: C.primary,
    borderTopLeftRadius: theme.radius.md,
    borderBottomLeftRadius: theme.radius.md,
  },
  reportCardBody: { flex: 1, padding: 15 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: {
    color: C.text,
    fontSize: fontSize.base,
    fontFamily: fontFamily.semiBold,
  },
  warningIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: C.warningLight,
    justifyContent: 'center', alignItems: 'center',
  },
  description: {
    color: C.textMuted,
    marginTop: 8,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    lineHeight: 20,
  },
  reportBtn: {
    marginTop: 14,
    backgroundColor: C.primaryDark,
    paddingVertical: 13,
    borderRadius: 999,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  reportBtnText: {
    color: C.cream,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    letterSpacing: 0.8,
  },

  // ── Live Map ───────────────────────────────────────────────────────────────
  mapCardWrapper: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  mapCard: {
    height: vs(210),
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: C.bgSubtle,
  },
  mapPlaceholder: {
    flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  mapPlaceholderText: {
    color: C.textMuted,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
  },
  mapOverlay: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: 'rgba(6,26,14,0.72)',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapLabel: {
    color: C.cream,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
  },
  expandBtn: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: C.surface,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1, borderColor: C.primary,
  },
  expandText: {
    color: C.primary,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semiBold,
  },
  userDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: C.primary, borderWidth: 2, borderColor: 'white' },
  alertDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: C.danger, borderWidth: 2, borderColor: 'white' },

  // ── Sections ──────────────────────────────────────────────────────────────
  section: { marginTop: spacing.lg, paddingHorizontal: 0 },
  sectionTitle: {
    color: C.text,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.base,
    marginHorizontal: spacing.md,
    marginBottom: 10,
  },
  viewAll: {
    color: C.primary,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    marginHorizontal: spacing.md,
    marginBottom: 10,
  },

  // ── Alert Card ─────────────────────────────────────────────────────────────
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: theme.radius.md,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  alertCardAccent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: C.warning,
    borderTopLeftRadius: theme.radius.md,
    borderBottomLeftRadius: theme.radius.md,
  },
  alertIconWrap: {
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: C.warningLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  alertContent: { flex: 1, paddingVertical: 14, paddingHorizontal: 10 },
  alertText: {
    color: C.text,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semiBold,
  },
  alertSub: {
    color: C.textMuted,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    marginTop: 2,
  },

  // ── Safety Card ───────────────────────────────────────────────────────────
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    padding: 14,
    borderRadius: theme.radius.md,
    marginHorizontal: spacing.md,
    gap: 12,
    ...theme.shadow.card,
  },
  safetyIconWrap: {
    width: 44, height: 44,
    borderRadius: 12,
    backgroundColor: C.bgSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safetyTitle: {
    color: C.text,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
  },
  safetyText: {
    color: C.textMuted,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    marginTop: 2,
  },

  // ── Modal ─────────────────────────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(6,26,14,0.65)',
    justifyContent: 'flex-end',
  },
  profileCard: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCloseBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: C.bgSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: C.bgSubtle,
    borderWidth: 1, borderColor: C.primary,
  },
  editBtnText: {
    color: C.primary,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
  },
  cancelEditBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  cancelEditText: {
    color: C.textMuted,
    fontFamily: fontFamily.semiBold,
  },
  saveBtn: {
    paddingHorizontal: 18, paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: C.primary,
    minWidth: 64,
    alignItems: 'center',
  },
  saveBtnText: {
    color: C.cream,
    fontFamily: fontFamily.bold,
  },
  avatarWrapper: { alignSelf: 'center', marginBottom: 4 },
  profileAvatar: {
    width: 92, height: 92, borderRadius: 46,
    borderWidth: 3, borderColor: C.primary,
  },
  profileAvatarFallback: {
    backgroundColor: C.bgSubtle,
    justifyContent: 'center', alignItems: 'center',
  },
  profileInitials: {
    color: C.primary,
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.bold,
  },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: C.primary,
    width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'white',
  },
  photoHint: {
    color: C.textMuted,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    textAlign: 'center',
    marginBottom: 6,
  },
  profileModalName: {
    color: C.text,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    marginTop: 6,
  },
  roleBadge: {
    alignSelf: 'center',
    backgroundColor: C.bgSubtle,
    borderWidth: 1,
    borderColor: C.primary,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 8,
  },
  roleText: {
    color: C.primary,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semiBold,
  },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 16 },

  // ProfileRow (modal inner rows)
  profileRowItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  profileRowIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: C.bgSubtle,
    justifyContent: 'center', alignItems: 'center',
  },
  profileRowLabel: {
    color: C.textMuted,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    marginBottom: 1,
  },
  profileRowValue: {
    color: C.text,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semiBold,
  },
  profileRowInput: {
    color: C.text,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semiBold,
    borderBottomWidth: 1,
    borderBottomColor: C.primary,
    paddingVertical: 2,
    marginTop: 1,
    minWidth: 160,
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.danger,
    padding: 14,
    borderRadius: theme.radius.sm,
    marginTop: 4,
  },
  logoutText: {
    color: C.cream,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
  },
});
