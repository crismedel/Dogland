import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Dimensions } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import axios, { AxiosError } from 'axios';
import { useNotification } from '@/src/components/notifications/NotificationContext';
import apiClient from '../../src/api/client';
import { Colors } from '@/src/constants/colors';

const { width } = Dimensions.get('window');

// Definimos la interfaz esperada para los datos del error del backend para resolver TS2339
interface ErrorData {
  error?: string;
  message?: string;
}

const CreateReportScreen = () => {
  const [descripcion, setDescripcion] = useState('');
  const [titulo, setTitulo] = useState('');
  const { showError, showSuccess, showInfo, confirm } = useNotification();

  // ESTADO PARA LA URL DE LA IMAGEN
  const [imageUrl, setImageUrl] = useState('');

  const [especie, setEspecie] = useState(null);
  const [openEspecie, setOpenEspecie] = useState(false);
  const [itemsEspecie, setItemsEspecie] = useState([
    { label: 'Perro', value: 1 },
    { label: 'Gato', value: 2 },
    { label: 'Ave', value: 3 },
    { label: 'Reptil', value: 4 },
    { label: 'Otro', value: 5 },
  ]);

  const [estadoSalud, setEstadoSalud] = useState(null);
  const [openEstadoSalud, setOpenEstadoSalud] = useState(false);
  const [itemsEstadoSalud, setItemsEstadoSalud] = useState([
    { label: 'Saludable', value: 1 },
    { label: 'Herido', value: 2 },
    { label: 'Grave', value: 3 },
  ]);

  const [estadoAvistamiento, setEstadoAvistamiento] = useState(null);
  const [openEstadoAvistamiento, setOpenEstadoAvistamiento] = useState(false);
  const [itemsEstadoAvistamiento, setItemsEstadoAvistamiento] = useState([
    { label: 'Salud Pública', value: 1 },
    { label: 'Seguridad', value: 2 },
    { label: 'Rescate', value: 3 },
    { label: 'Perdido', value: 4 },
  ]);

  const [ubicacion, setUbicacion] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mostrarMapa, setMostrarMapa] = useState(false);

  const obtenerUbicacionActual = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      showError('Permiso Denegado', 'No se puede acceder a la ubicación.');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setUbicacion(location.coords);
    showInfo('Ubicación Obtenida', 'Se ha usado tu ubicación actual.');
  };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setUbicacion(coordinate);
    Alert.alert(
      'Ubicación Seleccionada',
      `Lat: ${coordinate.latitude.toFixed(
        4,
      )}, Lon: ${coordinate.longitude.toFixed(4)}`,
    );
    setMostrarMapa(false);
  };

  const handleCreateReport = async () => {
    // 1. Validaciones
    if (
      !descripcion ||
      !especie ||
      !estadoSalud ||
      !estadoAvistamiento ||
      !ubicacion
    ) {
      showError(
        'Error',
        'Todos los campos de texto y ubicación son obligatorios.',
      );
      return;
    }

    if (!imageUrl) {
      showError('Error', 'Debe proporcionar la URL de una foto.');
      return;
    }

    // 2. Data para la API
    const reportData = {
      id_usuario: 2,
      id_estado_avistamiento: estadoAvistamiento,
      id_estado_salud: estadoSalud,
      id_especie: especie,
      descripcion: descripcion,
      ubicacion: {
        longitude: ubicacion.longitude,
        latitude: ubicacion.latitude,
      },
      direccion: 'Ubicación seleccionada en el mapa',
      url: imageUrl, // Enviamos la URL pegada
    };

    // 3. Petición a la API y manejo de errores
    try {
      const response = await apiClient.post('/sightings', reportData);

      if (response.status === 201) {
        showSuccess('Éxito', 'Reporte creado con éxito.');
        // Limpiar el estado
        setDescripcion('');
        setImageUrl('');
        setEspecie(null);
        setEstadoSalud(null);
        setEstadoAvistamiento(null);
        setUbicacion(null);
        setTitulo('');
      } else {
        showError('Error', 'Hubo un problema al crear el reporte.');
      }
    } catch (error) {
      // Guardia de tipo para tipar el error como AxiosError<ErrorData> y resolver los TS2339 y TS18046
      const isAxiosError = (err: any): err is AxiosError<ErrorData> => {
        return err && err.isAxiosError === true;
      };

      if (isAxiosError(error)) {
        console.error(
          'Error al enviar el reporte (Axios):',
          error.response?.data || error.message,
        );

        const errorData = error.response?.data;
        // Buscamos 'error' o 'message' en la respuesta del backend
        const errorResponse = errorData?.error || errorData?.message;

        const errorMessage =
          typeof errorResponse === 'string'
            ? errorResponse
            : 'No se pudo conectar con el servidor o hubo un error desconocido.';

        showError('Error', errorMessage);
      } else {
        console.error('Error inesperado (no-Axios):', error);
        showError('Error', 'Ocurrió un error inesperado.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Crear Reporte</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Descripción del Reporte:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ingrese la descripción"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
            />
          </View>

          {/* Especie */}
          <View
            style={[
              styles.inputContainer,
              Platform.OS === 'ios' && { zIndex: 5000 },
            ]}
          >
            <Text style={styles.inputLabel}>Especie del Animal:</Text>
            <DropDownPicker
              open={openEspecie}
              value={especie}
              items={itemsEspecie}
              setOpen={setOpenEspecie}
              setValue={setEspecie}
              setItems={setItemsEspecie}
              placeholder="Seleccionar Especie"
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropdownContainerStyle}
            />
          </View>

          {/* Estado de Salud */}
          <View
            style={[
              styles.inputContainer,
              Platform.OS === 'ios' && { zIndex: 4000 },
            ]}
          >
            <Text style={styles.inputLabel}>Estado de Salud del Animal:</Text>
            <DropDownPicker
              open={openEstadoSalud}
              value={estadoSalud}
              items={itemsEstadoSalud}
              setOpen={setOpenEstadoSalud}
              setValue={setEstadoSalud}
              setItems={setItemsEstadoSalud}
              placeholder="Seleccionar Estado de Salud"
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropdownContainerStyle}
            />
          </View>

          {/* Estado del Avistamiento */}
          <View
            style={[
              styles.inputContainer,
              Platform.OS === 'ios' && { zIndex: 3000 },
            ]}
          >
            <Text style={styles.inputLabel}>Estado del Avistamiento:</Text>
            <DropDownPicker
              open={openEstadoAvistamiento}
              value={estadoAvistamiento}
              items={itemsEstadoAvistamiento}
              setOpen={setOpenEstadoAvistamiento}
              setValue={setEstadoAvistamiento}
              setItems={setItemsEstadoAvistamiento}
              placeholder="Seleccionar Estado del Avistamiento"
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropdownContainerStyle}
            />
          </View>

          {/* CASILLERO PARA LA URL DE LA IMAGEN */}
          <View style={[styles.inputContainer, { zIndex: 2000 }]}>
            <Text style={styles.inputLabel}>URL de la Foto (Pegar aquí):</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: https://tudominio.com/foto.jpg"
              value={imageUrl}
              onChangeText={setImageUrl}
              keyboardType="url"
              autoCapitalize="none"
            />

            {/* Opcional: Previsualización de la Imagen */}
            {imageUrl.startsWith('http') && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.imagePreview}
                  onError={() =>
                    console.log('Error al cargar la URL de previsualización')
                  }
                />
              </View>
            )}
          </View>

          {/* Ubicación */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Ubicación:</Text>
            <TouchableOpacity
              style={styles.textInput}
              onPress={() =>
                Alert.alert(
                  'Selecciona una opción',
                  '¿Quieres seleccionar en el mapa o usar tu ubicación actual?',
                  [
                    {
                      text: 'Ver en Mapa',
                      onPress: () => setMostrarMapa(true),
                    },
                    {
                      text: 'Usar Ubicación Actual',
                      onPress: obtenerUbicacionActual,
                    },
                    { text: 'Cancelar', style: 'cancel' },
                  ],
                )
              }
            >
              <Text style={{ color: ubicacion ? '#000' : '#888' }}>
                {ubicacion
                  ? `${ubicacion.latitude.toFixed(
                      4,
                    )}, ${ubicacion.longitude.toFixed(4)}`
                  : 'Seleccionar ubicación'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Mapa para seleccionar ubicación */}
          {mostrarMapa && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: -38.7369,
                  longitude: -72.5994,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onLongPress={handleMapPress}
              >
                {ubicacion && (
                  <Marker
                    coordinate={ubicacion}
                    title="Ubicación Seleccionada"
                  />
                )}
              </MapView>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleCreateReport}>
            <Text style={styles.buttonText}>Generar Reporte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightText,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 150,
  },
  formContainer: {
    width: width * 0.9,
    maxWidth: 400,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: Colors.lightText,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownStyle: {
    backgroundColor: Colors.lightText,
    borderColor: '#D1D5DB',
    borderRadius: 12,
  },
  dropdownContainerStyle: {
    borderColor: '#D1D5DB',
    borderRadius: 12,
    marginTop: 0,
  },
  mapContainer: {
    width: '100%',
    height: 300,
    marginVertical: 20,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  // Estilos para el campo de URL/imagen
  imagePreviewContainer: {
    marginTop: 15,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  button: {
    backgroundColor: Colors.background,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: Colors.lightText,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default CreateReportScreen;
