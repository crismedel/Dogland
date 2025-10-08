// app/adoption/_layout.tsx
import { Stack } from 'expo-router';

export default function AdopcionesLayout() {
  return (
    // 👇 Oculta el header por defecto del stack de la carpeta adoption
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="perfilCan"
        options={{
          title: 'Perfil canino',
          headerStyle: { backgroundColor: '#4A90E2' },
          headerTintColor: '#fff',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="solicitudAdopcion"
        options={{
          title: 'Solicitar Adopción',
          headerStyle: { backgroundColor: '#4A90E2' },
          headerTintColor: '#fff',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="historialMedico"
        options={{
          title: 'Historial Médico',
          headerStyle: { backgroundColor: '#4A90E2' },
          headerTintColor: '#fff',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
