import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchAlertById, updateAlert } from '../../src/api/alerts';
import type { Alert as AlertTypeFromAPI } from '../../src/types/alert';
import { useNotification } from '@/src/components/notifications/NotificationContext';
import { useRefresh } from '@/src/contexts/RefreshContext';
import { REFRESH_KEYS } from '@/src/constants/refreshKeys';
import { Colors } from '@/src/constants/colors';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

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

  const [titulo, setTitulo] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [direccion, setDireccion] = useState<string>('');

  const [tipoAlerta, setTipoAlerta] = useState<number | null>(null);
  const [nivelRiesgo, setNivelRiesgo] = useState<number | null>(null);

  const [fechaExpiracion, setFechaExpiracion] = useState<string | null>(null);
  const [activa, setActiva] = useState<boolean>(true);

  const [loading, setLoading] = useState(true);
  const [showDate, setShowDate] = useState(false);

  useEffect(() => {
    const loadAlert = async () => {
      try {
        setLoading(true);
        const alertData: AlertTypeFromAPI = await fetchAlertById(Number(id));

        setTitulo(alertData.titulo);
        setDescripcion(alertData.descripcion);
        setLatitude(alertData.latitude ?? null);
        setLongitude(alertData.longitude ?? null);
        setDireccion(alertData.direccion ?? '');

        const tipoObj = MOCK_TIPOS_ALERTA.find(
          (t) => t.nombre === alertData.tipo,
        );
        const nivelObj = MOCK_NIVELES_RIESGO.find(
          (n) =>
            n.nombre.toLowerCase() === alertData.nivel_riesgo.toLowerCase(),
        );

        setTipoAlerta(tipoObj ? tipoObj.id : null);
        setNivelRiesgo(nivelObj ? nivelObj.id : null);

        setFechaExpiracion(alertData.fecha_expiracion || null);
        setActiva(alertData.activa);
      } catch (e) {
        showError('Error', 'No se pudo cargar la alerta');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    if (id) loadAlert();
  }, [id]);

  const handleSave = async () => {
    if (!tipoAlerta || !nivelRiesgo) {
      showError('Error', 'Debe seleccionar tipo de alerta y nivel de riesgo');
      return;
    }

    const updatedData = {
      titulo,
      descripcion,
      id_tipo_alerta: tipoAlerta,
      id_nivel_riesgo: nivelRiesgo,
      fecha_expiracion: fechaExpiracion ?? undefined,
      activa,
      latitude,
      longitude,
      direccion,
    };

    console.log('EditAlertScreen: ID de alerta a actualizar:', id);
    console.log(
      'EditAlertScreen: Datos a enviar para actualizar:',
      updatedData,
    );

    try {
      await updateAlert(Number(id), updatedData);
      showSuccess('Éxito', 'Alerta actualizada');

      // 🎯 Disparar refresh para actualizar todas las pantallas que muestran alertas
      triggerRefresh(REFRESH_KEYS.ALERTS);

      // Esperar un momento antes de volver para que el usuario vea el mensaje
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (e: any) {
      console.error('EditAlertScreen: Error al actualizar alerta:', e);
      const message =
        e?.response?.data?.error || 'No se pudo actualizar la alerta';
      showError('Error', message);
    }
  };
  if (loading) {
    return (
      <View style={styles.center}>
        <AppText>Cargando alerta...</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con back + título */}
      <View style={styles.header}>
        {/* Botón volver */}
        <TouchableOpacity
          style={styles.backButtonHeader}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Image
            source={require('../../assets/images/volver.png')}
            style={styles.backIconHeader}
          />
        </TouchableOpacity>

        {/* Título centrado con contador de alertas */}
        <AppText style={styles.headerTitle}>Editar Alerta</AppText>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Datos básicos */}
        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>Datos básicos</AppText>
          <AppText style={styles.label}>Título *</AppText>
          <TextInput
            value={titulo}
            onChangeText={setTitulo}
            style={styles.input}
          />

          <AppText style={styles.label}>Descripción *</AppText>
          <TextInput
            value={descripcion}
            onChangeText={setDescripcion}
            style={[styles.input, styles.textarea]}
            multiline
          />
        </View>

        {/* Ubicación */}
        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>Ubicación</AppText>
          <TextInput
            value={direccion}
            onChangeText={setDireccion}
            placeholder="Ej: Calle 123, Ciudad"
            style={styles.input}
          />
        </View>

        {/* Configuración */}
        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>
            Configuración de la alerta
          </AppText>

          <AppText style={styles.label}>Tipo de Alerta *</AppText>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={tipoAlerta}
              onValueChange={(val) => setTipoAlerta(val)}
            >
              {MOCK_TIPOS_ALERTA.map((t) => (
                <Picker.Item key={t.id} label={t.nombre} value={t.id} />
              ))}
            </Picker>
          </View>

          <AppText style={styles.label}>Nivel de Riesgo *</AppText>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={nivelRiesgo}
              onValueChange={(val) => setNivelRiesgo(val)}
            >
              {MOCK_NIVELES_RIESGO.map((n) => (
                <Picker.Item key={n.id} label={n.nombre} value={n.id} />
              ))}
            </Picker>
          </View>

          <AppText style={styles.label}>Fecha de Expiración</AppText>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDate(true)}
          >
            <AppText style={styles.dateButtonText}>
              {fechaExpiracion
                ? new Date(fechaExpiracion).toLocaleDateString()
                : 'Seleccionar fecha'}
            </AppText>
          </TouchableOpacity>

          {showDate && (
            <DateTimePicker
              value={fechaExpiracion ? new Date(fechaExpiracion) : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDate(false);
                if (date) setFechaExpiracion(date.toISOString());
              }}
            />
          )}

          <View style={styles.switchRow}>
            <AppText style={styles.label}>¿Activa?</AppText>
            <Switch value={activa} onValueChange={setActiva} />
          </View>
        </View>

        {/* Botón guardar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <AppText style={styles.saveButtonText}>💾 Guardar Cambios</AppText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  contentContainer: {
    padding: 20,
  },

  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: fontWeightBold,
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  backButtonHeader: {
    padding: 6,
  },
  backIconHeader: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },

  // Card styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: fontWeightBold,
    marginBottom: 12,
    color: '#333',
  },

  // Form styles
  label: {
    fontWeight: fontWeightMedium,
    marginTop: 10,
    marginBottom: 6,
    color: '#444',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 8,
  },

  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },

  dateButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },

  dateButtonText: {
    color: '#555',
    fontSize: 14,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  saveButton: {
    backgroundColor: Colors.background,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  saveButtonText: {
    color: '#fff',
    fontWeight: fontWeightBold,
    fontSize: 16,
  },

  // Loading state
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
