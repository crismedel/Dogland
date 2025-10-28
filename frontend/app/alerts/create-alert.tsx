import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import * as Location from 'expo-location';
import { useNotification } from '@/src/components/notifications/NotificationContext';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import { createAlert } from '../../src/api/alerts';
import { Colors } from '@/src/constants/colors';
import CustomHeader from '@/src/components/UI/CustomHeader';
import CustomButton from '@/src/components/UI/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { useRefresh } from '@/src/contexts/RefreshContext';
import { REFRESH_KEYS } from '@/src/constants/refreshKeys';
import {
  fontWeightBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

type FormData = {
  titulo: string;
  descripcion: string;
  tipoAlerta: number | null;
  nivelRiesgo: number | null;
  fechaExpiracion: Date | null;
};

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

export default function CreateAlertScreen() {
  const { showError, showSuccess } = useNotification();
  const router = useRouter();
  const { triggerRefresh } = useRefresh(); // 🎯 Obtener función de refresh
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      titulo: '',
      descripcion: '',
      tipoAlerta: null,
      nivelRiesgo: null,
      fechaExpiracion: null,
    },
  });

  const [pickerVisible, setPickerVisible] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const showDatePicker = () => setPickerVisible(true);
  const hideDatePicker = () => setPickerVisible(false);

  const onConfirmDate = (date: Date) => {
    setValue('fechaExpiracion', date, {
      shouldDirty: true,
      shouldValidate: true,
    });
    hideDatePicker();
  };

  // Función para obtener ubicación actual
  const obtenerUbicacionActual = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showError(
          'Permiso denegado',
          'No se pudo obtener permiso para acceder a la ubicación.',
        );
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      showSuccess(
        'Ubicación obtenida',
        `Latitud: ${loc.coords.latitude.toFixed(
          4,
        )}, Longitud: ${loc.coords.longitude.toFixed(4)}`,
      );
    } catch (error) {
      showError('Error', 'No se pudo obtener la ubicación.');
      console.error('Error al obtener ubicación:', error);
    }
  };

  // Función para limpiar ubicación
  const limpiarUbicacion = () => {
    setLocation(null);
  };

  const onSubmit = async (data: FormData) => {
    if (!data.tipoAlerta || !data.nivelRiesgo) {
      showError('Error', 'Debe seleccionar tipo de alerta y nivel de riesgo');
      return;
    }

    const payload = {
      titulo: data.titulo.trim(),
      descripcion: data.descripcion.trim(),
      id_tipo_alerta: data.tipoAlerta,
      id_nivel_riesgo: data.nivelRiesgo,
      fecha_expiracion: data.fechaExpiracion
        ? data.fechaExpiracion.toISOString()
        : null,
      latitude: location ? location.latitude : null,
      longitude: location ? location.longitude : null,
      direccion: '',
    };

    try {
      const newAlert = await createAlert(payload);
      console.log('CreateAlertScreen: Alerta creada con éxito:', newAlert);
      showSuccess('Éxito', 'Alerta creada con éxito!');

      // 🎯 Disparar refresh para actualizar la lista de alertas
      triggerRefresh(REFRESH_KEYS.ALERTS);

      reset(); // limpia formulario
      limpiarUbicacion();

      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error('CreateAlertScreen: Error al crear alerta:', error);
      showError(
        'Error',
        `Error al crear alerta: ${
          error?.response?.data?.error || 'Inténtalo de nuevo.'
        }`,
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header con back + título + acción enviar */}
      <CustomHeader
        title="Crear Alerta"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              style={{ width: 24, height: 24, tintColor: '#fff' }}
            />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Ionicons name="checkmark-done-outline" size={22} color="#fff" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Datos básicos */}
        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>Información básica</AppText>

          <AppText style={styles.label}>Título de la Alerta *</AppText>
          <Controller
            control={control}
            name="titulo"
            rules={{
              required: 'El título es obligatorio.',
              minLength: { value: 3, message: 'Mínimo 3 caracteres.' },
            }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  style={[styles.input, error ? styles.inputError : null]}
                  placeholder="Ej: Perro herido en la calle principal"
                  value={value}
                  onChangeText={onChange}
                />
                {error && (
                  <AppText style={styles.errorText}>{error.message}</AppText>
                )}
              </>
            )}
          />

          <AppText style={styles.label}>Descripción *</AppText>
          <Controller
            control={control}
            name="descripcion"
            rules={{
              required: 'La descripción es obligatoria.',
              minLength: { value: 5, message: 'Mínimo 5 caracteres.' },
            }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  style={[
                    styles.input,
                    styles.textarea,
                    error ? styles.inputError : null,
                  ]}
                  placeholder="Detalles de la situación, etc."
                  multiline
                  numberOfLines={4}
                  value={value}
                  onChangeText={onChange}
                />
                {error && (
                  <AppText style={styles.errorText}>{error.message}</AppText>
                )}
              </>
            )}
          />
        </View>

        {/* Configuración de la alerta */}
        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>
            Configuración de la alerta
          </AppText>

          <AppText style={styles.label}>Tipo de Alerta *</AppText>
          <Controller
            control={control}
            name="tipoAlerta"
            rules={{ required: 'Selecciona un tipo de alerta.' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <View
                  style={[
                    styles.pickerContainer,
                    error ? styles.inputError : null,
                  ]}
                >
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={styles.picker}
                  >
                    <Picker.Item
                      label="-- Selecciona un tipo --"
                      value={null}
                    />
                    {MOCK_TIPOS_ALERTA.map((tipo) => (
                      <Picker.Item
                        key={tipo.id}
                        label={tipo.nombre}
                        value={tipo.id}
                      />
                    ))}
                  </Picker>
                </View>
                {error && (
                  <AppText style={styles.errorText}>{error.message}</AppText>
                )}
              </>
            )}
          />

          <AppText style={styles.label}>Nivel de Riesgo *</AppText>
          <Controller
            control={control}
            name="nivelRiesgo"
            rules={{ required: 'Selecciona un nivel de riesgo.' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <View
                  style={[
                    styles.pickerContainer,
                    error ? styles.inputError : null,
                  ]}
                >
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={styles.picker}
                  >
                    <Picker.Item
                      label="-- Selecciona un nivel --"
                      value={null}
                    />
                    {MOCK_NIVELES_RIESGO.map((nivel) => (
                      <Picker.Item
                        key={nivel.id}
                        label={nivel.nombre}
                        value={nivel.id}
                      />
                    ))}
                  </Picker>
                </View>
                {error && (
                  <AppText style={styles.errorText}>{error.message}</AppText>
                )}
              </>
            )}
          />

          <AppText style={styles.label}>
            Fecha y Hora de Expiración (Opcional)
          </AppText>
          <Controller
            control={control}
            name="fechaExpiracion"
            render={({ field: { value } }) => (
              <>
                <TouchableOpacity
                  onPress={() => setPickerVisible(true)}
                  style={styles.dateButton}
                >
                  <AppText style={styles.dateButtonText}>
                    {value
                      ? value.toLocaleString()
                      : 'Toca para seleccionar fecha y hora'}
                  </AppText>
                </TouchableOpacity>
              </>
            )}
          />
        </View>

        {/* Ubicación */}
        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>Ubicación</AppText>

          <TouchableOpacity
            style={styles.locationButton}
            onPress={obtenerUbicacionActual}
          >
            <AppText style={styles.locationButtonText}>
              Obtener mi ubicación actual
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearLocationButton}
            onPress={limpiarUbicacion}
          >
            <AppText style={styles.clearLocationButtonText}>
              Limpiar ubicación
            </AppText>
          </TouchableOpacity>

          {location && (
            <View style={{ marginTop: 10 }}>
              <AppText>
                Latitud: {location.latitude.toFixed(6)}, Longitud:{' '}
                {location.longitude.toFixed(6)}
              </AppText>
            </View>
          )}
        </View>

        {/* Botón principal con CustomButton */}
        <CustomButton
          title="Crear Alerta"
          onPress={handleSubmit(onSubmit)}
          variant="primary"
          icon="checkmark-done-outline"
          loading={isSubmitting}
          disabled={isSubmitting}
          style={{ marginTop: 10, paddingVertical: 14 }}
        />

        <DateTimePickerModal
          isVisible={pickerVisible}
          mode="datetime"
          onConfirm={onConfirmDate}
          onCancel={hideDatePicker}
          date={new Date()}
          minimumDate={new Date()}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContainer: { flex: 1 },
  contentContainer: { padding: 20 },

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
    fontSize: 14,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },

  inputError: {
    borderColor: Colors.danger,
    borderWidth: 2,
    backgroundColor: '#fff5f5',
  },

  textarea: { minHeight: 90, textAlignVertical: 'top' },

  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
    overflow: 'hidden',
  },

  picker: { height: 50, width: '100%' },

  dateButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  dateButtonText: { color: '#555', fontSize: 14 },

  locationButton: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#90caf9',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  locationButtonText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },

  clearLocationButton: {
    alignSelf: 'flex-end',
    marginBottom: 15,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearLocationButtonText: {
    color: Colors.danger,
    fontSize: 12,
    textDecorationLine: 'underline',
  },

  submitButton: {
    backgroundColor: Colors.background,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: fontWeightBold,
    fontSize: 16,
  },

  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
    fontStyle: 'italic',
  },
});
