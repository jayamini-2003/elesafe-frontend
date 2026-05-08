// services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// 👇 Change this to your computer's local IP when running on a device
// Use http://10.0.2.2:8080 for Android emulator
// Use http://localhost:8080 for iOS simulator
// Use http://YOUR_PC_IP:8080 for physical device (e.g. http://192.168.1.5:8080)
export const BASE_URL = 'http://ip:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ✅ Auto-attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) return Promise.reject(error);

      try {
        const res = await axios.post(`${BASE_URL}/api/auth/refresh-token`, {
          refreshToken,
        });
        const newToken = res.data.accessToken;
        await AsyncStorage.setItem('accessToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;