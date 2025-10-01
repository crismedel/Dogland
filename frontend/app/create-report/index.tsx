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
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Dimensions } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import axios, { AxiosError } from 'axios';
import apiClient from '../../src/api/client';

const { width } = Dimensions.get('window');

const CreateReportScreen = () => {
  const [descripcion, setDescripcion] = useState('');
  const [titulo, setTitulo] = useState('');

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
      Alert.alert('Permiso Denegado', 'No se puede acceder a la ubicación');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setUbicacion(location.coords);
    Alert.alert('Ubicación Obtenida', 'Se ha usado tu ubicación actual.');
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
    if (
      !descripcion ||
      !especie ||
      !estadoSalud ||
      !estadoAvistamiento ||
      !ubicacion
    ) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

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
    };

    try {
      const response = await apiClient.post('/sightings', reportData);

      if (response.status === 201) {
        Alert.alert('Éxito', 'Reporte creado con éxito.');
        setDescripcion('');
        setEspecie(null);
        setEstadoSalud(null);
        setEstadoAvistamiento(null);
        setUbicacion(null);
      } else {
        Alert.alert('Error', 'Hubo un problema al crear el reporte.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          'Error al enviar el reporte:',
          error.response?.data || error.message,
        );
        Alert.alert(
          'Error',
          error.response?.data?.message ||
            'No se pudo conectar con el servidor.',
        );
      } else {
        console.error('Error inesperado:', error);
        Alert.alert('Error', 'Ocurrió un error inesperado.');
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
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownStyle: {
    backgroundColor: '#ffffff',
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
  button: {
    backgroundColor: '#fbbf24',
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
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default CreateReportScreen;
