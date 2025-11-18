import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

const Spinner = () => {
  // 3. Llamar al hook y generar los estilos
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[styles.spinnerCircle, { transform: [{ rotate: spin }] }]}
      />
    </View>
  );
};

// 4. Convertir el StyleSheet en una función que acepte los colores
const getStyles = (colors: ColorsType) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background, // Dinámico
    },
    spinnerCircle: {
      width: 85,
      height: 85,
      borderRadius: 85 / 2,
      borderWidth: 8,
      borderColor: `${colors.primary}55`, // Dinámico (más suave)
      borderTopColor: colors.primary, // Dinámico (color vivo para el efecto)
    },
  });

export default React.memo(Spinner);