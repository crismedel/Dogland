import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/src/api/client';
import { useAuth } from '@/src/contexts/AuthContext';
import { isAxiosError } from 'axios';
import { router } from 'expo-router';
import { useNotification } from '@/src/components/notifications';
import { Colors } from '@/src/constants/colors';
import { loginSchema } from '@/src/schemas';
import {
  fontWeightBold,
  fontWeightSemiBold,
  AppText,
} from '@/src/components/AppText';
import Constants from 'expo-constants';
import { getExpoPushTokenAsync } from '@/src/utils/expoNotifications';
import { registerPushToken } from '@/src/api/notifications';
import * as SecureStore from 'expo-secure-store';
import { useGoogleSignInNative } from '@/src/hooks/useGoogleSignInNative';
import { GoogleSignInButton } from '@/src/components/GoogleSignInButton';

const { width } = Dimensions.get('window');

export default function LoginWithValidation() {
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showInfo, showError, showSuccess, showWarning } = useNotification();
  const { login } = useAuth();

  // Hook para autenticación con Google (nativo)
  const {
    signIn: googleSignIn,
    isLoading: googleLoading,
    error: googleError,
    isReady: googleReady,
  } = useGoogleSignInNative({
    onSuccess: async (token, user) => {
      try {
        await login(token);
        showSuccess('Éxito', 'Has iniciado sesión con Google correctamente.');
        registerPushTokenSafely();
        router.replace('/home');
      } catch (error) {
        showError('Error', 'No se pudo completar el inicio de sesión.');
      }
    },
    onError: (error) => {
      showError('Error de Google', error);
    },
  });

  // React Hook Form con validación Zod
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Valida al salir del campo
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerPushTokenSafely = async () => {
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ||
        Constants?.easConfig?.projectId ||
        undefined;

      const tokenResult = await getExpoPushTokenAsync({
        projectId,
        onInfo: showInfo,
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

  const onSubmit = async (data: any) => {
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
        email: data.email,
        password: data.password,
      });

      // Verificar si se requiere 2FA
      if (response.data.requires2FA) {
        showSuccess(
          'Código enviado',
          'Revisa tu email para obtener el código de verificación.',
        );

        router.push({
          pathname: '/auth/verify-2fa',
          params: { email: response.data.email || data.email },
        });
        return;
      }

      // Flujo normal sin 2FA
      const { token } = response.data;

      if (!token) throw new Error('El servidor no envió un token válido.');

      await login(token);
      showSuccess('Éxito', 'Has iniciado sesión correctamente.');

      registerPushTokenSafely();

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

        {/* Form */}
        <View style={styles.formWrapper}>
          {/* Email Field */}
          <View style={styles.inputContainer}>
            <AppText style={styles.inputLabel}>Correo</AppText>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.email && styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={errors.email ? '#EF4444' : '#6B7280'}
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Ingresa tu correo"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>
                  {errors.email && (
                    <AppText style={styles.errorText}>
                      {errors.email.message}
                    </AppText>
                  )}
                </>
              )}
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <AppText style={styles.inputLabel}>Contraseña</AppText>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.password && styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={errors.password ? '#EF4444' : '#6B7280'}
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Ingresa tu contraseña"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <AppText style={styles.errorText}>
                      {errors.password.message}
                    </AppText>
                  )}
                </>
              )}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="log-in-outline"
                  size={20}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <AppText style={styles.submitButtonText}>Acceder</AppText>
              </>
            )}
          </TouchableOpacity>

          {/* Google Sign In - Solo en Development Build */}
          {googleReady && (
            <>
              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <AppText style={styles.dividerText}>o</AppText>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign In Button */}
              <GoogleSignInButton
                onPress={googleSignIn}
                isLoading={googleLoading}
                disabled={loading}
              />
            </>
          )}
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
}

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
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: fontWeightSemiBold,
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: fontWeightSemiBold,
  },
  registerButton: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 16,
    marginTop: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginHorizontal: 16,
  },
});
