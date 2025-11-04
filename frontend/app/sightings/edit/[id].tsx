import apiClient from '@/src/api/client';
import {
    AppText,
    fontWeightBold,
    fontWeightSemiBold,
} from '@/src/components/AppText';
import { Colors } from '@/src/constants/colors';
import { Sighting } from '@/src/types/sighting';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Tipos para las opciones de los Pickers
type Option = {
  id: number;
  nombre: string;
};

// Tipo para la envoltura de la API
type ApiResponse<T> = {
  success: boolean;
  data: T;
};

// Tipo para el formulario - adaptado al backend existente
type FormData = {
  descripcion: string;
  direccion: string;
  id_especie: number | null;
  id_estado_salud: number | null;
  url?: string | null; // Cambiado a string individual para coincidir con backend
};

const EditSightingScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // --- ESTADOS ---
  const [formData, setFormData] = useState<FormData>({
    descripcion: '',
    direccion: '',
    id_especie: null,
    id_estado_salud: null,
    url: null,
  });

  const [speciesOptions, setSpeciesOptions] = useState<Option[]>([]);
  const [healthOptions, setHealthOptions] = useState<Option[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<FormData | null>(null);

  // --- EFECTOS ---

  // 1. Cargar las opciones para los Pickers
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [speciesRes, healthRes] = await Promise.all([
          apiClient.get('/especies'),
          apiClient.get('/estados-salud')
        ]);
        
        setSpeciesOptions(speciesRes.data.data);
        setHealthOptions(healthRes.data.data);
      } catch (err) {
        console.error('Error fetching options:', err);
        setError('No se pudieron cargar las opciones de selección.');
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  // 2. Cargar los datos existentes del avistamiento
  useEffect(() => {
    const fetchSighting = async () => {
      if (!id) {
        setError('ID de avistamiento no válido');
        setLoadingData(false);
        return;
      }

      try {
        const response = await apiClient.get<ApiResponse<Sighting>>(
          `/sightings/${id}`,
        );
        const sighting = response.data.data;

        // Tomar la primera foto si existe (backend maneja solo una foto)
        const firstPhoto = sighting.fotos_url && sighting.fotos_url.length > 0 
          ? sighting.fotos_url[0] 
          : null;

        const initialFormData: FormData = {
          descripcion: sighting.descripcion || '',
          direccion: sighting.direccion || '',
          id_especie: sighting.id_especie ?? null,
          id_estado_salud: sighting.id_estado_salud ?? null,
          url: firstPhoto,
        };

        setFormData(initialFormData);
        setOriginalData(initialFormData);

      } catch (err: any) {
        console.error('Error fetching sighting data:', err);
        
        if (err.response?.status === 403) {
          setError('No tienes permiso para editar este avistamiento.');
        } else if (err.response?.status === 404) {
          setError('Avistamiento no encontrado.');
        } else {
          setError('No se pudo cargar la información del avistamiento.');
        }
      } finally {
        setLoadingData(false);
      }
    };
    fetchSighting();
  }, [id]);

  // --- MANEJADORES ---

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePickerChange = (field: keyof FormData, value: number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Verificar si hay cambios en el formulario
  const hasChanges = () => {
    if (!originalData) return false;
    
    return (
      formData.descripcion !== originalData.descripcion ||
      formData.direccion !== originalData.direccion ||
      formData.id_especie !== originalData.id_especie ||
      formData.id_estado_salud !== originalData.id_estado_salud ||
      formData.url !== originalData.url
    );
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    // Validaciones básicas
    if (!formData.id_especie) {
      Alert.alert('Error', 'Por favor selecciona una especie');
      return;
    }

    if (!formData.id_estado_salud) {
      Alert.alert('Error', 'Por favor selecciona un estado de salud');
      return;
    }

    // Verificar si hay cambios
    if (!hasChanges()) {
      Alert.alert('Sin cambios', 'No has realizado ningún cambio en el avistamiento');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 🔥 PAYLOAD ADAPTADO al backend existente
      const payload = {
        id_especie: formData.id_especie,
        id_estado_salud: formData.id_estado_salud,
        descripcion: formData.descripcion,
        direccion: formData.direccion,
        url: formData.url || null, // Enviar como string individual
      };

      console.log('Enviando payload al backend:', payload);

      await apiClient.put(`/sightings/${id}`, payload);

      Alert.alert(
        'Éxito', 
        'Avistamiento actualizado correctamente',
        [{ text: 'OK', onPress: () => router.back() }]
      );

    } catch (err: any) {
      console.error('Error updating sighting:', err.response?.data || err.message);
      console.log('Status code:', err.response?.status);
      console.log('Response data:', err.response?.data);

      if (err.response?.status === 403) {
        Alert.alert(
          'Acción Prohibida',
          'No tienes permiso para editar este avistamiento.',
        );
      } else if (err.response?.status === 404) {
        Alert.alert('Error', 'El avistamiento no fue encontrado.');
      } else if (err.response?.status === 400) {
        Alert.alert('Error', 'Datos inválidos. Por favor verifica la información.');
      } else {
        Alert.alert(
          'Error del Servidor', 
          'No se pudo guardar la actualización. Intenta nuevamente.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        'Descartar cambios',
        'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Salir', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  // --- RENDER ---

  if (loadingData || loadingOptions) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <AppText style={styles.loadingText}>Cargando datos de edición...</AppText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <AppText style={styles.errorText}>{error}</AppText>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <AppText style={styles.buttonText}>Volver</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={styles.title}>Editar Avistamiento</AppText>
        
        {/* Información de solo lectura */}
        <View style={styles.infoSection}>
          <AppText style={styles.infoText}>
            Solo puedes editar avistamientos que hayas creado tú.
          </AppText>
          {hasChanges() && (
            <AppText style={styles.changesText}>Tienes cambios sin guardar</AppText>
          )}
        </View>
        
        <AppText style={styles.label}>Descripción</AppText>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={formData.descripcion}
          onChangeText={(text) => handleInputChange('descripcion', text)}
          placeholder="Describe lo que ves..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <AppText style={styles.label}>Dirección (Opcional)</AppText>
        <TextInput
          style={styles.input}
          value={formData.direccion}
          onChangeText={(text) => handleInputChange('direccion', text)}
          placeholder="Ej: Cerca del parque central"
        />

        <AppText style={styles.label}>Especie *</AppText>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.id_especie}
            onValueChange={(itemValue) =>
              handlePickerChange('id_especie', itemValue)
            }
            style={styles.picker}
            dropdownIconColor={Colors.text}
          >
            <Picker.Item label="Selecciona una especie..." value={null} />
            {speciesOptions.map((option) => (
              <Picker.Item
                key={option.id}
                label={option.nombre}
                value={option.id}
              />
            ))}
          </Picker>
        </View>

        <AppText style={styles.label}>Estado de Salud *</AppText>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.id_estado_salud}
            onValueChange={(itemValue) =>
              handlePickerChange('id_estado_salud', itemValue)
            }
            style={styles.picker}
            dropdownIconColor={Colors.text}
          >
            <Picker.Item label="Selecciona un estado..." value={null} />
            {healthOptions.map((option) => (
              <Picker.Item
                key={option.id}
                label={option.nombre}
                value={option.id}
              />
            ))}
          </Picker>
        </View>

        {/* Información de foto existente */}
        {formData.url && (
          <View style={styles.photosInfo}>
            <AppText style={styles.label}>Foto del avistamiento</AppText>
            <AppText style={styles.photoCount}>
              Hay una foto asociada a este avistamiento
            </AppText>
            <AppText style={styles.note}>
              Nota: Para cambiar la foto, contacta al administrador
            </AppText>
          </View>
        )}

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={isSubmitting}
          >
            <AppText style={[styles.buttonText, styles.cancelButtonText]}>
              Cancelar
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button, 
              styles.saveButton,
              (!hasChanges() || isSubmitting) && styles.buttonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!hasChanges() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.lightText} size="small" />
            ) : (
              <AppText style={styles.buttonText}>Guardar Cambios</AppText>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: Colors.text,
  },
  errorText: {
    color: Colors.danger,
    fontWeight: fontWeightBold,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: fontWeightBold,
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: Colors.info,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    color: Colors.text,
    fontSize: 14,
    textAlign: 'center',
  },
  changesText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: fontWeightSemiBold,
    textAlign: 'center',
    marginTop: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: fontWeightSemiBold,
    color: Colors.darkGray,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.lightText,
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.text,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: Colors.lightText,
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: Colors.text,
  },
  photosInfo: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  photoCount: {
    color: Colors.text,
    fontSize: 14,
    marginTop: 4,
  },
  note: {
    color: Colors.darkGray,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  buttonDisabled: {
    backgroundColor: Colors.darkGray,
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.lightText,
    fontSize: 16,
    fontWeight: fontWeightBold,
  },
  cancelButtonText: {
    color: Colors.text,
  },
});

export default EditSightingScreen;