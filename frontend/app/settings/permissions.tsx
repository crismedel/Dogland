import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import CustomHeader from '@/src/components/UI/CustomHeader';
import CustomButton from '@/src/components/UI/CustomButton';
import { AppText } from '@/src/components/AppText';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// 1. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

export default function PermissionsScreen() {
  // 2. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Permisos"
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
        <AppText style={styles.cardText}>
          Administra permisos del sistema:
        </AppText>
        <CustomButton
          title="Abrir ajustes del sistema"
          onPress={() => Linking.openSettings()}
          icon="settings-outline"
          style={{ marginTop: 16 }} // Añadir un poco de espacio
        />
        <AppText style={[styles.cardText, { marginTop: 12, fontSize: 14 }]}>
          Si un permiso está bloqueado, debes habilitarlo desde los ajustes del
          dispositivo.
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
    },
  });