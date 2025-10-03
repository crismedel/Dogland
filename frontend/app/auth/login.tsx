import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import apiClient from '@/src/api/client';
import { authStorage } from '@/src/utils/authStorage';
import { isAxiosError } from 'axios';
import { router } from 'expo-router';
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';
import { Colors } from '@/src/constants/colors';

const { width } = Dimensions.get('window');

// 👇 Configuración de campos para LOGIN
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

  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });

  const handleValueChange = (name: string, value: string) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  // Adaptar handleLogin para que use el estado 'formValues'
  const handleLogin = async () => {
    const { email, password } = formValues; // Se obtienen los valores del estado

    if (!email || !password) {
      Alert.alert('Atención', 'Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);

    try {
      interface LoginResponse {
        success: boolean;
        message: string;
        token?: string; 
      }

      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      const { token } = response.data;

      if (token) {
        // Guardar el token de forma segura
        await authStorage.saveToken(token);
        Alert.alert('Éxito', 'Has iniciado sesión correctamente.');
        // Usar router.replace para navegar al home
        router.replace('/home');

      } else {
        throw new Error(response.data.message || 'No se recibió el token de autenticación.');
      }
    } catch (error) {
      // Manejo de errores de API
      let errorMessage = 'Ocurrió un error inesperado.';
      if (isAxiosError(error)) {
        // Si es un error de Axios
        if (error.response) {
          // Error del servidor
          errorMessage =
            error.response.data?.message ||
            'Credenciales inválidas. Por favor, verifica tus datos.';
        } else if (error.request) {
          // La peticion se hizo pero no hubo respuesta
          errorMessage =
            'No se pudo conectar con el servidor. Revisa tu conexión a internet.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Error de inicio de sesión', errorMessage);
    } finally {
      // Se ejecuta siempre
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
          <Text style={styles.welcomeTitle}>Bienvenido a</Text>
          <Text style={styles.brandTitle}>Dogland</Text>
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
          <Text style={styles.registerText}>Regístrate</Text>
        </TouchableOpacity>

        {/* Forgot Password Link */}
        <Text
          style={styles.forgotPasswordText}
          onPress={() => router.push('/auth/forgot_password')}
        >
          ¿No recuerdas tu contraseña?
        </Text>
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
    fontWeight: '800',
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
    backgroundColor: '#FFFFFF',
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
    fontWeight: '700',
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
