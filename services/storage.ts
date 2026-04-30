import AsyncStorage from '@react-native-async-storage/async-storage';
import { Incident } from '../types';

const INCIDENTS_KEY = 'incidents';
const QUEUE_KEY = 'offline_queue';

export const storage = {
  async getIncidents(): Promise<Incident[]> {
    const data = await AsyncStorage.getItem(INCIDENTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async saveIncident(incident: Incident) {
    const list = await storage.getIncidents();
    await AsyncStorage.setItem(INCIDENTS_KEY, JSON.stringify([incident, ...list]));
  },

  async getQueue(): Promise<Incident[]> {
    const data = await AsyncStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  },

  async addToQueue(incident: Incident) {
    const q = await storage.getQueue();
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify([incident, ...q]));
  },

  async clearQueue() {
    await AsyncStorage.removeItem(QUEUE_KEY);
  }
};