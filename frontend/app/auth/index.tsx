import React from 'react';
import {
  View,
  ImageBackground,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import CustomButton from '@/src/components/UI/CustomButton'; // Ajusta la ruta según tu estructura
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

const { width } = Dimensions.get('window');

export default function Index() {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ImageBackground
        source={require('../../assets/images/golden.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <View style={styles.access}>
          {/* Custom Button */}
          <CustomButton
            title="Acceder"
            onPress={() => router.push('/auth/login')}
            variant="primary"
            icon="log-in-outline"
            style={styles.customButtonStyle}
            textStyle={styles.customButtonText}
          />

          {/* Registration Prompt */}
          <View style={styles.registrationContainer}>
            <AppText
              style={styles.registrationText}
              onPress={() => router.push('/auth/register')}
            >
              No tienes una cuenta?{' '}
              <AppText style={styles.registrationLink}>Regístrate</AppText>
            </AppText>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

// 4. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    backgroundImage: {
      flex: 1,
      width: width,
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)', // Dinámico
    },
    container: {
      flex: 1,
      // El fondo lo da la imagen, no el color
    },
    access: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingBottom: 80,
    },
    customButtonStyle: {
      paddingVertical: 18,
      paddingHorizontal: 50,
      minWidth: 250,
    },
    customButtonText: {
      fontSize: 20,
      fontWeight: fontWeightBold,
      // El color del texto lo debe manejar el CustomButton
      // basado en la variante 'primary'
    },
    registrationContainer: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginTop: 20,
    },
    registrationText: {
      color: colors.text, // Dinámico
      fontSize: 20,
      textAlign: 'center',
      fontWeight: '400',
    },
    registrationLink: {
      color: colors.primary, // Dinámico
      fontWeight: fontWeightMedium,
      textDecorationLine: 'underline',
    },
  });