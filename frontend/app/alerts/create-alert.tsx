import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { useNotification } from '@/src/components/notifications';
import { useRouter } from 'expo-router';
import { createAlert } from '../../src/api/alerts';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { useRefresh } from '@/src/contexts/RefreshContext';
import { REFRESH_KEYS } from '@/src/constants/refreshKeys';
import {
  fontWeightBold,
  AppText,
  fontWeightMedium, // Importar fontWeightMedium
  fontWeightSemiBold, // Importar fontWeightSemiBold
} from '@/src/components/AppText';
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

const MOCK_TIPOS_ALERTA = [
  { label: '-- Selecciona un tipo --', value: null },
  { label: 'Jauria', value: 1 },
  { label: 'Accidente', value: 2 },
  { label: 'Robo', value: 3 },
  { label: 'Animal Perdido', value: 4 },
  { label: 'Otro', value: 5 },
];

const MOCK_NIVELES_RIESGO = [
  { label: '-- Selecciona un nivel --', value: null },
  { label: 'Bajo', value: 1 },
  { label: 'Medio', value: 2 },
  { label: 'Alto', value: 3 },
  { label: 'Crítico', value: 4 },
];

export default function CreateAlertScreen() {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const { showError, showSuccess } = useNotification();
  const router = useRouter();
  const { triggerRefresh } = useRefresh();

  const [formValues, setFormValues] = useState({
    titulo: '',
    descripcion: '',
    tipoAlerta: null as number | null,
    nivelRiesgo: null as number | null,
    fechaExpiracion: null as Date | string | null,
    location: null as {
      latitude: number;
      longitude: number;
      address: string;
    } | null,
    direccion: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingFields, setLoadingFields] = useState<Record<string, boolean>>(
    {},
  );

  const handleValueChange = (name: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const obtenerUbicacionActual = async () => {
    try {
      setLoadingFields((prev) => ({ ...prev, location: true }));

      // Solicitar permisos
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showError('Error', 'Permiso de ubicación denegado');
        return;
      }

      // Obtener ubicación actual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Obtener dirección desde coordenadas (geocodificación inversa)
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Formatear dirección legible
      const formattedAddress = address
        ? `${address.street || ''} ${address.streetNumber || ''}, ${
            address.city || ''
          }, ${address.region || ''}`
        : `${location.coords.latitude.toFixed(
            6,
          )}, ${location.coords.longitude.toFixed(6)}`;

      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: formattedAddress.trim(),
      };

      // Actualizar tanto location como direccion
      setFormValues((prev) => ({
        ...prev,
        location: locationData,
        direccion: formattedAddress.trim(),
      }));

      showSuccess('Éxito', 'Ubicación actualizada');
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      showError('Error', 'No se pudo obtener la ubicación');
    } finally {
      setLoadingFields((prev) => ({ ...prev, location: false }));
    }
  };

  const limpiarUbicacion = () => {
    setFormValues((prev) => ({
      ...prev,
      location: null,
      direccion: '',
    }));
    showSuccess('Éxito', 'Ubicación eliminada');
  };

  const formatUbicacion = (location: any) => {
    if (!location) return null;
    return location.address || `${location.latitude}, ${location.longitude}`;
  };

  const formFields: FormField[] = [
    {
      name: 'titulo',
      label: 'Título de la Alerta *',
      placeholder: 'Ej: Perro herido en la calle principal',
      type: 'text',
      icon: 'create-outline',
      autoCapitalize: 'sentences',
    },
    {
      name: 'descripcion',
      label: 'Descripción *',
      placeholder: 'Detalles de la situación, etc.',
      type: 'text',
      icon: 'document-text-outline',
      multiline: true,
      numberOfLines: 4,
    },
    {
      name: 'tipoAlerta',
      label: 'Tipo de Alerta *',
      type: 'picker',
      icon: 'alert-circle-outline',
      options: MOCK_TIPOS_ALERTA,
    },
    {
      name: 'nivelRiesgo',
      label: 'Nivel de Riesgo *',
      type: 'picker',
      icon: 'warning-outline',
      options: MOCK_NIVELES_RIESGO,
    },
    {
      name: 'fechaExpiracion',
      label: 'Fecha y Hora de Expiración (Opcional)',
      type: 'date',
      icon: 'calendar-outline',
      placeholder: 'Toca para seleccionar fecha y hora',
      dateMode: 'datetime',
      timeStep: 5,
      minDate: new Date().toISOString().split('T')[0],
      // 4. Usar el tema dinámico
      calendarTheme: isDark ? 'dark' : 'light',
    },
    {
      name: 'location',
      label: 'Ubicación (Opcional)',
      type: 'location',
      icon: 'location-outline',
      placeholder: 'Toca para obtener tu ubicación actual',
      onLocationPress: obtenerUbicacionActual,
      onLocationClear: limpiarUbicacion,
      formatLocation: formatUbicacion,
    },
    {
      name: 'direccion',
      label: 'Dirección (opcional)',
      placeholder: 'Ej: Calle 123, Ciudad',
      type: 'text',
      icon: 'map-outline',
    },
  ];

  const handleSubmit = async (values: Record<string, any>) => {
    if (!values.tipoAlerta || !values.nivelRiesgo) {
      showError('Error', 'Debe seleccionar tipo de alerta y nivel de riesgo');
      return;
    }

    if (!values.titulo?.trim() || values.titulo.trim().length < 3) {
      showError('Error', 'El título debe tener al menos 3 caracteres');
      return;
    }

    if (!values.descripcion?.trim() || values.descripcion.trim().length < 5) {
      showError('Error', 'La descripción debe tener al menos 5 caracteres');
      return;
    }

    const payload = {
      titulo: values.titulo.trim(),
      descripcion: values.descripcion.trim(),
      id_tipo_alerta: values.tipoAlerta,
      id_nivel_riesgo: values.nivelRiesgo,
      fecha_expiracion: values.fechaExpiracion
        ? new Date(values.fechaExpiracion).toISOString()
        : null,
      latitude: values.location ? values.location.latitude : null,
      longitude: values.location ? values.location.longitude : null,
      direccion: values.location?.address || values.direccion || '',
    };

    setIsSubmitting(true);
    try {
      const newAlert = await createAlert(payload);
      console.log('CreateAlertScreen: Alerta creada con éxito:', newAlert);
      showSuccess('Éxito', 'Alerta creada con éxito!');

      triggerRefresh(REFRESH_KEYS.ALERTS);

      // Resetear formulario
      setFormValues({
        titulo: '',
        descripcion: '',
        tipoAlerta: null,
        nivelRiesgo: null,
        fechaExpiracion: null,
        location: null,
        direccion: '',
      });

      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error: any) {
      console.error('CreateAlertScreen: Error al crear alerta:', error);
      showError(
        'Error',
        `Error al crear alerta: ${
          error?.response?.data?.error || 'Inténtalo de nuevo.'
        }`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Crear Alerta"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              style={styles.backIcon} // 4. Usar estilos dinámicos
            />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity
            onPress={() => handleSubmit(formValues)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              // 4. Usar colores del tema
              <ActivityIndicator
                size="small"
                color={isDark ? colors.lightText : colors.text}
              />
            ) : (
              <Ionicons
                name="checkmark-done-outline"
                size={22}
                color={isDark ? colors.lightText : colors.text} // 4. Usar colores del tema
              />
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <AppText style={styles.sectionTitle}>Información básica</AppText>

          <DynamicForm
            fields={formFields}
            values={formValues}
            onValueChange={handleValueChange}
            onSubmit={handleSubmit}
            loading={isSubmitting}
            buttonText="Crear Alerta"
            buttonIcon="checkmark-done-outline"
            loadingFields={loadingFields}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background }, // Dinámico
    scrollContainer: { flex: 1 },
    contentContainer: { padding: 20 },
    sectionTitle: {
      fontSize: 16,
      fontWeight: fontWeightBold,
      marginBottom: 12,
      color: colors.text, // Dinámico
    },
    backIcon: {
      width: 24,
      height: 24,
      // 4. Usar colores del tema (texto oscuro sobre fondo amarillo)
      tintColor: isDark ? colors.lightText : colors.text,
    },
  });