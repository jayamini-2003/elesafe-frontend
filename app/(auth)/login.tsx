// app/(auth)/login.tsx
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { authService } from '../../services/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      setLoading(true);
      await authService.login({ email, password });
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#102213', padding: 24, justifyContent: 'center' }}>
      <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 30 }}>
        EleSafe Login
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#6b7280"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ backgroundColor: '#1c3020', color: 'white', padding: 14, borderRadius: 10, marginBottom: 12 }}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#6b7280"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ backgroundColor: '#1c3020', color: 'white', padding: 14, borderRadius: 10, marginBottom: 20 }}
      />

      <Pressable
        onPress={handleLogin}
        disabled={loading}
        style={{ backgroundColor: '#13ec37', padding: 15, borderRadius: 12, alignItems: 'center' }}
      >
        {loading ? (
          <ActivityIndicator color="black" />
        ) : (
          <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>Login</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.push('/(auth)/register')} style={{ marginTop: 15 }}>
        <Text style={{ color: '#9ca3af', textAlign: 'center' }}>
          Don't have an account? <Text style={{ color: '#13ec37' }}>Register</Text>
        </Text>
      </Pressable>
    </View>
  );
}