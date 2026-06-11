// app/(auth)/register.tsx
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/authService';
import { theme } from '../../constants/theme';
import { fontFamily, fontSize, spacing, vs } from '../../utils/responsive';

const C = theme.colors;

const SRI_LANKA_DISTRICTS = [
  'Ampara','Anuradhapura','Badulla','Batticaloa','Colombo','Galle','Gampaha',
  'Hambantota','Jaffna','Kalutara','Kandy','Kegalle','Kilinochchi','Kurunegala',
  'Mannar','Matale','Matara','Moneragala','Mullaitivu','Nuwara Eliya',
  'Polonnaruwa','Puttalam','Ratnapura','Trincomalee','Vavuniya',
];

function InputField({
  label, icon, placeholder, value, onChangeText,
  keyboard = 'default', caps = 'sentences', secure = false,
}: {
  label: string; icon: string; placeholder: string; value: string;
  onChangeText: (v: string) => void; keyboard?: any; caps?: any; secure?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={iStyles.wrap}>
      <Text style={iStyles.label}>{label}</Text>
      <View style={[iStyles.row, focused && iStyles.rowFocused]}>
        <Ionicons name={icon as any} size={18} color={focused ? C.primary : C.placeholder} />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={C.placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboard}
          autoCapitalize={caps}
          secureTextEntry={secure}
          style={iStyles.input}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
}

const iStyles = StyleSheet.create({
  wrap:  { marginBottom: spacing.sm },
  label: { color: C.textMuted, fontSize: fontSize.xs, fontFamily: fontFamily.semiBold, letterSpacing: 0.8, marginBottom: 5, textTransform: 'uppercase' },
  row:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F9F7', borderRadius: theme.radius.md, paddingHorizontal: spacing.md, paddingVertical: vs(13), borderWidth: 1.5, borderColor: '#E8EEE8', gap: 10 },
  rowFocused: { borderColor: C.primary, backgroundColor: '#F0F8F2' },
  input: { flex: 1, color: C.text, fontSize: fontSize.base, fontFamily: fontFamily.regular },
});

function PickerField({ label, value, onValueChange, items }: {
  label: string; value: string; onValueChange: (v: string) => void;
  items: { label: string; value: string }[];
}) {
  return (
    <View style={pStyles.wrap}>
      <Text style={pStyles.label}>{label}</Text>
      <View style={pStyles.pickerWrap}>
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={pStyles.picker}
          dropdownIconColor={C.primary}
          mode={Platform.OS === 'android' ? 'dropdown' : undefined}
          itemStyle={Platform.OS === 'ios' ? { color: '#000000', fontSize: fontSize.base } : undefined}
        >
          <Picker.Item label={`Select ${label}`} value="" color="#000000" />
          {items.map(i => <Picker.Item key={i.value} label={i.label} value={i.value} color="#000000" />)}
        </Picker>
      </View>
    </View>
  );
}

const pStyles = StyleSheet.create({
  wrap:       { marginBottom: spacing.sm },
  label:      { color: C.textMuted, fontSize: fontSize.xs, fontFamily: fontFamily.semiBold, letterSpacing: 0.8, marginBottom: 5, textTransform: 'uppercase' },
  pickerWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: '#E8EEE8',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.sm,
  },
  picker: {
    color: '#000000',
    backgroundColor: '#FFFFFF',
    fontSize: fontSize.base,
    width: '100%',
    ...(Platform.OS === 'android'
      ? { height: 52, marginVertical: -6 }
      : { height: 48 }),
  },
});

export default function RegisterScreen() {
  const [form, setForm] = useState({
    nic: '', firstName: '', lastName: '', email: '',
    phoneNumber: '', gender: '' as string, password: '',
    address: '', village: '', district: '' as string,
    role: '' as string, badgeNumber: '', station: '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.email || !form.password || !form.role || !form.gender) {
      setError('Please fill all required fields'); return;
    }
    if (!form.district) { setError('Please select your district'); return; }
    setLoading(true); setError('');
    try {
      const payload: any = {
        nic: form.nic, firstName: form.firstName, lastName: form.lastName,
        email: form.email, phoneNumber: form.phoneNumber, gender: form.gender,
        password: form.password, address: form.address, village: form.village,
        district: form.district,
        role: form.role === 'Wild Officer' ? 'WILD_OFFICER' : 'USER',
      };
      if (form.role === 'Wild Officer') {
        payload.badgeNumber = form.badgeNumber;
        payload.station     = form.station;
      }
      await authService.register(payload);
      router.replace('/(drawer)/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.heroBg}>

        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
        <View style={[styles.circle, styles.circle4]} />

        {/* Brand strip */}
        <View style={styles.brandBlock}>
          <View style={styles.brandIconCircle}>
            <MaterialCommunityIcons name="elephant" size={32} color={C.sage} />
          </View>
          <Text style={styles.brandName}>EleSafe Lanka</Text>
          <Text style={styles.brandSub}>Create Your Account</Text>
        </View>

        {/* Form card */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>

            <View style={styles.cardHandle} />

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={C.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Personal info section */}
            <Text style={styles.sectionHeading}>Personal Info</Text>

            <InputField label="NIC"          icon="card-outline"          placeholder="National ID"      value={form.nic}         onChangeText={v => set('nic', v)} />
            <InputField label="First Name"   icon="person-outline"        placeholder="First name"       value={form.firstName}   onChangeText={v => set('firstName', v)} />
            <InputField label="Last Name"    icon="person-outline"        placeholder="Last name"        value={form.lastName}    onChangeText={v => set('lastName', v)} />
            <InputField label="Email"        icon="mail-outline"          placeholder="Email address"    value={form.email}       onChangeText={v => set('email', v)}       keyboard="email-address" caps="none" />
            <InputField label="Phone"        icon="call-outline"          placeholder="Phone number"     value={form.phoneNumber} onChangeText={v => set('phoneNumber', v)} keyboard="phone-pad" />
            <InputField label="Password"     icon="lock-closed-outline"   placeholder="Create password"  value={form.password}    onChangeText={v => set('password', v)}    secure />
            <InputField label="Address"      icon="home-outline"          placeholder="Your address"     value={form.address}     onChangeText={v => set('address', v)} />
            <InputField label="Village"      icon="location-outline"      placeholder="Your village"     value={form.village}     onChangeText={v => set('village', v)} />

            <Text style={styles.sectionHeading}>Location & Role</Text>

            <PickerField label="Gender"   value={form.gender}   onValueChange={v => set('gender', v)}
              items={[{ label: 'Male', value: 'MALE' }, { label: 'Female', value: 'FEMALE' }, { label: 'Other', value: 'OTHER' }]} />
            <PickerField label="District" value={form.district} onValueChange={v => set('district', v)}
              items={SRI_LANKA_DISTRICTS.map(d => ({ label: d, value: d }))} />
            <PickerField label="Role"     value={form.role}     onValueChange={v => set('role', v)}
              items={[{ label: 'User', value: 'User' }, { label: 'Wild Officer', value: 'Wild Officer' }]} />

            {form.role === 'Wild Officer' && (
              <>
                <Text style={styles.sectionHeading}>Officer Details</Text>
                <InputField label="Badge Number" icon="shield-outline"   placeholder="Badge number" value={form.badgeNumber} onChangeText={v => set('badgeNumber', v)} />
                <InputField label="Station"      icon="business-outline" placeholder="Station name" value={form.station}     onChangeText={v => set('station', v)} />
              </>
            )}

            <Pressable
              style={({ pressed }) => [styles.submitBtn, pressed && styles.submitBtnPressed]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitText}>Create Account</Text>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                </>
              )}
            </Pressable>

            <Pressable style={styles.loginLink} onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginLinkText}>
                Already have an account?  <Text style={styles.loginLinkBold}>Sign In</Text>
              </Text>
            </Pressable>

          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.primaryDark },
  heroBg: { flex: 1, backgroundColor: C.primaryDark },

  circle: { position: 'absolute', borderRadius: 999 },
  circle1: { width: 260, height: 260, top: -80,  left: -70,  backgroundColor: C.primary, opacity: 0.35 },
  circle2: { width: 180, height: 180, top: 40,   right: -50, backgroundColor: C.sage,    opacity: 0.18 },
  circle3: { width: 120, height: 120, top: 160,  left: 30,   backgroundColor: C.sage,    opacity: 0.12 },
  circle4: { width: 70,  height: 70,  top: 20,   right: 60,  backgroundColor: C.primary, opacity: 0.22 },

  brandBlock: {
    alignItems: 'center',
    paddingTop: vs(60),
    paddingBottom: vs(14),
  },
  brandIconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(162,186,100,0.20)',
    borderWidth: 2, borderColor: C.sage + '88',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.xs,
  },
  brandName: {
    color: '#fff', fontSize: fontSize.xl,
    fontFamily: fontFamily.extraBold, letterSpacing: 0.5,
  },
  brandSub: {
    color: C.mist, fontSize: fontSize.xs,
    fontFamily: fontFamily.medium, marginTop: 3,
    letterSpacing: 1.2, textTransform: 'uppercase',
  },

  scrollContent: { flexGrow: 1, justifyContent: 'flex-end' },

  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: spacing.xl, paddingBottom: vs(48),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 16,
  },
  cardHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center', marginBottom: spacing.lg,
  },

  sectionHeading: {
    color: C.primaryDark, fontSize: fontSize.sm,
    fontFamily: fontFamily.bold,
    marginTop: spacing.md, marginBottom: spacing.sm,
    paddingBottom: 6,
    borderBottomWidth: 2, borderBottomColor: C.sage + '55',
  },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.dangerLight, borderRadius: 10,
    padding: 10, marginBottom: spacing.md,
    borderLeftWidth: 3, borderLeftColor: C.danger,
  },
  errorText: { color: C.danger, fontSize: fontSize.xs, fontFamily: fontFamily.medium, flex: 1 },

  submitBtn: {
    flexDirection: 'row',
    backgroundColor: C.primaryDark,
    paddingVertical: vs(16), borderRadius: theme.radius.full,
    justifyContent: 'center', alignItems: 'center',
    gap: 10, marginTop: spacing.lg,
    shadowColor: C.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  submitBtnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  submitText: {
    color: '#fff', fontFamily: fontFamily.bold,
    fontSize: fontSize.base, letterSpacing: 0.5,
  },

  loginLink: { alignItems: 'center', paddingVertical: spacing.md },
  loginLinkText: { color: C.textMuted, fontSize: fontSize.sm, fontFamily: fontFamily.regular },
  loginLinkBold: { color: C.primary, fontFamily: fontFamily.bold },
});
