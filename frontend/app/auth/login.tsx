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
import { useAuth } from '@/src/contexts/AuthContext';
import { isAxiosError } from 'axios';
import { router } from 'expo-router';
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';
import { useNotification } from '@/src/components/notifications/NotificationContext';
import { Colors } from '@/src/constants/colors';
import {
  fontWeightBold,
  fontWeightSemiBold,
  AppText,
} from '@/src/components/AppText';
import Constants from 'expo-constants';

// Importaciones para push notifications
import { getExpoPushTokenAsync } from '@/src/utils/expoNotifications';
import { registerPushToken } from '@/src/api/notifications';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');

// Configuración de campos para LOGIN
const loginFields: FormField[] = [
  {
    name: 'email',
    label: 'Correo',
    placeholder: 'Ingresa tu correo',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    icon: 'mail-outline',
    type: 'email',
  },
  {
    name: 'password',
    label: 'Contraseña',
    placeholder: 'Ingresa tu contraseña',
    secureTextEntry: true,
    autoCapitalize: 'none',
    icon: 'lock-closed-outline',
    type: 'password',
  },
];

// El componente es un React Functional Component (React.FC)
const Index: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { showError, showSuccess, showWarning } = useNotification();
  const { login } = useAuth();

  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });

  const handleValueChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const registerPushTokenSafely = async () => {
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ||
        Constants?.easConfig?.projectId ||
        undefined;

      const tokenResult = await getExpoPushTokenAsync(projectId);

      if (!tokenResult || !tokenResult.token) {
        console.warn('No se obtuvo Expo push token');
        return;
      }

      // Enviar al backend incluyendo platform y appVersion
      await registerPushToken({
        push_token: tokenResult.token,
        platform: tokenResult.platform,
        app_version: tokenResult.appVersion,
      });

      // Opcional: guardar último token registrado localmente para evitar reenvíos constantes
      await SecureStore.setItemAsync(
        'last_registered_push_token',
        tokenResult.token,
      );
      console.log('✅ Push token registrado:', tokenResult.token);
    } catch (err) {
      console.warn('Error registrando push token en backend:', err);
    }
  };

  // Adaptar handleLogin para registro del token push
  const handleLogin = async () => {
    const { email, password } = formValues;

    if (!email || !password) {
      showWarning('Atención', 'Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);

    try {
      interface LoginResponse {
        success: boolean;
        message: string;
        token?: string;
        requires2FA?: boolean;
        email?: string;
      }

      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

<<<<<<< HEAD
=======
      console.log('Datos completos de login response:', response.data);

      // Verificar si se requiere 2FA
      if (response.data.requires2FA) {
        console.log('2FA requerido, redirigiendo a verificación...');
        showSuccess(
          'Código enviado',
          'Revisa tu email para obtener el código de verificación.'
        );

        // Redirigir a la pantalla de verificacion 2FA
        router.push({
          pathname: '/auth/verify-2fa',
          params: { email: response.data.email || email },
        });
        return;
      }

      // Flujo normal sin 2FA
>>>>>>> 9655146 (feat(auth): implementar autenticacion de dos factores (2FA))
      const { token } = response.data;

      if (!token) throw new Error('El servidor no envió un token válido.');

      console.log('✅ Login exitoso, token recibido. token:', token);

      // Guardar token en AuthContext (esto también lo guarda en SecureStore)
      await login(token);

      // Mostrar feedback y continuar
      showSuccess('Éxito', 'Has iniciado sesión correctamente.');

      // Registrar el push token de forma segura (en segundo plano)
      registerPushTokenSafely();

      // Redirigir al home
      router.replace('/home');
    } catch (error) {
      let errorMessage =
        'Ocurrió un error inesperado durante el inicio de sesión.';

      if (isAxiosError(error)) {
        if (error.response) {
          errorMessage =
            error.response.data?.message ||
            'Credenciales inválidas. Por favor, verifica tus datos.';
        } else if (error.request) {
          errorMessage =
            'No se pudo conectar con el servidor. Revisa tu conexión a internet.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      showError('Error de inicio de sesión', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => router.push('/auth')}
        >
          <View style={styles.backButtonInner}>
            <Image
              source={require('../../assets/images/volver.png')}
              style={{ width: 24, height: 24, tintColor: '#374151' }}
            />
          </View>
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.titleContainer}>
          <AppText style={styles.welcomeTitle}>Bienvenido a</AppText>
          <AppText style={styles.brandTitle}>Dogland</AppText>
        </View>

        {/* Dynamic Form */}
        <View style={styles.formWrapper}>
          <DynamicForm
            fields={loginFields}
            values={formValues}
            onValueChange={handleValueChange}
            onSubmit={handleLogin}
            loading={loading}
            buttonText="Acceder"
            buttonIcon="log-in-outline"
          />
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push('/auth/register')}
          activeOpacity={0.9}
        >
          <AppText style={styles.registerText}>Regístrate</AppText>
        </TouchableOpacity>

        {/* Forgot Password Link */}
        <AppText
          style={styles.forgotPasswordText}
          onPress={() => router.push('/auth/forgot_password')}
        >
          ¿No recuerdas tu contraseña?
        </AppText>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: fontWeightBold,
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(251, 191, 36, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonInner: {
    backgroundColor: Colors.lightText,
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
    borderColor: '#F3F4F6',
  },
  formWrapper: {
    width: width * 0.85,
    maxWidth: 400,
  },
  registerButton: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 16,
    marginTop: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    width: width * 0.85,
    maxWidth: 400,
  },
  registerText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: fontWeightSemiBold,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  forgotPasswordText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
});
