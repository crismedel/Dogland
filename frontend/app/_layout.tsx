import { Stack, useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { Colors } from '@/src/constants/colors';

export default function RootLayout() {
  const router = useRouter();
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
  return (
    <View style={styles.background}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: 'transparent' }, // 👈 evita sobreescribir el color
        }}
      >
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="alerts" options={{ headerShown: false }} />
        <Stack.Screen name="adoption" options={{ headerShown: false }} />
        <Stack.Screen name="community_maps" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
