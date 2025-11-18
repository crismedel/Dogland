import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import apiClient from '@/src/api/client';
import {
  AppText,
  fontWeightMedium,
  fontWeightSemiBold,
  fontWeightBold, // Importar fontWeightBold
} from '@/src/components/AppText';
import { useNotification } from '@/src/components/notifications';
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import { isAxiosError } from 'axios';
import { router } from 'expo-router';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

const { width } = Dimensions.get('window');

export default function Index() {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [loading, setLoading] = useState(false);
  const { showError, showSuccess, showWarning } = useNotification();

  // 🔹 Estado para manejar los valores del formulario
  const [formValues, setFormValues] = useState({
    email: '',
  });

  // 🔹 Definición de los campos del formulario
  const fields: FormField[] = [
    {
      name: 'email',
      label: 'Correo',
      placeholder: 'Ingresa tu correo',
      keyboardType: 'email-address',
      autoCapitalize: 'none',
      icon: 'mail-outline',
      type: 'email',
    },
  ];

  // 🔹 Manejador de cambio de valor
  const handleValueChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Acción al enviar formulario
  const handleSubmit = async () => {
    const { email } = formValues;

    if (!email) {
      showWarning('Atención', 'Por favor, ingresa tu correo electrónico.');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/auth/forgot-password', { email });

      showSuccess(
        'Correo enviado',
        'Si el correo existe, recibirás las instrucciones para restablecer tu contraseña.',
      );

      // Limpiar el formulario
      setFormValues({ email: '' });

      // Redirigir a la pantalla de RESET PASSWORD (modo manual) después de 2 segundos
      setTimeout(() => {
        router.push('/auth/reset-password');
      }, 2000);
    } catch (error) {
      let errorMessage = 'Ocurrió un error al enviar el correo.';

      if (isAxiosError(error)) {
        if (error.response) {
          errorMessage =
            error.response.data?.error ||
            error.response.data?.message ||
            errorMessage;
        } else if (error.request) {
          errorMessage =
            'No se pudo conectar con el servidor. Revisa tu conexión a internet.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      showError('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Botón volver */}
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.8}
        onPress={() => router.push('/auth')}
      >
        {/* 4. Usar estilos dinámicos */}
        <View style={styles.backButtonInner}>
          <Image
            source={require('../../assets/images/volver.png')}
            style={styles.backIcon}
          />
        </View>
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.formContainer}>
          {/* Título */}
          <AppText style={styles.welcomeTitle}>
            Recuperación de Contraseña
          </AppText>

          {/* 🔹 Formulario dinámico */}
          <DynamicForm
            fields={fields}
            onSubmit={handleSubmit}
            buttonText="Enviar Código"
            buttonIcon="send"
            values={formValues}
            onValueChange={handleValueChange}
            loading={loading}
          />

          {/* 🔹 Enlace a registro */}
          <TouchableOpacity
            style={styles.registerContainer}
            onPress={() => router.push('/auth/register')}
          >
            <AppText style={styles.registerText}>Regístrate</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background, // Dinámico
      justifyContent: 'center',
      alignItems: 'center',
    },
    formContainer: {
      width: width * 0.85,
      maxWidth: 400,
      paddingHorizontal: 20,
      backgroundColor: colors.cardBackground, // Dinámico
      borderRadius: 16,
      paddingVertical: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.1, // Dinámico
      shadowRadius: 3.84,
      elevation: 5,
    },
    welcomeTitle: {
      fontSize: 28,
      fontWeight: fontWeightSemiBold,
      color: colors.text, // Dinámico
      textAlign: 'center',
      marginBottom: 40,
      letterSpacing: 0.5,
    },
    registerContainer: {
      alignItems: 'center',
      marginTop: 20,
    },
    registerText: {
      color: colors.primary, // Dinámico
      fontSize: 16,
      fontWeight: fontWeightMedium,
      textDecorationLine: 'underline',
    },
    backButton: {
      position: 'absolute',
      top: 50,
      left: 20,
      zIndex: 1,
    },
    backButtonInner: {
      backgroundColor: colors.cardBackground, // Dinámico
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
    },
    backIcon: {
      width: 24,
      height: 24,
      tintColor: colors.text, // Dinámico
    },
  });