import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import apiClient from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { isAxiosError } from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { useNotification } from '@/src/components/notifications/NotificationContext';
import { Colors } from '@/src/constants/colors';
import {
  fontWeightBold,
  fontWeightSemiBold,
  AppText,
} from '@/src/components/AppText';
import Constants from 'expo-constants';
import CustomButton from '@/src/components/UI/CustomButton';
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';

// Importaciones para push notifications
import { getExpoPushTokenAsync } from '@/src/utils/expoNotifications';
import { registerPushToken } from '@/src/api/notifications';

const { width } = Dimensions.get('window');

// Configuración de campos para el código 2FA
const verify2FAFields: FormField[] = [
  {
    name: 'code',
    label: 'Código de verificación',
    placeholder: 'Ingresa el código de 6 dígitos',
    keyboardType: 'number-pad',
    autoCapitalize: 'none',
    icon: 'shield-checkmark-outline',
    type: 'text',
    maxLength: 6,
  },
];

const Verify2FA: React.FC = () => {
  const params = useLocalSearchParams();
  const email = params.email as string;

  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const { showError, showSuccess, showWarning } = useNotification();
  const { login } = useAuth();

  const [formValues, setFormValues] = useState({
    code: '',
  });

  const handleValueChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const registerPushTokenSafely = async () => {
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ||
        Constants?.easConfig?.projectId;

      if (!projectId) {
        console.warn('⚠️ No se encontró projectId en la configuración de Expo.');
        return;
      }

      const expoToken = await getExpoPushTokenAsync(projectId);

      if (expoToken) {
        await registerPushToken(expoToken);
        console.log('✅ Push token registrado correctamente:', expoToken);
      } else {
        console.warn('⚠️ No se pudo obtener el token Expo Push.');
      }
    } catch (error) {
      console.warn('⚠️ Error al registrar push token:', error);
    }
  };

  const handleVerify = async () => {
    const { code } = formValues;

    if (!code || code.length !== 6) {
      showWarning('Atención', 'Por favor, ingresa el código de 6 dígitos.');
      return;
    }

    setLoading(true);

    try {
      interface Verify2FAResponse {
        success: boolean;
        message: string;
        token?: string;
      }

      const response = await apiClient.post<Verify2FAResponse>(
        '/auth/verify-2fa',
        {
          email,
          code,
        }
      );

      console.log('🧾 Respuesta de verify-2fa:', response.data);
      const { token } = response.data;

      if (!token) throw new Error('El servidor no envió un token válido.');

      console.log('✅ Verificación 2FA exitosa, token recibido.');

      // Guardar token en AuthContext
      await login(token);

      // Mostrar feedback
      showSuccess('Éxito', 'Autenticación completada correctamente.');

      // Registrar el push token
      registerPushTokenSafely();

      // Redirigir al home
      router.replace('/home');
    } catch (error) {
      let errorMessage = 'Ocurrió un error al verificar el código.';

      if (isAxiosError(error)) {
        if (error.response) {
          errorMessage =
            error.response.data?.error ||
            error.response.data?.message ||
            'Código inválido o expirado.';
        } else if (error.request) {
          errorMessage =
            'No se pudo conectar con el servidor. Revisa tu conexión a internet.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      showError('Error de verificación', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      // Hacer un nuevo login para generar un nuevo código
      await apiClient.post('/auth/login', {
        email,
        password: '', // El backend debería manejar esto, o crear un endpoint específico
      });

      showSuccess(
        'Código reenviado',
        'Se ha enviado un nuevo código a tu email.'
      );
    } catch (error) {
      showError(
        'Error',
        'No se pudo reenviar el código. Por favor, intenta iniciar sesión nuevamente.'
      );
    } finally {
      setResending(false);
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
          onPress={() => router.push('/auth/login')}
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
          <AppText style={styles.welcomeTitle}>Verificación de seguridad</AppText>
          <AppText style={styles.brandTitle}>Código 2FA</AppText>
          <AppText style={styles.descriptionText}>
            Hemos enviado un código de 6 dígitos a tu correo electrónico
          </AppText>
          <AppText style={styles.emailText}>{email}</AppText>
        </View>

        {/* Dynamic Form */}
        <View style={styles.formWrapper}>
          <DynamicForm
            fields={verify2FAFields}
            values={formValues}
            onValueChange={handleValueChange}
            onSubmit={handleVerify}
            loading={loading}
            buttonText="Verificar"
            buttonIcon="shield-checkmark-outline"
          />

          {/* Resend Code Button */}
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendCode}
            disabled={resending}
            activeOpacity={0.7}
          >
            {resending ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <AppText style={styles.resendText}>
                ¿No recibiste el código? Reenviar
              </AppText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Verify2FA;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titleContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: fontWeightBold,
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  emailText: {
    fontSize: 16,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: fontWeightSemiBold,
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
  resendButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resendText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: fontWeightSemiBold,
  },
});
