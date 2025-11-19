import React, { useEffect, useState } from 'react';
import {
  Alert, // Eliminado
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator, // Importar ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';

// Componentes UI
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';
import { AppText, fontWeightBold } from '@/src/components/AppText';

// API
import {
  createFullAnimal,
  fetchHealthStates,
  fetchRaces,
  fetchSpecies,
} from '@/src/api/animals';

// 1. Importar hooks de tema y notificación
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';
import { useNotification } from '@/src/components/notifications';
import { Ionicons } from '@expo/vector-icons'; // Importar Ionicons

const FormAgregarPerrito = () => {
  // 2. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const router = useRouter();
  const { showError, showSuccess } = useNotification(); // 3. Usar notificaciones

  const [loading, setLoading] = useState(false);

  // Estados para las opciones de los selectores
  const [speciesOptions, setSpeciesOptions] = useState<
    { label: string; value: any }[]
  >([]);
  const [racesOptions, setRacesOptions] = useState<
    { label: string; value: any }[]
  >([]);
  const [healthOptions, setHealthOptions] = useState<
    { label: string; value: any }[]
  >([]);

  // Estado del formulario
  const [formValues, setFormValues] = useState({
    nombre_animal: '',
    edad_animal: '',
    edad_aproximada: '',
    id_especie: '', // Controla el filtro de razas
    id_raza: '',
    id_estado_salud: '',
    foto_url: '',
  });

  // 1. Carga inicial de catálogos (Especies y Salud)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [species, health] = await Promise.all([
          fetchSpecies(),
          fetchHealthStates(),
        ]);

        // Mapeamos la data al formato que DynamicForm entiende { label, value }
        setSpeciesOptions(
          species.map((s: any) => ({
            label: s.nombre_especie,
            value: s.id_especie,
          })),
        );
        setHealthOptions(
          health.map((h: any) => ({
            label: h.estado_salud,
            value: h.id_estado_salud,
          })),
        );
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        showError(
          'Error',
          'No se pudieron cargar las listas de opciones. Revisa tu conexión.',
        );
      }
    };
    loadInitialData();
  }, [showError]); // Añadir dependencia

  // 2. Efecto: Cargar Razas cuando cambia la Especie
  useEffect(() => {
    const loadRaces = async () => {
      // Si no hay especie seleccionada, limpiamos las razas
      if (!formValues.id_especie) {
        setRacesOptions([]);
        return;
      }

      try {
        // Llamamos al endpoint con el filtro ?id_especie=X
        const races = await fetchRaces(formValues.id_especie);
        setRacesOptions(
          races.map((r: any) => ({ label: r.nombre_raza, value: r.id_raza })),
        );
      } catch (error) {
        console.error('Error cargando razas:', error);
      }
    };
    loadRaces();
  }, [formValues.id_especie]); // Se ejecuta cada vez que id_especie cambia

  // Manejador de cambios
  const handleValueChange = (name: string, value: any) => {
    setFormValues((prev) => {
      const newValues = { ...prev, [name]: value };

      // Si el usuario cambia la especie, limpiamos la raza seleccionada para evitar incoherencias
      if (name === 'id_especie') {
        newValues.id_raza = '';
      }
      return newValues;
    });
  };

  // Configuración de los campos del formulario
  const formFields: FormField[] = [
    {
      name: 'nombre_animal',
      label: 'Nombre del Animal *',
      placeholder: 'Ej: Fido',
      type: 'text',
      icon: 'paw',
    },
    {
      name: 'id_especie',
      label: 'Especie *',
      type: 'picker',
      icon: 'layers',
      options: [{ label: 'Seleccione Especie', value: '' }, ...speciesOptions],
    },
    {
      name: 'id_raza',
      label: 'Raza',
      type: 'picker',
      icon: 'git-branch',
      // Las opciones de raza se llenan dinámicamente según la especie
      options: [{ label: 'Seleccione Raza', value: '' }, ...racesOptions],
    },
    {
      name: 'id_estado_salud',
      label: 'Estado de Salud *',
      type: 'picker',
      icon: 'medkit',
      options: [{ label: 'Seleccione Estado', value: '' }, ...healthOptions],
    },
    {
      name: 'edad_animal',
      label: 'Edad Exacta (Años)',
      placeholder: 'Ej: 2',
      type: 'text',
      keyboardType: 'numeric',
      icon: 'calendar-number',
      // La base de datos acepta max 30 años según el esquema Zod
      maxLength: 2,
    },
    {
      name: 'edad_aproximada',
      label: 'Edad Aproximada (Texto)',
      placeholder: 'Ej: Cachorro, Adulto', // Texto corto
      type: 'text',
      icon: 'time',
      maxLength: 20, // <--- ¡ESTO ES CRUCIAL! Evita errores del backend
    },
    {
      name: 'foto_url',
      label: 'Foto (URL)',
      placeholder: 'Pega el enlace de la imagen aquí',
      type: 'text',
      icon: 'image',
      autoCapitalize: 'none',
    },
  ];

  const handleSubmit = async () => {
    // Validación básica en frontend
    if (
      !formValues.nombre_animal ||
      !formValues.id_estado_salud ||
      !formValues.id_especie
    ) {
      showError(
        'Campos incompletos',
        'Nombre, Especie y Estado de Salud son obligatorios.',
      );
      return;
    }

    setLoading(true);

    try {
      // Preparar el objeto para enviar al backend
      // Convertimos los strings de los pickers a números
      const payload = {
        nombre_animal: formValues.nombre_animal,
        id_estado_salud: parseInt(String(formValues.id_estado_salud), 10),
        // Si hay raza, la convertimos a int, si no, null
        id_raza: formValues.id_raza
          ? parseInt(String(formValues.id_raza), 10)
          : null,
        // Si hay edad, la convertimos a int, si no, null
        edad_animal: formValues.edad_animal
          ? parseInt(String(formValues.edad_animal), 10)
          : null,
        edad_aproximada: formValues.edad_aproximada || null,
        // Convertimos la URL única en un array de strings
        fotos: formValues.foto_url ? [formValues.foto_url] : [],
      };

      console.log('Enviando datos:', payload);

      const response = await createFullAnimal(payload);

      if (response.success) {
        showSuccess(
          '¡Éxito! 🎉',
          'El animal ha sido registrado correctamente.',
        );
      } else {
        // Manejo de errores del backend
        const errorMsg = response.errors
          ? response.errors.map((e: any) => e.message).join('\n')
          : response.message || 'Error desconocido al guardar.';
        showError('Error', errorMsg); // 3. Reemplazar Alert
      }
    } catch (error: any) {
      console.error(error);
      // 3. Reemplazar Alert
      showError('Error de Conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
      <View style={styles.card}>
        <AppText style={styles.title}>Registrar Nuevo Animal</AppText>
        <AppText style={styles.subtitle}>
          Completa los datos para añadir un nuevo integrante a Dogland.
        </AppText>

        <DynamicForm
          fields={formFields}
          values={formValues}
          onValueChange={handleValueChange}
          onSubmit={handleSubmit}
          loading={loading}
          buttonText="Guardar Animal"
          buttonIcon="save"
        />
      </View>
    </ScrollView>
  );
};

export default FormAgregarPerrito;

// 4. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: {
      padding: 16,
      paddingBottom: 40,
      backgroundColor: colors.background, // Dinámico
    },
    card: {
      backgroundColor: colors.cardBackground, // Dinámico
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.1 : 0.05, // Dinámico
      shadowRadius: 8,
      elevation: 2,
    },
    title: {
      fontSize: 22,
      fontWeight: fontWeightBold,
      color: colors.text, // Dinámico
      marginBottom: 4,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: colors.darkGray, // Dinámico
      marginBottom: 24,
      textAlign: 'center',
    },
  });
