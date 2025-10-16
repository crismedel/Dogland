import { Stack, router, usePathname } from 'expo-router';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';

import { useCustomFonts } from '@/src/constants/fontFamily';
import { Colors } from '@/src/constants/colors';
import { NotificationProvider } from '@/src/components/notifications/NotificationContext';
import BottomNavBar from '@/src/components/UI/TabBar';

export default function RootLayout() {
  const fontsLoaded = useCustomFonts();
  const pathname = usePathname();

  useEffect(() => {
    if (fontsLoaded) {
      router.replace('/auth');
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={[styles.background, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Mientras las fuentes no estén cargadas, muestra un spinner
  if (!fontsLoaded) {
    return (
      <View style={[styles.background, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const showTabBar = pathname && !pathname.startsWith('/auth');
  return (
    <NotificationProvider>
      <View style={styles.background}>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: 'transparent' },
            animation: Platform.select({ ios: 'default', android: 'fade' }),
          }}
        >
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="alerts" options={{ headerShown: false }} />
          <Stack.Screen name="adoption" options={{ headerShown: false }} />
          <Stack.Screen
            name="community_maps"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="create-report" options={{ headerShown: false }} />
        </Stack>

        {/* Aquí muestras la barra solo si no estás en auth */}
        {showTabBar && <BottomNavBar />}
      </View>
    </NotificationProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
