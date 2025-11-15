import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { fetchAlertById, updateAlert } from '../../src/api/alerts';
import type { Alert as AlertTypeFromAPI } from '../../src/types/alert';
import { useNotification } from '@/src/components/notifications';
import { useRefresh } from '@/src/contexts/RefreshContext';
import { REFRESH_KEYS } from '@/src/constants/refreshKeys';
import { Colors } from '@/src/constants/colors';
import { AppText } from '@/src/components/AppText';
import CustomHeader from '@/src/components/UI/CustomHeader';
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';

const MOCK_TIPOS_ALERTA = [
  { id: 1, nombre: 'Jauria' },
  { id: 2, nombre: 'Accidente' },
  { id: 3, nombre: 'Robo' },
  { id: 4, nombre: 'Animal Perdido' },
  { id: 5, nombre: 'Otro' },
];

const MOCK_NIVELES_RIESGO = [
  { id: 1, nombre: 'Bajo' },
  { id: 2, nombre: 'Medio' },
  { id: 3, nombre: 'Alto' },
  { id: 4, nombre: 'Crítico' },
];

export default function EditAlertScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { showError, showSuccess } = useNotification();
  const { triggerRefresh } = useRefresh();

  const [values, setValues] = useState<Record<string, any>>({
    titulo: '',
    descripcion: '',
    direccion: '',
    tipoAlerta: null,
    nivelRiesgo: null,
    fechaExpiracion: null,
    activa: true,
    location: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingFields, setLoadingFields] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    const loadAlert = async () => {
      try {
        setLoading(true);
        const alertData: AlertTypeFromAPI = await fetchAlertById(Number(id));

        const tipoObj = MOCK_TIPOS_ALERTA.find(
          (t) => t.nombre === alertData.tipo,
        );
        const nivelObj = MOCK_NIVELES_RIESGO.find(
          (n) =>
            n.nombre.toLowerCase() === alertData.nivel_riesgo.toLowerCase(),
        );

        // Construir objeto de ubicación si existe
        const locationData =
          alertData.latitude && alertData.longitude
            ? {
                latitude: alertData.latitude,
                longitude: alertData.longitude,
                address: alertData.direccion ?? '',
              }
            : null;

        setValues({
          titulo: alertData.titulo,
          descripcion: alertData.descripcion,
          direccion: alertData.direccion ?? '',
          tipoAlerta: tipoObj ? tipoObj.id : null,
          nivelRiesgo: nivelObj ? nivelObj.id : null,
          fechaExpiracion: alertData.fecha_expiracion
            ? new Date(alertData.fecha_expiracion)
            : null,
          activa: alertData.activa,
          location: locationData,
        });
      } catch (e) {
        showError('Error', 'No se pudo cargar la alerta');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    if (id) loadAlert();
  }, [id]);

  const handleValueChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationPress = async () => {
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

      // Obtener dirección desde coordenadas
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

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

      setValues((prev) => ({
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

  const handleLocationClear = () => {
    setValues((prev) => ({
      ...prev,
      location: null,
      direccion: '',
    }));
    showSuccess('Éxito', 'Ubicación eliminada');
  };

  const formatLocation = (location: any) => {
    if (!location) return null;
    return location.address || `${location.latitude}, ${location.longitude}`;
  };

  const handleSave = async (formValues: Record<string, any>) => {
    if (!formValues.tipoAlerta || !formValues.nivelRiesgo) {
      showError('Error', 'Debe seleccionar tipo de alerta y nivel de riesgo');
      return;
    }

    const updatedData = {
      titulo: formValues.titulo,
      descripcion: formValues.descripcion,
      id_tipo_alerta: formValues.tipoAlerta,
      id_nivel_riesgo: formValues.nivelRiesgo,
      fecha_expiracion: formValues.fechaExpiracion
        ? new Date(formValues.fechaExpiracion).toISOString()
        : undefined,
      activa: formValues.activa,
      latitude: formValues.location?.latitude ?? null,
      longitude: formValues.location?.longitude ?? null,
      direccion: formValues.location?.address || formValues.direccion || '',
    };

    try {
      setSaving(true);
      await updateAlert(Number(id), updatedData);
      showSuccess('Éxito', 'Alerta actualizada');
      triggerRefresh(REFRESH_KEYS.ALERTS);

      setTimeout(() => {
        router.back();
      }, 500);
    } catch (e: any) {
      console.error('EditAlertScreen: Error al actualizar alerta:', e);
      const message =
        e?.response?.data?.error || 'No se pudo actualizar la alerta';
      showError('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const formFields: FormField[] = [
    {
      name: 'titulo',
      label: 'Título',
      placeholder: 'Ingrese el título de la alerta',
      type: 'text',
      icon: 'alert-circle-outline',
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      placeholder: 'Describa la alerta',
      type: 'text',
      multiline: true,
      numberOfLines: 4,
      icon: 'document-text-outline',
    },
    {
      name: 'location',
      label: 'Ubicación',
      placeholder: 'Toca para obtener ubicación actual',
      type: 'location',
      icon: 'location-outline',
      onLocationPress: handleLocationPress,
      onLocationClear: handleLocationClear,
      formatLocation: formatLocation,
    },
    {
      name: 'direccion',
      label: 'Dirección (opcional)',
      placeholder: 'Ej: Calle 123, Ciudad',
      type: 'text',
      icon: 'map-outline',
    },
    {
      name: 'tipoAlerta',
      label: 'Tipo de Alerta',
      type: 'picker',
      icon: 'warning-outline',
      options: MOCK_TIPOS_ALERTA.map((t) => ({
        label: t.nombre,
        value: t.id,
      })),
    },
    {
      name: 'nivelRiesgo',
      label: 'Nivel de Riesgo',
      type: 'picker',
      icon: 'speedometer-outline',
      options: MOCK_NIVELES_RIESGO.map((n) => ({
        label: n.nombre,
        value: n.id,
      })),
    },
    {
      name: 'fechaExpiracion',
      label: 'Fecha de Expiración',
      placeholder: 'Seleccionar fecha',
      type: 'date',
      dateMode: 'date',
      icon: 'calendar-outline',
      calendarTheme: 'light',
    },
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <AppText>Cargando alerta...</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Editar Alerta"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View>
          <DynamicForm
            fields={formFields}
            values={values}
            onValueChange={handleValueChange}
            onSubmit={handleSave}
            loading={saving}
            loadingFields={loadingFields}
            buttonText="Guardar Cambios"
            buttonIcon="save-outline"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
});
