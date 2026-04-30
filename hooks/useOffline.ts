import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export function useOffline() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state: NetInfoState) => {
      setOnline(state.isConnected ?? false);
    });

    return () => unsub();
  }, []);

  return { online };
}