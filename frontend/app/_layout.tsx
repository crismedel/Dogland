import { Stack, router, usePathname } from 'expo-router';
import { View, StyleSheet, Platform, ActivityIndicator, LogBox } from 'react-native';
import { useEffect } from 'react';

import { useCustomFonts } from '@/src/constants/fontFamily';
import { Colors } from '@/src/constants/colors';
import { NotificationProvider } from '@/src/components/notifications/NotificationContext';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import BottomNavBar from '@/src/components/UI/TabBar';

// Silenciar warning específico de expo-notifications
LogBox.ignoreLogs([
  'expo-notifications was removed',
  'Notifications',
]);

// Componente interno que usa el AuthContext
function AppContent() {
  const fontsLoaded = useCustomFonts();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirigir según autenticación cuando las fuentes estén cargadas
  useEffect(() => {
    if (!fontsLoaded || isLoading) return;

    if (!isAuthenticated) {
      // No autenticado -> ir a /auth
      if (pathname !== '/auth' && !pathname?.startsWith('/auth')) {
        router.replace('/auth');
      }
    } else {
      // Autenticado -> redirigir desde /auth a home
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
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
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
