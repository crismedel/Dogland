// app/(alerts)/_layout.tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Todas las pantallas de (avistamientos) van sin header */}
    </Stack>
  );
}
