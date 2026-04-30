export type Page =
  | 'LOGIN'
  | 'REGISTER'
  | 'HOME'
  | 'MAP'
  | 'REPORT'
  | 'HISTORY'
  | 'SAFETY';

export interface User {
  name: string;
  role: 'VILLAGER' | 'OFFICER' | 'ADMIN';
  village: string;
  avatar: string;
}

export interface Incident {
  id: string;
  type: 'SIGHTING' | 'DAMAGE';
  subtype?: string;
  location: string;
  timestamp: Date;
  status: 'NEW' | 'RESOLVED';
  description: string;
  severity: 'MINOR' | 'MODERATE' | 'SEVERE';
  isOffline?: boolean;
}