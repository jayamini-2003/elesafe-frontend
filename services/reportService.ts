// services/reportService.ts
import api from './api';

export type ElephantBehavior = 'CALM' | 'AGGRESSIVE' | 'MOVING' | 'FEEDING';
export type DamageType = 'CROP' | 'PROPERTY' | 'VEHICLE' | 'HUMAN_INJURY';

export interface SightingPayload {
  district: string;
  village: string;
  latitude?: number;
  longitude?: number;
  numberOfElephants: number;
  behavior: ElephantBehavior;
  additionalNotes?: string;
  // ✅ ADD THIS
  imagePath?: string;
}

export interface DamagePayload {
  district: string;
  village: string;
  damageType: DamageType;
  description: string;
  // already existed
  imagePath?: string;
}

export const reportService = {
  async submitSighting(payload: SightingPayload) {
    const res = await api.post('/api/reports/sighting', payload);
    return res.data;
  },

  async submitDamage(payload: DamagePayload) {
    const res = await api.post('/api/reports/damage', payload);
    return res.data;
  },

  async getMyReports() {
    const res = await api.get('/api/reports/my-reports');
    return res.data;
  },

  async deleteReport(reportId: string) {
    const res = await api.delete(`/api/reports/${reportId}`);
    return res.data;
  },

  async getRecentReports() {
    const res = await api.get('/api/reports/recent');
    return res.data;
  },
};