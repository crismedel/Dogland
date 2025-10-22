import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import apiClient from '@/src/api/client';
import { useNotification } from '@/src/components/notifications/NotificationContext';
import { Raza, Especie, EstadoSalud } from '@/src/types/animals';
import { createAnimal } from '@/src/api/animals';
import { createAdoption } from '@/src/api/adoptions';
import { useAuth } from '@/src/contexts/AuthContext';
import FormSolicitud from './component/formSolucitud';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

const { width } = Dimensions.get('window');

export default function CreateAdoptionScreen() {
  const [raza, setRaza] = useState<Raza[]>([]);
  const [especie, setEspecie] = useState<Especie[]>([]);
  const [estadoSalud, setEstadoSalud] = useState<EstadoSalud[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useNotification();
  const { user } = useAuth();

  const [formValues, setFormValues] = useState({
    nombre_animal: '',
    edad_animal: '',
    edad_aproximada: '',
    id_estado_salud: null,
    id_raza: null,
    id_especie: null,
  });

  // 🔹 Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [racesRes, speciesRes, healthRes] = await Promise.all([
          apiClient.get('/races'),
          apiClient.get('/species'),
          apiClient.get('/health-states'),
        ]);
        setRaza(racesRes.data.data);
        setEspecie(speciesRes.data.data);
        setEstadoSalud(healthRes.data.data);
      } catch (error) {
        showError('Error al cargar datos iniciales');
      }
    };
    fetchData();
  }, []);

  const handleValueChange = (name: string, value: any) => {
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  // 🔹 Obtener ID del usuario autenticado
  const getTokenID = () => {
    return user?.id;
  };

  // 🔹 Crear animal + adopción
  const handleSubmit = async () => {
    const { nombre_animal, edad_animal, id_estado_salud, id_raza } = formValues;
    if (!nombre_animal || !edad_animal || !id_estado_salud || !id_raza) {
      showError('Completa todos los campos antes de continuar.');
      return;
    }

    const userId = getTokenID();
    if (!userId) {
      showError('No se pudo obtener el ID de usuario. Por favor, inicia sesión nuevamente.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newAnimal = {
        nombre_animal,
        edad_animal: Number(edad_animal),
        edad_aproximada: `${edad_animal} meses`,
        id_estado_salud: Number(id_estado_salud),
        id_raza: Number(id_raza),
      };

      const responseAnimal = await createAnimal(newAnimal);
      const createdAnimalId = responseAnimal.data.id_animal;

      const newAdoption = { id_animal: createdAnimalId, id_usuario: userId };
      await createAdoption(newAdoption);

      showSuccess('Adopción creada exitosamente');
      router.push('/adoption');
    } catch (error: any) {
      showError('Error al crear la adopción', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* 🔹 Botón volver */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image
          source={require('../../assets/images/volver.png')}
          style={{ width: 24, height: 24 }}
        />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <AppText style={styles.welcomeTitle}>Crear nueva Adopción</AppText>

          {/* 🔹 Nuevo componente formulario */}
          <FormSolicitud
            formValues={formValues}
            onValueChange={handleValueChange}
            raza={raza}
            especie={especie}
            estadoSalud={estadoSalud}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  backButton: { position: 'absolute', top: 60, left: 20, zIndex: 10 },
  scrollContainer: {
    paddingTop: 100,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: { width: width * 0.9, maxWidth: 400 },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: fontWeightSemiBold,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 30,
  },
});
