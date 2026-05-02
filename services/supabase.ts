// services/supabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hnkziqzmydjvtggeapgt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhua3ppcXpteWRqdnRnZ2VhcGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MjEwNTAsImV4cCI6MjA5MzI5NzA1MH0.yrAfLkTZFDTGQxkm44gFuYZrTdVQVJdkE0_Xd79fLhA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export const uploadProfilePicture = async (
  userId: string,
  imageUri: string
): Promise<string> => {
  const uriParts = imageUri.split('.');
  const rawExt = uriParts[uriParts.length - 1].split('?')[0].toLowerCase();
  const fileExt = ['jpg', 'jpeg', 'png', 'webp'].includes(rawExt) ? rawExt : 'jpg';
  const contentType = fileExt === 'jpg' || fileExt === 'jpeg' ? 'image/jpeg' : `image/${fileExt}`;

  const filePath = `avatar_${userId}.${fileExt}`;

  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: filePath,
    type: contentType,
  } as any);

  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/profile_pic/${filePath}`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
      'x-upsert': 'true',
    },
    body: formData,
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Upload failed: ${responseText}`);
  }

  // ✅ Timestamp busts React Native image cache every upload
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/profile_pic/${filePath}?t=${Date.now()}`;

  return publicUrl;
};