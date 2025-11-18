import { Stack } from 'expo-router';
// 1. Importar el hook useTheme
import { useTheme } from '@/src/contexts/ThemeContext';

export default function AdopcionesLayout() {
  // 2. Llamar al hook para obtener los colores dinámicos
  const { colors } = useTheme();

  return (
    // 👇 Oculta el header por defecto del stack de la carpeta adoption
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="historialMedico"
        options={{
          title: 'Historial Médico',
          // 3. Usar los colores del tema
          headerStyle: { backgroundColor: colors.accent },
          headerTintColor: colors.lightText,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="agregarPerrito"
        options={{
          title: 'Agregar Perrito',
          // 3. Usar los colores del tema
          headerStyle: { backgroundColor: colors.accent },
          headerTintColor: colors.lightText,
          headerShown: false,
        }}
      />
    </Stack>
  );
}