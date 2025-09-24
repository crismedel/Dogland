import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import { createAlert } from '../../src/api/alerts';

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
  const { control, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      titulo: '',
      descripcion: '',
      tipoAlerta: null,
      nivelRiesgo: null,
      fechaExpiracion: null,
    },
  });
  const router = useRouter();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const showDatePicker = () => setPickerVisible(true);
  const hideDatePicker = () => setPickerVisible(false);

  const onConfirmDate = (date: Date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const onSubmit = async (data: FormData) => {
    if (!data.tipoAlerta || !data.nivelRiesgo) {
      alert('Debe seleccionar tipo de alerta y nivel de riesgo');
      return;
    }

    const payload = {
      titulo: data.titulo,
      descripcion: data.descripcion,
      id_tipo_alerta: data.tipoAlerta,
      id_nivel_riesgo: data.nivelRiesgo,
      fecha_expiracion: selectedDate ? selectedDate.toISOString() : null,
      id_usuario: 1, // <-- Aquí agregas el id_usuario fijo
      latitude: null, // o el valor que obtengas
      longitude: null, // o el valor que obtengas
      direccion: '', // o el valor que obtengas
    };

    console.log('CreateAlertScreen: Payload a enviar:', payload);
    try {
      const newAlert = await createAlert(payload);
      console.log('CreateAlertScreen: Alerta creada con éxito:', newAlert);
      alert('Alerta creada con éxito!');
      reset();
      setSelectedDate(null);
      // router.back() o navegar a la lista de alertas
    } catch (error: any) {
      console.error('CreateAlertScreen: Error al crear alerta:', error);
      alert(
        `Error al crear alerta: ${
          error.response?.data?.error || 'Inténtalo de nuevo.'
        }`,
      );
    }
  };

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

        {/* Título centrado */}
        <Text style={styles.headerTitle}>Crear Alerta</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Datos básicos */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Información básica</Text>

          <Text style={styles.label}>Título de la Alerta *</Text>
          <Controller
            control={control}
            name="titulo"
            rules={{ required: 'El título es obligatorio.' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  style={[styles.input, error ? styles.inputError : null]}
                  placeholder="Ej: Perro herido en la calle principal"
                  value={value}
                  onChangeText={onChange}
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />

          <Text style={styles.label}>Descripción *</Text>
          <Controller
            control={control}
            name="descripcion"
            rules={{ required: 'La descripción es obligatoria.' }}
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
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />
        </View>

        {/* Configuración de la alerta */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Configuración de la alerta</Text>

          <Text style={styles.label}>Tipo de Alerta *</Text>
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
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />

          <Text style={styles.label}>Nivel de Riesgo *</Text>
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
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />

          <Text style={styles.label}>
            Fecha y Hora de Expiración (Opcional)
          </Text>
          <TouchableOpacity onPress={showDatePicker} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>
              {selectedDate
                ? selectedDate.toLocaleString()
                : 'Toca para seleccionar fecha y hora'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ubicación */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ubicación</Text>

          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => alert('Funcionalidad de ubicación deshabilitada')}
          >
            <Text style={styles.locationButtonText}>
              Obtener mi ubicación actual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearLocationButton}
            onPress={() => alert('Funcionalidad de ubicación deshabilitada')}
          >
            <Text style={styles.clearLocationButtonText}>
              Limpiar ubicación
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botón de envío */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.submitButtonText}>Crear Alerta</Text>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={pickerVisible}
          mode="datetime"
          onConfirm={onConfirmDate}
          onCancel={hideDatePicker}
          date={selectedDate || new Date()}
          minimumDate={new Date()}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },

  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fbbf24',
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },

  // Form styles
  label: {
    fontWeight: '600',
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
    borderColor: '#dc3545',
    borderWidth: 2,
    backgroundColor: '#fff5f5',
  },

  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
    overflow: 'hidden',
  },

  picker: {
    height: 50,
    width: '100%',
  },

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

  dateButtonText: {
    color: '#555',
    fontSize: 14,
  },

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
    color: '#dc3545',
    fontSize: 12,
    textDecorationLine: 'underline',
  },

  submitButton: {
    backgroundColor: '#fbbf24',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
    fontStyle: 'italic',
  },
});
