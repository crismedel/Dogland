import { Stack, router, usePathname } from 'expo-router';
import {
  View,
  StyleSheet,
  Platform,
  ActivityIndicator,
  LogBox,
} from 'react-native';
import { useEffect, useState } from 'react';

import { useCustomFonts } from '@/src/constants/fontFamily';
import { Colors } from '@/src/constants/colors';
import { NotificationProvider } from '@/src/components/notifications';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import BottomNavBar from '@/src/components/UI/TabBar';
import { RefreshProvider } from '@/src/contexts/RefreshContext';

// React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Silenciar warning específico de expo-notifications
LogBox.ignoreLogs(['expo-notifications was removed', 'Notifications']);

function AppContent() {
  const fontsLoaded = useCustomFonts();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!fontsLoaded || isLoading) return;

    if (!isAuthenticated) {
      if (pathname !== '/auth' && !pathname?.startsWith('/auth')) {
        router.replace('/auth');
      }
    } else {
      if (pathname === '/auth' || pathname?.startsWith('/auth')) {
        router.replace('/home');
      }
    }
  }, [fontsLoaded, isAuthenticated, isLoading, pathname]);

  if (!fontsLoaded || isLoading) {
    return (
      <View style={[styles.background, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const showTabBar = pathname && !pathname.startsWith('/auth');

  return (
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
        <Stack.Screen name="community_maps" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="create-report" options={{ headerShown: false }} />
        <Stack.Screen name="sightings" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="stats" options={{ headerShown: false }} />
        <Stack.Screen name="users" options={{ headerShown: false }} />
        <Stack.Screen name="management" options={{ headerShown: false }} />
      </Stack>

      {showTabBar && <BottomNavBar />}
    </View>
  );
}

export default function RootLayout() {
  // Crear un solo QueryClient con useState
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RefreshProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </RefreshProvider>
      </AuthProvider>
    </QueryClientProvider>
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
