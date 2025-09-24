// app/(alerts)/_layout.tsx
import { Stack } from 'expo-router';

export default function AlertsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Todas las pantallas de (alerts) van sin header */}
    </Stack>
  );
}
