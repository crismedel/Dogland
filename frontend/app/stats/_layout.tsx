import { Stack } from 'expo-router';

export default function StatsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
