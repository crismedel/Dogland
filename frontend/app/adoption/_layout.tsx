import { Stack } from 'expo-router';

export default function AdopcionesLayout() {
  return (
    // 👇 Oculta el header por defecto del stack de la carpeta adoption
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="historialMedico"
        options={{
          title: 'Historial Médico',
          headerStyle: { backgroundColor: '#4A90E2' },
          headerTintColor: '#fff',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="agregarPerrito"
        options={{
          title: 'Agregar Perrito',
          headerStyle: { backgroundColor: '#4A90E2' },
          headerTintColor: '#fff',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
