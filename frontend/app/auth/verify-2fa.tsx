import React, { useState, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';
import { useNotification } from '@/src/components/notifications';
import { Colors } from '@/src/constants/colors';
import {
  fontWeightBold,
  fontWeightSemiBold,
  AppText,
} from '@/src/components/AppText';
import Constants from 'expo-constants';
import { getExpoPushTokenAsync } from '@/src/utils/expoNotifications';
import { registerPushToken } from '@/src/api/notifications';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');

const verifyFields: FormField[] = [
  {
    name: 'code',
    label: 'Código de verificación',
    placeholder: 'Ingresa el código de 6 dígitos',
    keyboardType: 'number-pad',
    autoCapitalize: 'none',
    icon: 'key-outline',
    type: 'text',
  },
];

const Verify2FA: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { showInfo, showError, showSuccess } = useNotification();
  const { login } = useAuth();
  const params = useLocalSearchParams();
  const email = params.email as string;

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
        Constants?.easConfig?.projectId ||
        undefined;

      const tokenResult = await getExpoPushTokenAsync({
        projectId,
        onInfo: showInfo, // ✅ ahora correcto
      });

      if (!tokenResult || !tokenResult.token) {
        console.warn('No se obtuvo Expo push token');
        return;
      }

      await registerPushToken({
        push_token: tokenResult.token,
        platform: tokenResult.platform,
        app_version: tokenResult.appVersion,
      });

      await SecureStore.setItemAsync(
        'last_registered_push_token',
        tokenResult.token,
      );
      console.log('✅ Push token registrado:', tokenResult.token);
    } catch (err) {
      console.warn('Error registrando push token en backend:', err);
    }
  };

  const handleVerify = async () => {
    const { code } = formValues;

    if (!code || code.length !== 6) {
      showError('Error', 'Por favor, ingresa el código de 6 dígitos.');
      return;
    }

    setLoading(true);

    try {
      interface VerifyResponse {
        success: boolean;
        message: string;
        token?: string;
      }

      const response = await apiClient.post<VerifyResponse>(
        '/auth/verify-2fa',
        {
          email,
          code,
        },
      );

      const { token } = response.data;

      if (!token) throw new Error('El servidor no envió un token válido.');

      console.log('✅ 2FA verificado, token recibido');

      await login(token);
      showSuccess('Éxito', 'Verificación completada correctamente.');

      registerPushTokenSafely();

      router.replace('/home');
    } catch (error) {
      let errorMessage = 'Código de verificación inválido o expirado.';

      if (isAxiosError(error)) {
        if (error.response) {
          errorMessage = error.response.data?.message || errorMessage;
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
    setLoading(true);
    try {
      await apiClient.post('/auth/resend-2fa', { email });
      showSuccess('Código reenviado', 'Revisa tu email nuevamente.');
    } catch (error) {
      showError('Error', 'No se pudo reenviar el código.');
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
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <View style={styles.backButtonInner}>
            <Image
              source={require('../../assets/images/volver.png')}
              style={{ width: 24, height: 24, tintColor: '#374151' }}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <AppText style={styles.welcomeTitle}>
            Verificación en dos pasos
          </AppText>
          <AppText style={styles.subtitleText}>
            Ingresa el código que enviamos a {email}
          </AppText>
        </View>

        <View style={styles.formWrapper}>
          <DynamicForm
            fields={verifyFields}
            values={formValues}
            onValueChange={handleValueChange}
            onSubmit={handleVerify}
            loading={loading}
            buttonText="Verificar"
            buttonIcon="checkmark-circle-outline"
          />

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendCode}
            disabled={loading}
          >
            <AppText style={styles.resendText}>
              ¿No recibiste el código? Reenviar
            </AppText>
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
  },
  titleContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: fontWeightBold,
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
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
    alignItems: 'center',
  },
  resendText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: fontWeightSemiBold,
  },
});
