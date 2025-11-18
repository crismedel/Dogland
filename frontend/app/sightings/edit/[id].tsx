import apiClient from '@/src/api/client';
import {
  AppText,
  fontWeightBold,
  fontWeightMedium,
  fontWeightSemiBold,
} from '@/src/components/AppText';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import {
  obtenerColorMarcador,
  obtenerNombreEspecie,
  obtenerNombreEstadoSalud,
} from '@/src/types/report';
import { Sighting } from '@/src/types/sighting';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import MapView, { Marker, Region } from 'react-native-maps';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

const { width } = Dimensions.get('window');

// --- TIPOS ---
type Option = {
  id: number;
  nombre: string;
};
type ApiResponse<T> = {
  success: boolean;
  data: T;
};
type Ubicacion = {
  latitude: number;
  longitude: number;
};
type FormData = {
  descripcion: string;
  direccion: string;
  id_especie: number | null;
  id_estado_salud: number | null;
  id_estado_avistamiento: number | null;
  ubicacion: Ubicacion | null;
  url?: string | null;
};

// --- COMPONENTE ---
const EditSightingScreen = () => {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const { id } = useLocalSearchParams();
  const router = useRouter();

  // --- ESTADOS ---
  const [formData, setFormData] = useState<FormData>({
    descripcion: '',
    direccion: '',
    id_especie: null,
    id_estado_salud: null,
    id_estado_avistamiento: null,
    ubicacion: null,
    url: null,
  });

  // Estados para las opciones de los dropdowns - ahora usando las funciones de report.ts
  const [speciesOptions, setSpeciesOptions] = useState<any[]>([]);
  const [healthOptions, setHealthOptions] = useState<any[]>([]);
  const [sightingStatusOptions, setSightingStatusOptions] = useState<any[]>([]);

  const [loadingData, setLoadingData] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<FormData | null>(null);

  const [canEdit, setCanEdit] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Estados para dropdowns
  const [openEspecie, setOpenEspecie] = useState(false);
  const [openEstadoSalud, setOpenEstadoSalud] = useState(false);
  const [openEstadoAvistamiento, setOpenEstadoAvistamiento] = useState(false);

  // Ubicación inicial del mapa
  const initialMapRegion: Region = {
    latitude: -38.7396,
    longitude: -72.5984,
    latitudeDelta: 15.0,
    longitudeDelta: 15.0,
  };

  // --- EFECTOS ---

  // 1. Cargar información del usuario actual
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userResponse = await apiClient.get('/auth/me'); // Ajusta esta ruta según tu API
        const userData = userResponse.data.data;

        setCurrentUserId(userData.id);
        setIsAdmin(userData.rol === 'admin'); // Ajusta según cómo manejes los roles
      } catch (err) {
        console.error('Error fetching current user:', err);
        // Si hay error al obtener el usuario, no permitir edición
        setCanEdit(false);
      }
    };
    fetchCurrentUser();
  }, []);

  // 2. Cargar las opciones para los dropdowns
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [speciesRes, healthRes, statusRes] = await Promise.all([
          apiClient.get('/especies'),
          apiClient.get('/estados-salud'),
          apiClient.get('/estados-avistamiento'),
        ]);
        // Para especies - usar obtenerNombreEspecie
        const especiesFormateadas = speciesRes.data.data.map((item: Option) => ({
          label: obtenerNombreEspecie(item.id), // Usar la función de report.ts
          value: item.id,
        }));

        // Para estados de salud - usar obtenerNombreEstadoSalud
        const estadosSaludFormateados = healthRes.data.data.map(
          (item: Option) => ({
            label: obtenerNombreEstadoSalud(item.id), // Usar la función de report.ts
            value: item.id,
          }),
        );

        // Para estados de avistamiento - usar el nombre de la API
        const estadosAvistamientoFormateados = statusRes.data.data.map(
          (item: Option) => ({
            label: item.nombre, // Usar nombre directo de la API
            value: item.id,
          }),
        );

        setSpeciesOptions(especiesFormateadas);
        setHealthOptions(estadosSaludFormateados);
        setSightingStatusOptions(estadosAvistamientoFormateados);
      } catch (err) {
        console.error('Error fetching options:', err);
        setError('No se pudieron cargar las opciones de selección.');
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  // 3. Cargar los datos existentes del avistamiento y verificar permisos
  useEffect(() => {
    const fetchSighting = async () => {
      if (!id || Array.isArray(id)) {
        setError('ID de avistamiento no válido');
        setLoadingData(false);
        return;
      }

      try {
        const response = await apiClient.get<ApiResponse<Sighting>>(
          `/sightings/${id}`,
        );
        const sighting = response.data.data;

        const firstPhoto =
          sighting.fotos_url && sighting.fotos_url.length > 0
            ? sighting.fotos_url[0]
            : null;

        const currentLocation =
          sighting.latitude && sighting.longitude
            ? { latitude: sighting.latitude, longitude: sighting.longitude }
            : null;

        const initialFormData: FormData = {
          descripcion: sighting.descripcion || '',
          direccion: sighting.direccion || '',
          id_especie: sighting.id_especie ?? null,
          id_estado_salud: sighting.id_estado_salud ?? null,
          id_estado_avistamiento: sighting.id_estado_avistamiento ?? null,
          ubicacion: currentLocation,
          url: firstPhoto,
        };

        setFormData(initialFormData);
        setOriginalData(initialFormData);

        // VERIFICAR SI EL USUARIO ACTUAL PUEDE EDITAR
        // Esperar a que tengamos tanto el usuario actual como los datos del avistamiento
        if (currentUserId !== null) {
          const userCanEdit =
            isAdmin || (sighting as any).id_usuario === currentUserId; // Asumiendo que 'id_usuario' viene en Sighting
          setCanEdit(userCanEdit);

          if (!userCanEdit) {
            setError('No tienes permisos para editar este avistamiento.');
          }
        }
      } catch (err: any) {
        console.error('Error fetching sighting data:', err);
        if (err.response?.status === 403) {
          setError('No tienes permiso para editar este avistamiento.');
          setCanEdit(false);
        } else if (err.response?.status === 404) {
          setError('Avistamiento no encontrado.');
        } else {
          setError('No se pudo cargar la información del avistamiento.');
        }
      } finally {
        setLoadingData(false);
      }
    };

    // Solo cargar el avistamiento si tenemos el ID
    if (id) {
      fetchSighting();
    }
  }, [id, currentUserId, isAdmin]);

  // --- MANEJADORES ---

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (!canEdit) return; // Prevenir cambios si no tiene permisos
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMapPress = (e: any) => {
    if (!canEdit) return; //  Prevenir cambios si no tiene permisos
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setFormData((prev) => ({
      ...prev,
      ubicacion: { latitude, longitude },
    }));
  };

  const hasChanges = () => {
    if (!originalData || !canEdit) return false;

    const ubicacionChanged =
      JSON.stringify(formData.ubicacion) !==
      JSON.stringify(originalData.ubicacion);

    return (
      formData.descripcion !== originalData.descripcion ||
      formData.direccion !== originalData.direccion ||
      formData.id_especie !== originalData.id_especie ||
      formData.id_estado_salud !== originalData.id_estado_salud ||
      formData.id_estado_avistamiento !==
        originalData.id_estado_avistamiento ||
      ubicacionChanged
    );
  };

  const handleSubmit = async () => {
    if (isSubmitting || !canEdit) return;

    if (
      !formData.id_especie ||
      !formData.id_estado_salud ||
      !formData.id_estado_avistamiento
    ) {
      Alert.alert('Error', 'Por favor completa todos los campos con *');
      return;
    }
    if (!formData.ubicacion) {
      Alert.alert('Error', 'Por favor selecciona una ubicación en el mapa');
      return;
    }

    if (!hasChanges()) {
      Alert.alert('Sin cambios', 'No has realizado ningún cambio');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        id_especie: formData.id_especie,
        id_estado_salud: formData.id_estado_salud,
        id_estado_avistamiento: formData.id_estado_avistamiento,
        descripcion: formData.descripcion,
        direccion: formData.direccion,
        ubicacion: formData.ubicacion,
      };

      console.log('Enviando payload al backend:', payload);

      await apiClient.put(`/sightings/${id}`, payload);

      Alert.alert(
        'Éxito',
        'Avistamiento actualizado correctamente',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (err: any) {
      console.error(
        'Error updating sighting:',
        err.response?.data || err.message,
      );
      if (err.response?.status === 403) {
        Alert.alert(
          'Acción Prohibida',
          'No tienes permiso para editar esto.',
        );
      } else if (err.response?.status === 404) {
        Alert.alert('Error', 'El avistamiento no fue encontrado.');
      } else if (err.response?.status === 400) {
        Alert.alert(
          'Error',
          'Datos inválidos. Por favor verifica la información.',
        );
      } else {
        Alert.alert(
          'Error del Servidor',
          'No se pudo guardar la actualización.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // 4. Actualizar getMarkerColor para usar 'colors'
  const getMarkerColor = () => {
    if (formData.id_estado_salud) {
      return obtenerColorMarcador(formData.id_estado_salud);
    }
    return colors.accent;
  };

  // --- RENDER ---

  if (loadingData || loadingOptions) {
    return (
      <View style={styles.centered}>
        {/* 4. Usar colores del tema */}
        <ActivityIndicator size="large" color={colors.accent} />
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

  // Define la región del mapa
  const mapRegion: Region = formData.ubicacion
    ? {
        ...formData.ubicacion,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : initialMapRegion;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <AppText style={styles.title}>Editar Avistamiento</AppText>

            <View style={styles.infoSection}>
              <AppText style={styles.infoText}>
                {canEdit
                  ? 'Puedes editar la ubicación, descripción y estados del avistamiento.'
                  : 'Solo el usuario que creó este avistamiento o un administrador pueden editarlo.'}
              </AppText>
              {hasChanges() && canEdit && (
                <AppText style={styles.changesText}>
                  Tienes cambios sin guardar
                </AppText>
              )}
              {!canEdit && (
                <AppText style={styles.warningText}>
                  Solo lectura - No tienes permisos de edición
                </AppText>
              )}
            </View>

            {/* --- MAPA --- */}
            <AppText style={styles.label}>Ubicación *</AppText>
            <AppText style={styles.note}>
              {canEdit
                ? 'Toca el mapa para (re)ubicar el marcador'
                : 'Ubicación del avistamiento'}
            </AppText>
            <MapView
              style={styles.map}
              initialRegion={mapRegion}
              onPress={canEdit ? handleMapPress : undefined} // Solo permite interacción si puede editar
              showsUserLocation
              scrollEnabled={canEdit} // Solo permite scroll si puede editar
              zoomEnabled={canEdit} // Solo permite zoom si puede editar
            >
              {formData.ubicacion && (
                <Marker
                  coordinate={formData.ubicacion}
                  pinColor={getMarkerColor()}
                />
              )}
            </MapView>

            <AppText style={styles.label}>Dirección (Opcional)</AppText>
            <TextInput
              style={[styles.textInput, !canEdit && styles.disabledInput]}
              value={formData.direccion}
              onChangeText={(text) => handleInputChange('direccion', text)}
              placeholder="Ej: Cerca del parque central"
              editable={canEdit} // 🔥 Solo editable si tiene permisos
              placeholderTextColor={colors.darkGray}
            />

            <AppText style={styles.label}>Descripción</AppText>
            <TextInput
              style={[
                styles.textInput,
                styles.inputMultiline,
                !canEdit && styles.disabledInput,
              ]}
              value={formData.descripcion}
              onChangeText={(text) => handleInputChange('descripcion', text)}
              placeholder="Describe lo que ves..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={canEdit} //  Solo editable si tiene permisos
              placeholderTextColor={colors.darkGray}
            />

            {/* --- ESTADO AVISTAMIENTO --- */}
            <View
              style={[
                styles.inputContainer,
                Platform.OS === 'ios' && { zIndex: 3000 },
              ]}
            >
              <AppText style={styles.label}>Estado del Avistamiento *</AppText>
              <DropDownPicker
                open={openEstadoAvistamiento}
                value={formData.id_estado_avistamiento}
                items={sightingStatusOptions}
                setOpen={canEdit ? setOpenEstadoAvistamiento : () => {}} //  Solo abre si puede editar
                setValue={(callback) => {
                  if (!canEdit) return;
                  const value = callback(formData.id_estado_avistamiento);
                  setFormData((prev) => ({
                    ...prev,
                    id_estado_avistamiento: value,
                  }));
                }}
                placeholder="Selecciona un estado..."
                style={[styles.dropdownStyle, !canEdit && styles.disabledInput]}
                dropDownContainerStyle={styles.dropdownContainerStyle}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                disabled={!canEdit} //  Deshabilitado si no puede editar
                theme={isDark ? 'DARK' : 'LIGHT'}
              />
            </View>

            {/* --- ESPECIE --- */}
            <View
              style={[
                styles.inputContainer,
                Platform.OS === 'ios' && { zIndex: 2000 },
              ]}
            >
              <AppText style={styles.label}>Especie *</AppText>
              <DropDownPicker
                open={openEspecie}
                value={formData.id_especie}
                items={speciesOptions}
                setOpen={canEdit ? setOpenEspecie : () => {}} //  Solo abre si puede editar
                setValue={(callback) => {
                  if (!canEdit) return;
                  const value = callback(formData.id_especie);
                  setFormData((prev) => ({ ...prev, id_especie: value }));
                }}
                placeholder="Selecciona una especie..."
                style={[styles.dropdownStyle, !canEdit && styles.disabledInput]}
                dropDownContainerStyle={styles.dropdownContainerStyle}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                disabled={!canEdit} // Deshabilitado si no puede editar
                theme={isDark ? 'DARK' : 'LIGHT'}
              />
            </View>

            {/* --- ESTADO DE SALUD --- */}
            <View
              style={[
                styles.inputContainer,
                Platform.OS === 'ios' && { zIndex: 1000 },
              ]}
            >
              <AppText style={styles.label}>Estado de Salud *</AppText>
              <DropDownPicker
                open={openEstadoSalud}
                value={formData.id_estado_salud}
                items={healthOptions}
                setOpen={canEdit ? setOpenEstadoSalud : () => {}} // Solo abre si puede editar
                setValue={(callback) => {
                  if (!canEdit) return;
                  const value = callback(formData.id_estado_salud);
                  setFormData((prev) => ({ ...prev, id_estado_salud: value }));
                }}
                placeholder="Selecciona un estado..."
                style={[styles.dropdownStyle, !canEdit && styles.disabledInput]}
                dropDownContainerStyle={styles.dropdownContainerStyle}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                disabled={!canEdit} // Deshabilitado si no puede editar
                theme={isDark ? 'DARK' : 'LIGHT'}
              />
            </View>

            {/* Información de foto existente */}
            {formData.url && (
              <View style={styles.photosInfo}>
                <AppText style={styles.label}>Foto del avistamiento</AppText>
                <AppText style={styles.photoCount}>
                  Hay una foto asociada a este avistamiento
                </AppText>
                <AppText style={styles.note}>
                  Nota: La edición de fotos no está disponible aquí
                </AppText>
              </View>
            )}

            {canEdit ? (
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
                    (!hasChanges() || isSubmitting) && styles.buttonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!hasChanges() || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator
                      color={isDark ? colors.lightText : colors.text} // 4. Usar colores del tema
                      size="small"
                    />
                  ) : (
                    <AppText style={styles.buttonText}>Guardar Cambios</AppText>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              //  BOTÓN SOLO PARA VOLVER SI NO TIENE PERMISOS
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <AppText style={[styles.buttonText, styles.cancelButtonText]}>
                    Volver
                  </AppText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- ESTILOS ---
// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background, // Dinámico
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
      paddingBottom: 40,
    },
    formContainer: {
      width: width * 0.9,
      maxWidth: 400,
      paddingHorizontal: 20,
      backgroundColor: colors.cardBackground, // Dinámico
      borderRadius: 16,
      paddingVertical: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.1, // Dinámico
      shadowRadius: 3.84,
      elevation: 5,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background, // Dinámico
      padding: 20,
    },
    loadingText: {
      marginTop: 16,
      color: colors.text, // Dinámico
    },
    errorText: {
      color: colors.danger, // Dinámico
      fontWeight: fontWeightBold,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: fontWeightBold,
      color: colors.text, // Dinámico
      marginBottom: 16,
      textAlign: 'center',
    },
    infoSection: {
      backgroundColor: `${colors.info}20`, // Dinámico
      padding: 12,
      borderRadius: 8,
      marginBottom: 20,
    },
    infoText: {
      color: colors.text, // Dinámico
      fontSize: 14,
      textAlign: 'center',
    },
    changesText: {
      color: colors.accent, // Dinámico
      fontSize: 14,
      fontWeight: fontWeightSemiBold,
      textAlign: 'center',
      marginTop: 4,
    },
    warningText: {
      color: colors.danger, // Dinámico
      fontSize: 14,
      fontWeight: fontWeightSemiBold,
      textAlign: 'center',
      marginTop: 4,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: fontWeightSemiBold,
      color: colors.darkGray, // Dinámico
      marginBottom: 8,
      marginTop: 16,
    },
    textInput: {
      backgroundColor: colors.background, // Dinámico
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.text, // Dinámico
    },
    disabledInput: {
      backgroundColor: colors.backgroundSecon, // Dinámico
      borderColor: colors.gray, // Dinámico
      color: colors.darkGray, // Dinámico
    },
    inputMultiline: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    dropdownStyle: {
      backgroundColor: colors.background, // Dinámico
      borderColor: colors.gray, // Dinámico
      borderRadius: 8,
      borderWidth: 1,
    },
    dropdownContainerStyle: {
      backgroundColor: colors.cardBackground, // Dinámico
      borderColor: colors.gray, // Dinámico
      borderRadius: 8,
      marginTop: 2,
    },
    dropdownText: {
      fontSize: 16,
      color: colors.text, // Dinámico
    },
    dropdownPlaceholder: {
      color: colors.darkGray, // Dinámico
    },
    map: {
      width: '100%',
      height: 250,
      borderRadius: 8,
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
    },
    photosInfo: {
      backgroundColor: colors.background, // Dinámico
      padding: 12,
      borderRadius: 8,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
    },
    photoCount: {
      color: colors.text, // Dinámico
      fontSize: 14,
      marginTop: 4,
    },
    note: {
      color: colors.darkGray, // Dinámico
      fontSize: 12,
      fontStyle: 'italic',
      marginTop: 4,
      marginBottom: 8,
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
      backgroundColor: colors.primary, // Dinámico
    },
    cancelButton: {
      backgroundColor: colors.background, // Dinámico
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
    },
    buttonDisabled: {
      backgroundColor: colors.darkGray, // Dinámico
      opacity: 0.6,
    },
    buttonText: {
      color: isDark ? colors.lightText : colors.text, // Dinámico (texto oscuro sobre amarillo)
      fontSize: 16,
      fontWeight: fontWeightBold,
    },
    cancelButtonText: {
      color: colors.text, // Dinámico
    },
  });

export default EditSightingScreen;