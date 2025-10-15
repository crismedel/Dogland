import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Colors } from '@/src/constants/colors';
import Animated, { FadeInDown } from 'react-native-reanimated';

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
  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      style={[styles.outerContainer, style]}
    >
      <View style={styles.container}>
        <View style={styles.side}>{leftComponent}</View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.side}>{rightComponent}</View>
      </View>
    </Animated.View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 10,
    marginTop: 30,
    marginBottom: 16,
    // Sombra exterior para efecto 3D profundo
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    // Sombra interna para profundidad
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    // Borde sutil para definición 3D
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0, 0, 0, 0.2)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  side: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
    // Sombra en el texto para efecto 3D
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
