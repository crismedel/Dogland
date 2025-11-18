import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '@/src/api/client';
import { useNotification } from '@/src/components/notifications';
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
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';
import CustomHeader from '@/src/components/UI/CustomHeader'; // Importar CustomHeader

const { width } = Dimensions.get('window');

export default function CreateAdoptionScreen() {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [raza, setRaza] = useState<Raza[]>([]);
  const [especie, setEspecie] = useState<Especie[]>([]);
  const [estadoSalud, setEstadoSalud] = useState<EstadoSalud[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useNotification();
  const { user } = useAuth();
  const router = useRouter(); // Mover router aquí

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
  }, [showError]); // Dependencia añadida

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
      showError(
        'No se pudo obtener el ID de usuario. Por favor, inicia sesión nuevamente.',
      );
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
      {/* 4. Añadir CustomHeader aquí */}
      <CustomHeader
        title="Agregar Nuevo Animal"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              // 4. Aplicar color dinámico
              style={{
                width: 24,
                height: 24,
                tintColor: isDark ? colors.lightText : colors.text,
              }}
            />
          </TouchableOpacity>
        }
      />

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

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background, // Dinámico
    },
    backButton: {
      // Este estilo ya no se usa si CustomHeader está presente
      position: 'absolute',
      top: 60,
      left: 20,
      zIndex: 10,
    },
    scrollContainer: {
      paddingTop: 20, // Reducido gracias al CustomHeader
      paddingBottom: 40,
      alignItems: 'center',
      justifyContent: 'center',
      flexGrow: 1,
    },
    formContainer: {
      width: width * 0.9,
      maxWidth: 400,
    },
    welcomeTitle: {
      fontSize: 28,
      fontWeight: fontWeightSemiBold,
      color: colors.text, // Dinámico
      textAlign: 'center',
      marginBottom: 30,
    },
  });