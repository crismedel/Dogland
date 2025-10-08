import React, { use, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';
import apiClient from '@/src/api/client';
import { useNotification } from '@/src/components/notifications/NotificationContext';
import { Raza, Especie, EstadoSalud } from '@/src/types/animals';
import { createAnimal } from '@/src/api/animals';
import { createAdoption } from '@/src/api/adoptions';
import { authStorage } from '../../src/utils/authStorage';
import { jwtDecode } from 'jwt-decode';

const { width } = Dimensions.get('window');

export default function CreateAdoptionScreen() {
  // ESTADO Y LÓGICA DE NEGOCIO
  const [raza, setRaza] = useState<Raza[]>([]);
  const [especie, setEspecie] = useState<Especie[]>([]);
  const [estadoSalud, setEstadoSalud] = useState<EstadoSalud[]>([]);
  const [isLoadingRaces, setIsLoadingRaces] = useState(false);
  const [isLoadingSpecies, setIsLoadingSpecies] = useState(false);
  const [isLoadingHealthStates, setIsLoadingHealthStates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useNotification();

  const [formValues, setFormValues] = useState({
    nombre_animal: '',
    edad_animal: '',
    edad_aproximada: '',
    id_estado_salud: null,
    id_raza: null,
    id_especie: null,
  });

  const handleValueChange = (name: string, value: any) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));

    if (name === 'id_especie') {
      setFormValues((prevValues) => ({
        ...prevValues,
        id_raza: null,
      }));
    }
  };

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await apiClient.get('/species');
        setEspecie(response.data.data);
      } catch (error: any) {
        showError('Error al cargar las razas');
      } finally {
        setIsLoadingRaces(false);
      }
    };
    fetchSpecies();
  }, []);

  useEffect(() => {
    const fetchRaces = async (id_especie: number | null) => {
      if (!id_especie) {
        setRaza([]);
        return;
      }
      setIsLoadingSpecies(true);
      setRaza([]);

      try {
        const response = await apiClient.get(`/races/${id_especie}`);
        setRaza(response.data.data);
      } catch (error: any) {
        showError('Error al cargar las especies');
      } finally {
        setIsLoadingSpecies(false);
      }
    };
    fetchRaces(formValues.id_especie);
  }, [formValues.id_especie]);

  useEffect(() => {
    const fetchHealthStates = async () => {
      try {
        const response = await apiClient.get('/health-states');
        setEstadoSalud(response.data.data);
      } catch (error: any) {
        showError('Error al cargar los estados de salud');
      } finally {
        setIsLoadingHealthStates(false);
      }
    };
    fetchHealthStates();
  }, []);

  const getTokenID = async () => {
    const token = await authStorage.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      return decoded.id;
    }
  };

  const handleCreateAdoption = async (adoption: { id_animal: number; id_usuario: number }) => {
    const { id_animal, id_usuario } = adoption;
    if (!id_animal || !id_usuario) {
      showError('Error', 'Por favor completa todos los campos.');
      return;
    }
    if (isNaN(Number(id_animal)) || isNaN(Number(id_usuario))) {
      showError('Error', 'ID de animal y usuario deben ser números válidos.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newAdoption = {
        id_animal: Number(id_animal),
        id_usuario: Number(id_usuario),
      };
      const response = await createAdoption(newAdoption);
      const createdAdoptionId = response.data.id_adopcion;
      console.log('Adopción creada con ID:', createdAdoptionId);
      showSuccess('Éxito', 'Adopción creada exitosamente.');
      setTimeout(() => {
        router.push('/adoption');
      }, 500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      showError('Error al crear la adopción', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnimal = async () => {
    const { nombre_animal, edad_animal, edad_aproximada, id_estado_salud, id_raza } = formValues;

    if (!nombre_animal || !edad_animal || !edad_aproximada || !id_estado_salud || !id_raza) {
      showError('Error', 'Por favor completa todos los campos.');
      return;
    }
    if (isNaN(Number(edad_animal))) {
      showError('Error', 'La edad del animal debe ser un número válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newAdoption = {
        nombre_animal,
        edad_animal: Number(edad_animal),
        edad_aproximada: String(edad_animal + ' meses'),
        id_estado_salud: Number(id_estado_salud),
        id_raza: Number(id_raza),
      };

      const response = await createAnimal(newAdoption);
      const createdAnimalId = response.data.id_animal;
      console.log('Adopción creada con ID:', createdAnimalId);
      showSuccess('Éxito', 'Adopción creada exitosamente.');

      const userId = await getTokenID();
      if (!userId) {
        showError('Error', 'No se pudo obtener el ID del usuario autenticado.');
        setIsSubmitting(false);
        return;
      }

      const adoption = {
        id_animal: createdAnimalId,
        id_usuario: userId,
      };

      handleCreateAdoption(adoption);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      showError('Error al crear la adopción', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields: FormField[] = [
    {
      name: 'nombre_animal',
      label: 'Nombre del Animal',
      type: 'text',
      placeholder: 'Ingresa el nombre del animal',
    },
    {
      name: 'edad_animal',
      label: 'Edad del Animal (en Años)',
      type: 'phone',
      placeholder: 'Ingresa la edad del animal',
      keyboardType: 'numeric',
    },
    {
      name: 'id_estado_salud',
      label: 'Estado de Salud',
      type: 'picker',
      placeholder: 'Selecciona el estado de salud',
      options: [
        { label: 'selecciona un estado...', value: null },
        ...estadoSalud.map((estado) => ({
          label: estado.estado_salud,
          value: estado.id_estado_salud,
        })),
      ],
    },
    {
      name: 'id_especie',
      label: 'Especie',
      type: 'picker',
      placeholder: 'Selecciona la especie',
      options: [
        { label: 'selecciona una especie...', value: null },
        ...especie.map((especie) => ({
          label: especie.nombre_especie,
          value: especie.id_especie,
        })),
      ],
    },
    {
      name: 'id_raza',
      label: 'Raza',
      type: 'picker',
      placeholder: 'Selecciona la raza',
      options: [
        {
          label: formValues.id_especie
            ? 'selecciona una raza...'
            : 'primero selecciona una especie',
          value: null,
        },
        ...raza.map((raza) => ({
          label: raza.nombre_raza,
          value: raza.id_raza,
        })),
      ],
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
          <Text style={styles.welcomeTitle}>Crear nueva Adopción</Text>

          <DynamicForm
            fields={formFields}
            values={formValues}
            onValueChange={handleValueChange}
            onSubmit={handleCreateAnimal}
            buttonText='Crear Adopción'
            buttonIcon='checkmark-circle-outline'
            loading={isSubmitting}
            loadingFields={{
              id_estado_salud: isLoadingHealthStates,
              id_raza: isLoadingRaces,
              id_especie: isLoadingSpecies,
            }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
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
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 30,
  },
});
