import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Text, // Asegúrate de que Text esté importado
  TextInput,
  Pressable, // Importar Pressable si se usa
} from 'react-native';
import { useRouter } from 'expo-router';
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';
import CustomHeader from '@/src/components/UI/CustomHeader';
import {
  AppText,
  fontWeightBold,
  fontWeightMedium,
  fontWeightSemiBold,
} from '@/src/components/AppText';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import { fetchUserProfile } from '@/src/api/users';
import { useAuth } from '@/src/contexts/AuthContext';
import { fetchNotifications } from '@/src/api/notifications';
import Spinner from '@/src/components/UI/Spinner';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import apiClient from '../../src/api/client';
import { useNotification } from '@/src/components/notifications';
import { useNetInfo } from '@react-native-community/netinfo';
import { useReportSync } from '../../src/hooks/useReportSync';
import { saveReportOffline } from '../../src/utils/offlineStorage';
import DropDownPicker from 'react-native-dropdown-picker';
import CustomButton from '../../src/components/UI/CustomButton';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

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
  const [descripcion, setDescripcion] = useState('');
  const [titulo, setTitulo] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [formValues, setFormValues] = useState<Record<string, any>>({
    titulo: '',
    descripcion: '',
    especie: null,
    estadoSalud: null,
    estadoAvistamiento: null,
    imageUrl: '',
    ubicacion: null,
    direccion: '',
  });

  const [mostrarMapa, setMostrarMapa] = useState(false);

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
      imageUrl: '',
      ubicacion: null,
      direccion: '',
    });
    setLoading(false);
  };

  const fields: FormField[] = [
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
        { label: 'Desaparecido', value: 2 },
        { label: 'Observado', value: 3 },
        { label: 'Recuperado', value: 4 },
      ],
    },
    {
      name: 'estadoAvistamiento',
      label: 'Estado del Avistamiento',
      required: true,
      type: 'picker',
      options: [
        { label: 'Desaparecido', value: 2 },
        { label: 'Observado', value: 3 },
        { label: 'Recuperado', value: 4 },
      ],
    },
    {
      name: 'imageUrl',
      label: 'URL de la Foto (Opcional)',
      required: false,
      placeholder: 'Ej: https://tudominio.com/foto.jpg',
      type: 'text',
      keyboardType: 'url',
      autoCapitalize: 'none',
    },
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

  const handleCreateReport = async (values: Record<string, any>) => {
    if (!values.ubicacion) {
      showError('Error', 'La ubicación es obligatoria.');
      return;
    }

    setLoading(true);

    const finalImageUrl =
      values.imageUrl && values.imageUrl.startsWith('http')
        ? values.imageUrl
        : null;
    if (values.imageUrl && !finalImageUrl) {
      showInfo(
        'Advertencia',
        'La URL de la foto no parece ser válida. El reporte se enviará sin imagen.',
      );
    }

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
      url: finalImageUrl,
    };

    const isOnline = netInfo.isConnected && netInfo.isInternetReachable;

    if (isOnline) {
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
          cancelLabel: 'Cancelar',
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
      try {
        await saveReportOffline(reportData);
        showSuccess(
          'Guardado Offline',
          'Reporte guardado. Se subirá automáticamente cuando recuperes la conexión.',
        );
        resetForm();
        router.back();
      } catch (saveError) {
        showError('Error', 'No se pudo guardar el reporte localmente.');
        setLoading(false);
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
              // 6. Usar colores del tema (texto oscuro sobre fondo amarillo)
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
                color={isDark ? colors.lightText : colors.text} // 6. Usar colores del tema
              />
            ) : (
              <Ionicons
                name="checkmark-done-outline"
                size={22}
                color={isDark ? colors.lightText : colors.text} // 6. Usar colores del tema
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

// --- ESTILOS (sin cambios, excepto por un scroll más grande) ---
// 7. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background, // Dinámico
    },
    scrollContainer: {
      flex: 1,
    },
    contentContainer: {
      padding: 20,
    },

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
