import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';
import apiClient from '@/src/api/client';
import { useNotification } from '@/src/components/notifications/NotificationContext';
import { Region, Ciudad } from '@/src/types/location';
import { Colors } from '@/src/constants/colors';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

const { width } = Dimensions.get('window');

export default function Register() {
  // ESTADO Y LÓGICA DE NEGOCIO

  // Estado para datos que vienen de la API
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [isLoadingRegions, setIsLoadingRegions] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useNotification();

  const [formValues, setFormValues] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    telefono: '',
    fechaNacimiento: new Date(),
    idSexo: null,
    idRegion: null,
    idCiudad: null,
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleValueChange = (name: string, value: any) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));

    // Si cambia la region resetea la ciudad
    if (name === 'idRegion') {
      setFormValues((prevValues) => ({
        ...prevValues,
        idCiudad: null,
      }));
    }
  };

  // EFECTOS PARA CARGAR DATOS
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await apiClient.get('/regions');
        setRegiones(response.data.data);
      } catch (error: any) {
        showError('Error', 'No se pudieron cargar las regiones.');
      } finally {
        setIsLoadingRegions(false);
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    const fetchCities = async (regionId: number | null) => {
      if (!regionId) {
        setCiudades([]);
        return;
      }
      setIsLoadingCities(true);
      setCiudades([]); // Limpia las ciudades anteriores

      try {
        const response = await apiClient.get(`/cities/${regionId}`);
        setCiudades(response.data.data);
      } catch (error: any) {
        showError('Error', 'No se pudieron cargar las ciudades.');
      } finally {
        setIsLoadingCities(false);
      }
    };
    fetchCities(formValues.idRegion);
  }, [formValues.idRegion]);

  // MANEJADOR DEL ENVIO DEL FORMULARIO
  const handleRegister = async () => {
    const {
      nombre,
      apellidoPaterno,
      telefono,
      idSexo,
      idCiudad,
      email,
      password,
      confirmPassword,
    } = formValues;

    if (
      !nombre ||
      !apellidoPaterno ||
      !telefono ||
      !idSexo ||
      !idCiudad ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      showError('Error', 'Por favor, completa todos los campos obligatorios.');
      return;
    }
    if (password.length < 6) {
      showError('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      showError('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userData = {
        nombre_usuario: nombre,
        apellido_paterno: apellidoPaterno,
        apellido_materno: formValues.apellidoMaterno,
        id_sexo: idSexo,
        fecha_nacimiento: new Date(formValues.fechaNacimiento)
          .toISOString()
          .split('T')[0],
        telefono: telefono,
        email: email,
        password_hash: password,
        id_ciudad: idCiudad,
      };

      const response = await apiClient.post('/auth/register', userData);
      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Ocurrió un error en el registro.',
        );
      }

      showSuccess(
        'Éxito',
        'Cuenta creada correctamente. Ahora puedes iniciar sesión.',
      );
      setTimeout(() => {
        router.push('/auth/login');
      }, 500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      showError('Error de Registro', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // definicion declarativa de la estructura del formulario
  const formFields: FormField[] = [
    {
      name: 'nombre',
      label: 'Nombre',
      placeholder: 'Ingresa tu nombre',
      type: 'text',
      icon: 'person-outline',
    },
    {
      name: 'apellidoPaterno',
      label: 'Apellido Paterno',
      placeholder: 'Ingresa tu apellido',
      type: 'text',
      icon: 'person-outline',
    },
    {
      name: 'apellidoMaterno',
      label: 'Apellido Materno (Opcional)',
      placeholder: 'Ingresa tu apellido',
      type: 'text',
      icon: 'person-outline',
    },
    {
      name: 'telefono',
      label: 'Teléfono',
      placeholder: 'Ej: 912345678',
      type: 'phone',
      icon: 'call-outline',
      keyboardType: 'phone-pad',
    },
    {
      name: 'fechaNacimiento',
      label: 'Fecha de Nacimiento',
      placeholder: 'Selecciona una fecha',
      type: 'date',
      icon: 'calendar-outline',
    },
    {
      name: 'idSexo',
      label: 'Sexo',
      type: 'picker',
      icon: 'male-female-outline',
      options: [
        { label: 'Selecciona tu sexo...', value: null },
        { label: 'Masculino', value: 1 },
        { label: 'Femenino', value: 2 },
        { label: 'Otro', value: 3 },
      ],
    },
    {
      name: 'idRegion',
      label: 'Región',
      type: 'picker',
      icon: 'map-outline',
      options: [
        { label: 'Selecciona una región...', value: null },
        ...regiones.map((r) => ({
          label: r.nombre_region,
          value: r.id_region,
        })),
      ],
    },
    {
      name: 'idCiudad',
      label: 'Ciudad',
      type: 'picker',
      icon: 'location-outline',
      options: [
        {
          label: formValues.idRegion
            ? 'Selecciona una ciudad...'
            : 'Elige una región primero',
          value: null,
        },
        ...ciudades.map((c) => ({
          label: c.nombre_ciudad,
          value: c.id_ciudad,
        })),
      ],
    },
    {
      name: 'email',
      label: 'Correo Electrónico',
      placeholder: 'correo@ejemplo.com',
      type: 'email',
      icon: 'mail-outline',
      autoCapitalize: 'none',
    },
    {
      name: 'password',
      label: 'Contraseña',
      placeholder: 'Mínimo 6 caracteres',
      type: 'password',
      icon: 'lock-closed-outline',
      secureTextEntry: true,
    },
    {
      name: 'confirmPassword',
      label: 'Confirmar Contraseña',
      placeholder: 'Repite la contraseña',
      type: 'password',
      icon: 'lock-closed-outline',
      secureTextEntry: true,
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image
          source={require('../../assets/images/volver.png')}
          style={{ width: 24, height: 24 }}
        />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <AppText style={styles.welcomeTitle}>
            Crea tu cuenta en Dogland
          </AppText>

          <DynamicForm
            fields={formFields}
            values={formValues}
            onValueChange={handleValueChange}
            onSubmit={handleRegister}
            buttonText="Crear Cuenta"
            buttonIcon="checkmark-circle-outline"
            loading={isSubmitting}
            loadingFields={{
              idRegion: isLoadingRegions,
              idCiudad: isLoadingCities,
            }}
          />

          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            style={styles.loginLinkContainer}
          >
            <AppText style={styles.loginLinkText}>Ya Tengo una Cuenta</AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightText,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  scrollContainer: {
    paddingTop: 100,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    width: width * 0.9,
    maxWidth: 400,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: fontWeightSemiBold,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 30,
  },
  loginLinkContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  loginLinkText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: fontWeightMedium,
    textDecorationLine: 'underline',
  },
});
