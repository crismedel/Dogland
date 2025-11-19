import {
  AppText,
  fontWeightMedium
} from '@/src/components/AppText';
import CustomHeader from '@/src/components/UI/CustomHeader';
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
// --- CORRECCIÓN CRÍTICA: Usar el path '/legacy' para readAsStringAsync ---
import { useNotification } from '@/src/components/notifications';
import { useNetInfo } from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system/legacy';
import MapView, { Marker } from 'react-native-maps';
import apiClient from '../../src/api/client';
import CustomButton from '../../src/components/UI/CustomButton';
import { useReportSync } from '../../src/hooks/useReportSync';
import { saveReportOffline } from '../../src/utils/offlineStorage';

// 2. Importar el hook y los tipos de tema
import { ColorsType } from '@/src/constants/colors';
import { useTheme } from '@/src/contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface ErrorData {
  error?: string;
  message?: string;
}

const CreateReportScreen = () => {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const router = useRouter();
  const { showError, showSuccess, showInfo, confirm } = useNotification();

  // --- HOOKS OFFLINE ---
  const netInfo = useNetInfo();
  useReportSync();
  // --- FIN HOOKS OFFLINE ---

  // ESTADOS DEL FORMULARIO
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  const [formValues, setFormValues] = useState<Record<string, any>>({
    titulo: '',
    descripcion: '',
    especie: null,
    estadoSalud: null,
    estadoAvistamiento: null,
    ubicacion: null,
    direccion: '',
  });

  const [mostrarMapa, setMostrarMapa] = useState(false);

  // --- LÓGICA DE IMAGEN ---
  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showError('Permiso requerido', 'Necesitamos acceso a tu galería para subir fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.6,
        base64: false, // No convertir a Base64 aquí
      });

      if (!result.canceled) {
        setLocalImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar la imagen:', error);
      showError('Error', 'No se pudo seleccionar la imagen.');
    }
  };

  // Función para obtener dirección legible desde coordenadas (geocodificación inversa)
  const obtenerDireccionDesdeCoordenadas = async (
    latitude: number,
    longitude: number,
  ) => {
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (!address) return '';
      return `${address.street || ''} ${address.streetNumber || ''}, ${
        address.city || ''
      }, ${address.region || ''}`.trim();
    } catch (error) {
      console.warn('Error en geocodificación inversa:', error);
      return '';
    }
  };

  const obtenerUbicacionActual = async () => {
    try {
      setLoadingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showError('Permiso Denegado', 'No se puede acceder a la ubicación.');
        setLoadingLocation(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const direccion = await obtenerDireccionDesdeCoordenadas(
        location.coords.latitude,
        location.coords.longitude,
      );

      setFormValues((prev) => ({
        ...prev,
        ubicacion: location.coords,
        direccion,
      }));
      showInfo('Ubicación Obtenida', 'Se ha usado tu ubicación actual.');
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      showError('Error', 'No se pudo obtener la ubicación');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleMapPress = async (event: any) => {
    const { coordinate } = event.nativeEvent;
    setLoadingLocation(true);
    const direccion = await obtenerDireccionDesdeCoordenadas(
      coordinate.latitude,
      coordinate.longitude,
    );

    setFormValues((prev) => ({
      ...prev,
      ubicacion: coordinate,
      direccion,
    }));

    showInfo(
      'Ubicación Seleccionada',
      `Lat: ${coordinate.latitude.toFixed(
        6,
      )}, Lon: ${coordinate.longitude.toFixed(6)}\nDirección: ${
        direccion || 'No disponible'
      }`,
    );
    setMostrarMapa(false);
    setLoadingLocation(false);
  };

  const resetForm = () => {
    setFormValues({
      titulo: '',
      descripcion: '',
      especie: null,
      estadoSalud: null,
      estadoAvistamiento: null,
      ubicacion: null,
      direccion: '',
    });
    setLocalImageUri(null); // Limpiar URI local
    setLoading(false);
  };

  const fields: FormField[] = [
    // ... (campos de texto y pickers sin cambios) ...
    {
      name: 'titulo',
      label: 'Título del Reporte',
      required: true,
      placeholder: 'Ej: Perro herido en Av. Principal',
      type: 'text',
    },
    {
      name: 'descripcion',
      label: 'Descripción del Reporte',
      required: true,
      placeholder: 'Detalles sobre el estado, ubicación y otros avistamientos',
      multiline: true,
      numberOfLines: 4,
      type: 'text',
    },
    {
      name: 'especie',
      label: 'Especie del Animal',
      required: true,
      type: 'picker',
      options: [
        { label: 'Perro', value: 1 },
        { label: 'Gato', value: 2 },
        { label: 'Otro', value: 3 },
      ],
    },
    {
      name: 'estadoSalud',
      label: 'Estado de Salud del Animal',
      required: true,
      type: 'picker',
      options: [
        { label: 'Saludable', value: 1 },
        { label: 'Herido', value: 2 },
        { label: 'Grave', value: 3 },
      ],
    },
    {
      name: 'estadoAvistamiento',
      label: 'Estado del Avistamiento',
      required: true,
      type: 'picker',
      options: [
        { label: 'Activo', value: 1 },
        { label: 'Desaparecido', value: 2 },
        { label: 'Observado', value: 3 },
        { label: 'Recuperado', value: 4 },
      ],
    },
    // Eliminamos el campo 'imageUrl'
    {
      name: 'ubicacion',
      label: 'Ubicación',
      required: true,
      type: 'location',
      placeholder: 'Seleccionar ubicación',
      onLocationPress: () => {
        confirm({
          title: 'Selecciona una opción',
          message:
            '¿Quieres seleccionar en el mapa o usar tu ubicación actual?',
          confirmLabel: 'Usar Ubicación Actual',
          cancelLabel: 'Ver en Mapa',
          onConfirm: obtenerUbicacionActual,
          onCancel: () => setMostrarMapa(true),
          destructive: false,
        });
      },
      onLocationClear: () => {
        setFormValues((prev) => ({ ...prev, ubicacion: null, direccion: '' }));
      },
      formatLocation: (loc) =>
        loc ? `${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}` : null,
    },
    {
      name: 'direccion',
      label: 'Dirección',
      placeholder: 'Dirección automática desde ubicación',
      type: 'text',
      autoCapitalize: 'sentences',
    },
  ];

  const onValueChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // --- FUNCIÓN PRINCIPAL DE SUBIDA MODIFICADA PARA BYTEA ---
  const handleCreateReport = async (values: Record<string, any>) => {
    if (!values.ubicacion) {
      showError('Error', 'La ubicación es obligatoria.');
      return;
    }

    setLoading(true);

    let imageDataBase64: string | null = null;

    // 1. Convertir imagen local (URI) a Base64 si existe una seleccionada
    if (localImageUri) {
        try {
            // Usamos readAsStringAsync con la cadena 'base64' como codificación
            const base64 = await FileSystem.readAsStringAsync(localImageUri, {
                encoding: 'base64', 
            });
            
            // Creamos la cadena Base64 que incluye el prefijo (data URL)
            imageDataBase64 = `data:image/jpeg;base64,${base64}`;
        } catch (fileError) {
            console.error('Error leyendo archivo para Base64:', fileError);
            showError('Error de archivo', 'No se pudo leer la imagen para la subida.');
            setLoading(false);
            return;
        }
    }

    // 2. Preparar los datos del reporte
    const reportData = {
      id_estado_avistamiento: values.estadoAvistamiento,
      id_estado_salud: values.estadoSalud,
      id_especie: values.especie,
      descripcion: values.descripcion,
      titulo: values.titulo,
      ubicacion: {
        longitude: values.ubicacion.longitude,
        latitude: values.ubicacion.latitude,
      },
      direccion: values.direccion || 'No proporcionada',
      // Enviamos la cadena Base64 en el campo que espera el backend
      imageDataBase64: imageDataBase64, 
    };

    // 3. Lógica Offline/Online
    const isOnline = netInfo.isConnected && netInfo.isInternetReachable;

    if (isOnline) {
      // --- INTENTO DE ENVÍO ONLINE ---
      try {
        const response = await apiClient.post('/sightings', reportData);
        if (response.status === 201) {
          showSuccess('Éxito', 'Reporte creado con éxito.');
          resetForm();
          router.back();
        } else {
          showError('Error', 'Hubo un problema al crear el reporte.');
          setLoading(false);
        }
      } catch (error) {
        console.error(
          'Error al enviar online, preguntando para guardar offline:',
          error,
        );
        setLoading(false);
        confirm({
          title: 'Error de Envío',
          message:
            'No pudimos subir el reporte. ¿Quieres guardarlo para intentarlo más tarde?',
          confirmLabel: 'Guardar Offline',
          onConfirm: async () => {
            await saveReportOffline(reportData);
            resetForm();
            router.back();
          },
          onCancel: () => {},
          destructive: false,
        });
      }
    } else {
      // --- MODO OFFLINE (SIN CONEXIÓN) ---
      try {
        await saveReportOffline(reportData); 
        showSuccess(
          'Guardado Offline',
          'Reporte guardado. Se subirá automáticamente cuando recuperes la conexión.',
        );
        router.back();
      } catch (saveError) {
        showError('Error', 'No se pudo guardar el reporte localmente.');
      } finally {
         resetForm(); 
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <CustomHeader
        title="Crear Reporte"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: isDark ? colors.lightText : colors.text, 
              }}
            />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity onPress={() => handleCreateReport(formValues)}>
            {loading ? (
              <ActivityIndicator
                size="small"
                color={isDark ? colors.lightText : colors.text} 
              />
            ) : (
              <Ionicons
                name="checkmark-done-outline"
                size={22}
                color={isDark ? colors.lightText : colors.text} 
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
          <DynamicForm
            fields={fields}
            values={formValues}
            onValueChange={onValueChange}
            onSubmit={handleCreateReport}
            loading={loading}
            buttonText="Generar Reporte"
            buttonIcon="checkmark-done-outline"
          />

          {/* --- BOTÓN Y VISTA PREVIA DE IMAGEN --- */}
          <View style={styles.imagePickerContainer}>
            <AppText style={styles.inputLabel}>Foto del Avistamiento (Opcional):</AppText>
            <CustomButton
                title={localImageUri ? "Cambiar Foto" : "Seleccionar Foto"}
                onPress={handleImagePick}
                variant={localImageUri ? "secondary" : "primary"}
                style={styles.imageButton}
                icon="image-outline"
            />
            {localImageUri && (
                <View style={styles.imagePreviewContainer}>
                    <Image
                        source={{ uri: localImageUri }}
                        style={styles.imagePreview}
                    />
                </View>
            )}
          </View>
          {/* --- FIN IMAGEN --- */}


          {mostrarMapa && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: formValues.ubicacion?.latitude || -38.7369,
                  longitude: formValues.ubicacion?.longitude || -72.5994,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onPress={handleMapPress}
              >
                {formValues.ubicacion && (
                  <Marker
                    coordinate={formValues.ubicacion}
                    title="Ubicación Seleccionada"
                  />
                )}
              </MapView>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- ESTILOS ---
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flex: 1,
    },
    contentContainer: {
      padding: 20,
    },
    // Estilos para DynamicForm
    inputLabel: {
      fontSize: 16,
      fontWeight: fontWeightMedium,
      color: colors.text,
      marginBottom: 6,
    },

    // --- ESTILOS DE IMAGEN ---
    imagePickerContainer: {
        marginTop: 10,
        marginBottom: 20,
        zIndex: 100, // Asegurar que el DropdownPicker no tape el botón
    },
    imageButton: {
        width: 'auto',
        alignSelf: 'flex-start',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    imagePreviewContainer: {
        marginTop: 15,
        borderRadius: 12,
        overflow: 'hidden',
        alignItems: 'center',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    // FIN ESTILOS IMAGEN

    mapContainer: {
      width: '100%',
      height: 300,
      marginTop: 20,
    },
    map: {
      width: '100%',
      height: '100%',
    },
  });

export default CreateReportScreen;