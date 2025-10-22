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
import { router } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import {
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';

const { width } = Dimensions.get('window');

export default function Index() {
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
  const handleSubmit = () => {
    console.log('📩 Enviando código a:', formValues.email);
    // Aquí puedes agregar la lógica real de envío (API, validación, etc.)
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
