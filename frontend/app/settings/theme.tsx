// app/settings/theme.tsx (MODIFICADO)
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import CustomHeader from '@/src/components/UI/CustomHeader';
import CustomButton from '@/src/components/UI/CustomButton';
import { AppText } from '@/src/components/AppText';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

// No necesitas 'system' | 'light' | 'dark' aquí, el hook lo provee

export default function ThemeScreen() {
  // Obtenemos la preferencia actual y la función para cambiarla
  const { themePreference, setThemePreference, colors } = useTheme();

  // Los estilos ahora dependen de los 'colors' del hook
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Tema"
        leftComponent={
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {/* El color del ícono también debe ser dinámico */}
            <Ionicons name="chevron-back" size={24} color={colors.lightText} />
          </TouchableOpacity>
        }
      />
      <View style={styles.card}>
        <AppText style={styles.text}>Selecciona el tema de la app:</AppText>
        <View style={styles.buttonGroup}>
          <CustomButton
            title={`Sistema ${themePreference === 'system' ? '✓' : ''}`}
            onPress={() => setThemePreference('system')}
            icon="phone-portrait-outline"
          />
          <CustomButton
            title={`Claro ${themePreference === 'light' ? '✓' : ''}`}
            onPress={() => setThemePreference('light')}
            icon="sunny-outline"
          />
          <CustomButton
            title={`Oscuro ${themePreference === 'dark' ? '✓' : ''}`}
            onPress={() => setThemePreference('dark')}
            icon="moon-outline"
          />
        </View>
      </View>
    </View>
  );
}

// Convertimos el StyleSheet en una función que acepta colores
const getStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background, // Dinámico
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
    card: {
      backgroundColor: colors.cardBackground, // Dinámico
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.secondary, // Dinámico (o un gris)
    },
    buttonGroup: {
      gap: 12,
    },
    text: {
      color: colors.text, // Dinámico
      marginBottom: 16,
    }
  });