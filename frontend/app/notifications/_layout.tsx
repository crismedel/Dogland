// app/(alerts)/_layout.tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Todas las pantallas de (perfil) van sin header */}
    </Stack>
  );
}
