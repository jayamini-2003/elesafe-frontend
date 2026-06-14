// services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const BASE_URL = 'https://elesafe.onrender.com';

const AUTH_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh-token'];

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = String(originalRequest?.url || '');

    // Login/register 401 must not trigger token refresh (wrong password also returns 401)
    const isAuthRoute = AUTH_PATHS.some((path) => requestUrl.includes(path));
    if (isAuthRoute) {
      return Promise.reject(error);
    }

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
