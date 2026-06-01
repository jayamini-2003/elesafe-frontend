// app/(drawer)/_layout.tsx
// Simple Stack navigator for the drawer screen group.
// All drawer logic (Provider, overlay) lives in app/_layout.tsx.
import { Stack } from "expo-router";

export default function DrawerGroupLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
