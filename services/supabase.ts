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

// ── Helper: build FormData from a local file URI ──────────────────────────────
function buildFormData(uri: string, fileName: string): { formData: FormData; contentType: string } {
  const uriParts = uri.split('.');
  const rawExt = uriParts[uriParts.length - 1].split('?')[0].toLowerCase();
  const fileExt = ['jpg', 'jpeg', 'png', 'webp'].includes(rawExt) ? rawExt : 'jpg';
  const contentType = fileExt === 'jpg' || fileExt === 'jpeg' ? 'image/jpeg' : `image/${fileExt}`;

  const formData = new FormData();
  formData.append('file', { uri, name: `${fileName}.${fileExt}`, type: contentType } as any);
  return { formData, contentType };
}

// ── Profile picture upload ────────────────────────────────────────────────────
// Uses PUT with x-upsert so existing avatar is always overwritten cleanly.
// A timestamp query param is appended to bust the CDN cache on read.
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
  formData.append('file', { uri: imageUri, name: filePath, type: contentType } as any);

  // ✅ Use PUT (not POST) — required by Supabase when x-upsert is true
  //    POST creates a new object and fails if the path already exists,
  //    even with x-upsert. PUT always upserts correctly.
  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/profile_pic/${filePath}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
        'x-upsert': 'true',
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Profile picture upload failed: ${errText}`);
  }

  // ✅ Cache-bust so the new image shows immediately (Supabase CDN caches aggressively)
  return `${SUPABASE_URL}/storage/v1/object/public/profile_pic/${filePath}?t=${Date.now()}`;
};

// ── Report evidence image upload ──────────────────────────────────────────────
// Uses POST with a unique timestamped filename — every report gets its own file.
export const uploadReportImage = async (
  reportType: 'sighting' | 'damage',
  imageUri: string
): Promise<string> => {
  const uriParts = imageUri.split('.');
  const rawExt = uriParts[uriParts.length - 1].split('?')[0].toLowerCase();
  const fileExt = ['jpg', 'jpeg', 'png', 'webp'].includes(rawExt) ? rawExt : 'jpg';
  const contentType = fileExt === 'jpg' || fileExt === 'jpeg' ? 'image/jpeg' : `image/${fileExt}`;
  const fileName = `${reportType}_${Date.now()}.${fileExt}`;

  const formData = new FormData();
  formData.append('file', { uri: imageUri, name: fileName, type: contentType } as any);

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/report_images/${fileName}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
        'x-upsert': 'true',
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Report image upload failed: ${errText}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/report_images/${fileName}`;
};