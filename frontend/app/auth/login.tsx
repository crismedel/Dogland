import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import apiClient from '@/src/api/client';
import { authStorage } from '@/src/utils/authStorage';
import { isAxiosError } from 'axios';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// El componente es un React Functional Component (React.FC)
const Index: React.FC = () => {
  // Tipado explicito de los estados
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atención', 'Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);

    try {
      // Definir el tipo de la respuesta esperada
      interface LoginResponse {
        success: true;
        message: string;
        token: string;
      }

      // Llamada a la API
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      const { token } = response.data;

      if (token) {
        // Guardar el token de forma segura
        await authStorage.saveToken(token);

        Alert.alert('Éxito', 'Has iniciado sesión correctamente.');
        // Usar router.replace para mejor experiencia de navegacion
        router.replace('/home');
      } else {
        // Si la API responde 200 pero no viene el token
        throw new Error('No se recibió el token de autenticación.');
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
          {/* Welcome Title */}
          <Text style={styles.welcomeTitle}>Bienvenido a Dogland</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Correo</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ingresa tu correo"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={true}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.7 }]}
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Acceder</Text>
            )}
          </TouchableOpacity>

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => router.push('/auth/forgot_password')}
          >
            <Text style={styles.forgotPasswordText}>
              No recuerdas tú contraseña?
            </Text>
          </TouchableOpacity>

          {/* Register Link */}
          <TouchableOpacity style={styles.registerContainer}>
            <Text
              style={styles.registerText}
              onPress={() => router.push('/auth/register')}
            >
              Regístrate
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  loginButton: {
    backgroundColor: '#fbbf24',
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#6B7280',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  registerContainer: {
    alignItems: 'center',
  },
  registerText: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
