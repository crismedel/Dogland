import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

interface CustomHeaderProps {
  /** Texto centrado del header */
  title?: string;
  /** Elemento a la izquierda (ej: botón back, icono perfil, etc) */
  leftComponent?: React.ReactNode;
  /** Elemento a la derecha (ej: botón filtros, ajustes, etc) */
  rightComponent?: React.ReactNode;
  /** Estilos adicionales */
  style?: ViewStyle;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  leftComponent,
  rightComponent,
  style,
}) => {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      style={[styles.outerContainer, style]}
    >
      <View style={styles.container}>
        <View style={styles.side}>{leftComponent}</View>
        <AppText style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
        <View style={styles.side}>{rightComponent}</View>
      </View>
    </Animated.View>
  );
};

export default CustomHeader;

// 4. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    outerContainer: {
      marginHorizontal: 10,
      marginTop: 50,
      marginBottom: 16,
      // Sombra exterior para efecto 3D profundo
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.5 : 0.3, // Dinámico
      shadowRadius: 12,
      elevation: 12,
      zIndex: 1,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary, // Dinámico
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 20,
      // Sombra interna para profundidad
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.4 : 0.25, // Dinámico
      shadowRadius: 8,
      elevation: 8,
      // Borde sutil para definición 3D
      borderBottomWidth: 3,
      borderBottomColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)', // Dinámico
      borderTopWidth: 1,
      borderTopColor: isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(255, 255, 255, 0.2)', // Dinámico
    },
    side: {
      width: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      flex: 1,
      fontSize: 20,
      fontWeight: fontWeightBold,
      // 5. Lógica clave: el texto debe ser oscuro en ambos modos
      color: isDark ? colors.lightText : colors.text, // Dinámico
      textAlign: 'center',
      letterSpacing: 0.5,
      // Sombra en el texto para efecto 3D
      textShadowColor: 'rgba(0, 0, 0, 0.2)', // Dinámico (sombra sutil)
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
  });
