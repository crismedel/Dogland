import { Stack, useRouter, usePathname } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { Colors } from '@/src/constants/colors';
import { NotificationProvider } from '@/src/components/notifications/NotificationContext';
import BottomNavBar from '@/src/components/UI/TabBar';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Marca el componente como listo una vez que ha terminado de montar
    setIsReady(true);
  }, []);

  useEffect(() => {
    // Realiza la redirección solo después de que el layout esté listo
    if (isReady) {
      router.replace('/auth');
    }
  }, [isReady]);

  const showTabBar = pathname && !pathname.startsWith('/auth');

  return (
    <NotificationProvider>
      <View style={styles.background}>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: 'transparent' },
            // iOS slide por defecto para pushes internos
            animation: Platform.select({ ios: 'default', android: 'fade' }),
          }}
        >
          <Stack.Screen name="auth" options={{ headerShown: false }} />

          {/* Secciones principales sin header */}
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
});
