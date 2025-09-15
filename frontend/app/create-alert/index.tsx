import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';

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

  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const showDatePicker = () => setPickerVisible(true);
  const hideDatePicker = () => setPickerVisible(false);

  const onConfirmDate = (date: Date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const onSubmit = (data: FormData) => {
    console.log('Datos del formulario:', {
      ...data,
      fechaExpiracion: selectedDate ? selectedDate.toISOString() : null,
    });
    alert('Formulario enviado (datos en consola)');
    reset();
    setSelectedDate(null);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.header}>Crear Nueva Alerta</Text>

      {/* Título */}
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

      {/* Descripción */}
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

      {/* Tipo de Alerta */}
      <Text style={styles.label}>Tipo de Alerta *</Text>
      <Controller
        control={control}
        name="tipoAlerta"
        rules={{ required: 'Selecciona un tipo de alerta.' }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <View
              style={[styles.pickerContainer, error ? styles.inputError : null]}
            >
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
              >
                <Picker.Item label="-- Selecciona un tipo --" value={null} />
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

      {/* Nivel de Riesgo */}
      <Text style={styles.label}>Nivel de Riesgo *</Text>
      <Controller
        control={control}
        name="nivelRiesgo"
        rules={{ required: 'Selecciona un nivel de riesgo.' }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <View
              style={[styles.pickerContainer, error ? styles.inputError : null]}
            >
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
              >
                <Picker.Item label="-- Selecciona un nivel --" value={null} />
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

      {/* Fecha de Expiración */}
      <Text style={styles.label}>Fecha y Hora de Expiración (Opcional)</Text>
      <TouchableOpacity onPress={showDatePicker} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>
          {selectedDate
            ? selectedDate.toLocaleString()
            : 'Toca para seleccionar fecha y hora'}
        </Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={pickerVisible}
        mode="datetime"
        onConfirm={onConfirmDate}
        onCancel={hideDatePicker}
        date={selectedDate || new Date()}
        minimumDate={new Date()}
      />

      {/* Ubicación */}
      <Text style={styles.label}>Ubicación Actual (Opcional)</Text>
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
        <Text style={styles.clearLocationButtonText}>Limpiar ubicación</Text>
      </TouchableOpacity>

      {/* Botón de Envío */}
      <View style={styles.submitButtonContainer}>
        <Button
          title="Crear Alerta"
          onPress={handleSubmit(onSubmit)}
          color="#007bff"
        />
      </View>
    </ScrollView>
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
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 5,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  locationButton: {
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  locationButtonText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  clearLocationButton: {
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  clearLocationButtonText: {
    color: '#dc3545',
    fontSize: 14,
  },
  submitButtonContainer: {
    marginTop: 30,
    marginBottom: 50,
    borderRadius: 8,
    overflow: 'hidden',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 5,
  },
});
