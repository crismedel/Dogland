import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

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
    <Stack>
      {/* Define las pantallas de tu app */}
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen
        name="alerts/index"
        options={{ headerTitle: 'Alertas Comunitarias' }}
      />
    </Stack>
  );
}
