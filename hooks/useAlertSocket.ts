// hooks/useAlertSocket.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client } from '@stomp/stompjs';
import { useEffect, useState } from 'react';
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
  imagePath?: string;
  dateTime: string;
  receivedAt: number;
}

let _alertHistory: SightingAlert[] = [];
let _latestAlert: SightingAlert | null = null;
let _readIds = new Set<string>();
let _listeners: Array<() => void> = [];

function getUnreadCount(): number {
  return _alertHistory.filter((a) => !_readIds.has(a.reportId)).length;
}

function notifyListeners() {
  _listeners.forEach((fn) => fn());
}

function addAlert(alert: SightingAlert) {
  _latestAlert = alert;
  if (!_alertHistory.find((a) => a.reportId === alert.reportId)) {
    _alertHistory = [alert, ..._alertHistory].slice(0, 50);
  }
  notifyListeners();
}

function removeResolvedReport(reportId: string) {
  _alertHistory = _alertHistory.filter((a) => a.reportId !== reportId);
  if (_latestAlert?.reportId === reportId) {
    _latestAlert = null;
  }
  notifyListeners();
}

let _resolvedListeners: Array<(reportId: string) => void> = [];

export function subscribeReportResolved(listener: (reportId: string) => void) {
  _resolvedListeners.push(listener);
  return () => {
    _resolvedListeners = _resolvedListeners.filter((fn) => fn !== listener);
  };
}

export function isReportActive(status?: string | null): boolean {
  return status !== 'RESOLVED';
}

function clearLatest() {
  _latestAlert = null;
  notifyListeners();
}

export function markOneRead(reportId: string) {
  if (!_readIds.has(reportId)) {
    _readIds.add(reportId);
    notifyListeners();
  }
}

export function markAllRead() {
  _alertHistory.forEach((a) => _readIds.add(a.reportId));
  notifyListeners();
}

function setHistory(alerts: SightingAlert[]) {
  const existingIds = new Set(alerts.map((a) => a.reportId));
  const liveOnly = _alertHistory.filter((a) => !existingIds.has(a.reportId));
  _alertHistory = [...liveOnly, ...alerts].sort((a, b) => b.receivedAt - a.receivedAt);
  notifyListeners();
}

let _stompClient: Client | null = null;
let _stompRefCount = 0;

function ensureConnected() {
  if (_stompClient) return;
  const client = new Client({
    webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('[EleSafe WS] Connected');
      client.subscribe('/topic/alerts', (message) => {
        try {
          const raw = JSON.parse(message.body);
          const alert: SightingAlert = { ...raw, receivedAt: Date.now() };
          addAlert(alert);
        } catch (e) {
          console.warn('[EleSafe WS] Failed to parse alert:', e);
        }
      });
      client.subscribe('/topic/report-resolved', (message) => {
        try {
          const { reportId } = JSON.parse(message.body);
          if (reportId) {
            removeResolvedReport(reportId);
            _resolvedListeners.forEach((fn) => fn(reportId));
          }
        } catch (e) {
          console.warn('[EleSafe WS] Failed to parse resolve event:', e);
        }
      });
    },
    onDisconnect: () => console.log('[EleSafe WS] Disconnected'),
    onStompError: (frame) => console.error('[EleSafe WS] STOMP error:', frame),
  });
  client.activate();
  _stompClient = client;
}

function releaseConnection() {
  _stompRefCount -= 1;
  if (_stompRefCount <= 0 && _stompClient) {
    _stompClient.deactivate();
    _stompClient = null;
    _stompRefCount = 0;
  }
}

let _hasFetchedHistory = false;

const toMs = (raw: any): number => {
  if (!raw) return 0;
  if (Array.isArray(raw)) {
    const [y, mo, d, h = 0, m = 0, s = 0] = raw;
    return new Date(y, mo - 1, d, h, m, s).getTime();
  }
  return new Date(raw).getTime();
};

async function fetchLast24hAlerts() {
  if (_hasFetchedHistory) return;
  _hasFetchedHistory = true;
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const res = await fetch(`${BASE_URL}/api/reports/recent`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data: any[] = await res.json();

    const now = Date.now();
    const cutoff = now - 24 * 60 * 60 * 1000;

    const alerts: SightingAlert[] = data
      .filter((r: any) => r.numberOfElephants !== undefined)
      .filter((r: any) => isReportActive(r.status))
      .map((r: any) => ({
        reportId: r.reportId ?? r.id ?? String(Math.random()),
        reporterId: r.reporterId ?? r.userId ?? '',
        district: r.district ?? '',
        village: r.village ?? '',
        latitude: r.latitude,
        longitude: r.longitude,
        numberOfElephants: r.numberOfElephants ?? 1,
        behavior: r.behavior ?? 'CALM',
        additionalNotes: r.additionalNotes,
        imagePath: r.imagePath,
        dateTime: r.dateTime ?? r.createdAt ?? new Date().toISOString(),
        receivedAt: toMs(r.dateTime ?? r.createdAt) || now,
      }))
      .filter((a) => a.receivedAt >= cutoff)
      .sort((a, b) => b.receivedAt - a.receivedAt);

    setHistory(alerts);
  } catch (e) {
    console.warn('[EleSafe] Could not fetch alert history:', e);
  }
}

export function useAlertSocket() {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1);
    _listeners.push(listener);
    _stompRefCount += 1;
    ensureConnected();
    fetchLast24hAlerts();

    return () => {
      _listeners = _listeners.filter((l) => l !== listener);
      releaseConnection();
    };
  }, []);

  return {
    latestAlert: _latestAlert,
    alertHistory: _alertHistory,
    unreadCount: getUnreadCount(),
    clearLatestAlert: clearLatest,
    markOneRead,
    markAllRead,
  };
}