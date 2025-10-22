import apiClient from '@/src/api/client';
import {
  AppText,
  fontWeightMedium,
  fontWeightSemiBold,
} from '@/src/components/AppText';
import { useNotification } from '@/src/components/notifications/NotificationContext';
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';
import { Colors } from '@/src/constants/colors';
import { isAxiosError } from 'axios';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function Index() {
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
        'Si el correo existe, recibirás las instrucciones para restablecer tu contraseña.'
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
          errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
        } else if (error.request) {
          errorMessage = 'No se pudo conectar con el servidor. Revisa tu conexión a internet.';
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
        style={{ position: 'absolute', top: 50, left: 20, zIndex: 1 }}
        activeOpacity={0.8}
        onPress={() => router.push('/auth')}
      >
        <Image
          source={require('../../assets/images/volver.png')}
          style={{ width: 24, height: 24 }}
        />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightText,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: width * 0.85,
    maxWidth: 400,
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: fontWeightSemiBold,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  registerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: fontWeightMedium,
    textDecorationLine: 'underline',
  },
});
