// app/(auth)/register.tsx
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { authService } from '../../services/authService';

export default function RegisterScreen() {
  const [form, setForm] = useState({
    nic: '', firstName: '', lastName: '',
    email: '', password: '', phoneNumber: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    role: 'USER' as 'USER' | 'WILD_OFFICER',
    village: '', address: '',
    badgeNumber: '', station: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleRegister = async () => {
    try {
      setLoading(true);
      await authService.register(form);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: '#1c3020', color: 'white' as const,
    padding: 14, borderRadius: 10, marginBottom: 12,
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#102213' }} contentContainerStyle={{ padding: 24 }}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 40 }}>
        Create Account
      </Text>

      <TextInput placeholder="NIC" placeholderTextColor="#6b7280" onChangeText={(v) => set('nic', v)} style={inputStyle} />
      <TextInput placeholder="First Name" placeholderTextColor="#6b7280" onChangeText={(v) => set('firstName', v)} style={inputStyle} />
      <TextInput placeholder="Last Name" placeholderTextColor="#6b7280" onChangeText={(v) => set('lastName', v)} style={inputStyle} />
      <TextInput placeholder="Email" placeholderTextColor="#6b7280" onChangeText={(v) => set('email', v)} keyboardType="email-address" autoCapitalize="none" style={inputStyle} />
      <TextInput placeholder="Password" placeholderTextColor="#6b7280" onChangeText={(v) => set('password', v)} secureTextEntry style={inputStyle} />
      <TextInput placeholder="Phone (10 digits)" placeholderTextColor="#6b7280" onChangeText={(v) => set('phoneNumber', v)} keyboardType="phone-pad" style={inputStyle} />
      <TextInput placeholder="Village" placeholderTextColor="#6b7280" onChangeText={(v) => set('village', v)} style={inputStyle} />
      <TextInput placeholder="Address" placeholderTextColor="#6b7280" onChangeText={(v) => set('address', v)} style={inputStyle} />

      {/* Gender toggle */}
      <Text style={{ color: '#9ca3af', marginBottom: 8 }}>Gender</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        {(['MALE', 'FEMALE'] as const).map((g) => (
          <Pressable key={g} onPress={() => set('gender', g)}
            style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: form.gender === g ? '#13ec37' : '#1c3020', alignItems: 'center' }}>
            <Text style={{ color: form.gender === g ? 'black' : '#9ca3af', fontWeight: 'bold' }}>{g}</Text>
          </Pressable>
        ))}
      </View>

      {/* Role toggle */}
      <Text style={{ color: '#9ca3af', marginBottom: 8 }}>Role</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        {(['USER', 'WILD_OFFICER'] as const).map((r) => (
          <Pressable key={r} onPress={() => set('role', r)}
            style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: form.role === r ? '#13ec37' : '#1c3020', alignItems: 'center' }}>
            <Text style={{ color: form.role === r ? 'black' : '#9ca3af', fontWeight: 'bold' }}>{r}</Text>
          </Pressable>
        ))}
      </View>

      {/* Wild Officer extra fields */}
      {form.role === 'WILD_OFFICER' && (
        <>
          <TextInput placeholder="Badge Number" placeholderTextColor="#6b7280" onChangeText={(v) => set('badgeNumber', v)} style={inputStyle} />
          <TextInput placeholder="Station" placeholderTextColor="#6b7280" onChangeText={(v) => set('station', v)} style={inputStyle} />
        </>
      )}

      <Pressable onPress={handleRegister} disabled={loading}
        style={{ backgroundColor: '#13ec37', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 }}>
        {loading ? <ActivityIndicator color="black" /> : (
          <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>Register</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.back()} style={{ marginTop: 15 }}>
        <Text style={{ color: '#9ca3af', textAlign: 'center' }}>
          Already have an account? <Text style={{ color: '#13ec37' }}>Login</Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
}