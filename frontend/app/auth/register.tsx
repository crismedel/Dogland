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
import { router } from 'expo-router';
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';

const { width } = Dimensions.get('window');

export default function Index() {
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleRegister = (values: Record<string, string>) => {
    const { username, email, password, confirmPassword } = values;

    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Por favor, ingresa un correo válido.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    Alert.alert(
      'Éxito',
      'Cuenta creada correctamente. Ahora puedes iniciar sesión.',
      [{ text: 'OK', onPress: () => router.push('/auth/login') }],
    );
  };

  // Definición de campos del formulario
  const formFields: FormField[] = [
    {
      name: 'username',
      label: 'Usuario',
      placeholder: 'Ingresa tu usuario',
      keyboardType: 'default',
      autoCapitalize: 'none',
      icon: 'person-outline',
    },
    {
      name: 'email',
      label: 'Correo',
      placeholder: 'Ingresa tu correo',
      keyboardType: 'email-address',
      autoCapitalize: 'none',
      icon: 'mail-outline',
    },
    {
      name: 'password',
      label: 'Contraseña',
      placeholder: 'Ingresa tu contraseña',
      secureTextEntry: true,
      autoCapitalize: 'none',
      icon: 'lock-closed-outline',
    },
    {
      name: 'confirmPassword',
      label: 'Confirmar Contraseña',
      placeholder: 'Confirma tu contraseña',
      secureTextEntry: true,
      autoCapitalize: 'none',
      icon: 'lock-closed-outline',
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Botón de volver */}
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
          <Text style={styles.welcomeTitle}>Crea tu cuenta en Dogland</Text>

          {/* Formulario Dinámico */}
          <DynamicForm
            fields={formFields}
            onSubmit={handleRegister}
            loading={loading}
            buttonText="Crear Cuenta"
            buttonIcon="checkmark-circle-outline"
          />

          {/* Login Link */}
          <TouchableOpacity style={styles.loginContainer}>
            <Text
              style={styles.loginText}
              onPress={() => router.push('/auth/login')}
            >
              Ya Tengo una Cuenta
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

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
  loginContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
