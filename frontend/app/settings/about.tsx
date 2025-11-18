import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { AppText } from '@/src/components/AppText';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// 1. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

function getVersionSafe(): string {
  // Prioridad: app.json/app.config -> manifest
  const v =
    (Constants as any).manifest2?.extra?.expoClient?.version ||
    Constants.expoConfig?.version ||
    (Constants as any).manifest?.version;
  return typeof v === 'string' ? v : '1.0.0';
}

function getRuntimeVersionSafe(): string {
  const rv = Constants.expoConfig?.runtimeVersion;
  if (!rv) return 'unknown';
  if (typeof rv === 'string') return rv;
  // Si es objeto con policy, muéstralo legible
  if (typeof rv === 'object' && 'policy' in rv) {
    return `policy:${rv.policy}`;
  }
  try {
    return JSON.stringify(rv);
  } catch {
    return 'unknown';
  }
}

export default function AboutScreen() {
  // 2. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const version = getVersionSafe();
  const build = getRuntimeVersionSafe();
  const appId =
    Constants.expoConfig?.android?.package ||
    Constants.expoConfig?.ios?.bundleIdentifier ||
    'unknown';

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Acerca de"
        leftComponent={
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {/* 3. Usar colores del tema (texto oscuro sobre fondo amarillo) */}
            <Ionicons
              name="chevron-back"
              size={24}
              color={isDark ? colors.lightText : colors.text}
            />
          </TouchableOpacity>
        }
      />
      <View style={styles.card}>
        <AppText style={styles.cardText}>Versión: {version}</AppText>
        <AppText style={styles.cardText}>Runtime/Build: {build}</AppText>
        <AppText style={styles.cardText}>App ID: {appId}</AppText>
        <AppText style={[styles.cardText, { marginTop: 8 }]}>
          © {new Date().getFullYear()} Dogland
        </AppText>
      </View>
    </View>
  );
}

// 4. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
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
      borderColor: colors.secondary, // Dinámico
    },
    // 5. Añadir estilo para el texto
    cardText: {
      color: colors.text, // Dinámico
      fontSize: 16,
      lineHeight: 22,
      marginBottom: 4,
    },
  });