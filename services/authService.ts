// services/authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nic: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  gender: 'MALE' | 'FEMALE';
  role: 'USER' | 'WILD_OFFICER';
  address?: string;
  village?: string;
  badgeNumber?: string;
  station?: string;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  village: string;
  address?: string;
  profilePicture?: string;   // ✅ ADD THIS
}

export const authService = {
  async login(payload: LoginPayload) {
    const email = payload.email.trim();
    const password = payload.password;

    // Clear stale session so failed login shows the real API error
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);

    const res = await api.post('/api/auth/login', { email, password });
    const data = res.data;
    await AsyncStorage.setItem('accessToken', data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(data));
    return data;
  },

  async register(payload: RegisterPayload) {
    const res = await api.post('/api/auth/register', payload);
    const data = res.data;
    await AsyncStorage.setItem('accessToken', data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(data));
    return data;
  },

  async logout() {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  },

  async getStoredUser() {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  async updateProfile(payload: UpdateProfilePayload) {
    const res = await api.patch('/api/users/updateMyProfile', payload);
    const updated = res.data;
    const existing = await AsyncStorage.getItem('user');
    const merged = { ...(existing ? JSON.parse(existing) : {}), ...updated };
    await AsyncStorage.setItem('user', JSON.stringify(merged));
    return merged;
  },
};