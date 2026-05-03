// hooks/useAlertSocket.ts
import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BASE_URL } from '../services/api';

export interface SightingAlert {
  reportId: string;
  reporterId: string;
  district: string;
  village: string;
  latitude?: number;
  longitude?: number;
  numberOfElephants: number;
  behavior: 'CALM' | 'AGGRESSIVE' | 'MOVING' | 'FEEDING';
  additionalNotes?: string;
  dateTime: string;
}

export function useAlertSocket() {
  const [latestAlert, setLatestAlert] = useState<SightingAlert | null>(null);
  const [alertHistory, setAlertHistory] = useState<SightingAlert[]>([]);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('[EleSafe WS] Connected to alert channel');
        client.subscribe('/topic/alerts', (message) => {
          const alert: SightingAlert = JSON.parse(message.body);
          setLatestAlert(alert);
          // Keep last 50 alerts in history
          setAlertHistory((prev) => [alert, ...prev].slice(0, 50));
        });
      },
      onDisconnect: () => console.log('[EleSafe WS] Disconnected'),
      onStompError: (frame) => console.error('[EleSafe WS] Error:', frame),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  const clearLatestAlert = () => setLatestAlert(null);

  return { latestAlert, alertHistory, clearLatestAlert };
}