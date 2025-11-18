import apiClient from '@/src/api/client';
import {
  AppText,
  fontWeightBold,
  fontWeightMedium,
  fontWeightSemiBold,
} from '@/src/components/AppText';
import { useNotification } from '@/src/components/notifications';
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import { isAxiosError } from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

const { width } = Dimensions.get('window');

export default function ResetPassword() {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const params = useLocalSearchParams();
  const tokenFromUrl = params.token as string;

  const [loading, setLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const { showError, showSuccess, showWarning } = useNotification();

  const [formValues, setFormValues] = useState({
    token: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Determinar el modo (automático o manual) al cargar la pantalla
  useEffect(() => {
    if (tokenFromUrl) {
      // Modo automático: token viene del deep link
      setFormValues((prev) => ({ ...prev, token: tokenFromUrl }));
      setManualMode(false);
    } else {
      // Modo manual: usuario debe ingresar el token
      setManualMode(true);
    }
  }, [tokenFromUrl]);

  // Campos del formulario según el modo
  const fields: FormField[] = manualMode
    ? [
        {
          name: 'token',
          label: 'Código de Recuperación',
          placeholder: 'Pega el código del correo',
          autoCapitalize: 'none',
          icon: 'key-outline',
          type: 'text',
        },
        {
          name: 'newPassword',
          label: 'Nueva Contraseña',
          placeholder: 'Ingresa tu nueva contraseña',
          secureTextEntry: true,
          autoCapitalize: 'none',
          icon: 'lock-closed-outline',
          type: 'password',
        },
        {
          name: 'confirmPassword',
          label: 'Confirmar Contraseña',
          placeholder: 'Confirma tu nueva contraseña',
          secureTextEntry: true,
          autoCapitalize: 'none',
          icon: 'lock-closed-outline',
          type: 'password',
        },
      ]
    : [
        {
          name: 'newPassword',
          label: 'Nueva Contraseña',
          placeholder: 'Ingresa tu nueva contraseña',
          secureTextEntry: true,
          autoCapitalize: 'none',
          icon: 'lock-closed-outline',
          type: 'password',
        },
        {
          name: 'confirmPassword',
          label: 'Confirmar Contraseña',
          placeholder: 'Confirma tu nueva contraseña',
          secureTextEntry: true,
          autoCapitalize: 'none',
          icon: 'lock-closed-outline',
          type: 'password',
        },
      ];

  const handleValueChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { token, newPassword, confirmPassword } = formValues;

    // Validaciones
    if (!token) {
      showWarning('Atención', 'Por favor, ingresa el código de recuperación.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      showWarning('Atención', 'Por favor, completa todos los campos.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Error', 'Las contraseñas no coinciden.');
      return;
    }

    if (newPassword.length < 6) {
      showWarning(
        'Atención',
        'La contraseña debe tener al menos 6 caracteres.',
      );
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword,
      });

      showSuccess(
        'Contraseña actualizada',
        'Tu contraseña ha sido restablecida correctamente. Ahora puedes iniciar sesión.',
      );

      // Limpiar formulario
      setFormValues({ ...formValues, newPassword: '', confirmPassword: '' });

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error) {
      let errorMessage = 'Ocurrió un error al restablecer la contraseña.';

      if (isAxiosError(error)) {
        if (error.response) {
          const message =
            error.response.data?.message || error.response.data?.error;

          // Manejar errores específicos del backend
          if (
            message?.includes('TOKEN_INVALID') ||
            message?.includes('no es válido')
          ) {
            errorMessage = 'El enlace de recuperación no es válido.';
          } else if (
            message?.includes('TOKEN_USED') ||
            message?.includes('ya ha sido utilizado')
          ) {
            errorMessage =
              'Este enlace ya ha sido utilizado. Por favor, solicita uno nuevo.';
          } else if (
            message?.includes('TOKEN_EXPIRED') ||
            message?.includes('expirado')
          ) {
            errorMessage =
              'El enlace de recuperación ha expirado. Por favor, solicita uno nuevo.';
          } else {
            errorMessage = message || errorMessage;
          }
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
        onPress={() => router.push('/auth/login')}
      >
        <View style={styles.backButtonInner}>
          <Image
            source={require('../../assets/images/volver.png')}
            style={styles.backIcon} // 4. Usar estilos dinámicos
          />
        </View>
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.formContainer}>
          {/* Título */}
          <AppText style={styles.welcomeTitle}>Restablecer Contraseña</AppText>

          {/* Mensaje informativo según el modo */}
          {manualMode && (
            <AppText style={styles.infoText}>
              Ingresa el código que recibiste en tu correo electrónico.
            </AppText>
          )}
          {!manualMode && (
            <AppText style={styles.infoText}>
              Ingresa tu nueva contraseña para restablecer tu cuenta.
            </AppText>
          )}

          {/* Formulario dinámico */}
          <DynamicForm
            fields={fields}
            onSubmit={handleSubmit}
            buttonText="Restablecer Contraseña"
            buttonIcon="checkmark-circle-outline"
            values={formValues}
            onValueChange={handleValueChange}
            loading={loading}
          />

          {/* Enlace al login */}
          <TouchableOpacity
            style={styles.loginContainer}
            onPress={() => router.push('/auth/login')}
          >
            <AppText style={styles.loginText}>
              Volver al inicio de sesión
            </AppText>
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
    loginContainer: {
      alignItems: 'center',
      marginTop: 20,
    },
    loginText: {
      color: colors.primary, // Dinámico
      fontSize: 16,
      fontWeight: fontWeightMedium,
      textDecorationLine: 'underline',
    },
    infoText: {
      fontSize: 14,
      color: colors.darkGray, // Dinámico
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
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