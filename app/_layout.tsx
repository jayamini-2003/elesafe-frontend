// app/_layout.tsx
import { router, Stack } from 'expo-router';
import { AlertBanner } from '../components/AlertBanner';
import { useAlertSocket } from '../hooks/useAlertSocket';

export default function RootLayout() {
  const { latestAlert, clearLatestAlert } = useAlertSocket();

  const handleAlertPress = () => {
    if (!latestAlert) return;
    // Navigate to detail screen, passing alert as JSON string
    router.push({
      pathname: '/alert-detail',
      params: { alert: JSON.stringify(latestAlert) },
    });
    clearLatestAlert();
  };

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />

      {/* AlertBanner floats above every screen */}
      <AlertBanner
        alert={latestAlert}
        onDismiss={clearLatestAlert}
        onPress={handleAlertPress}
      />
    </>
  );
}
