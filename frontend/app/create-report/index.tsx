import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Dimensions } from 'react-native';
import * as Location from 'expo-location'; // Asegúrate de importar Location correctamente
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

const CreateReportScreen = () => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [foto, setFoto] = useState(null);

  // Estados para Especie
  const [especie, setEspecie] = useState(null);
  const [openEspecie, setOpenEspecie] = useState(false);
  const [itemsEspecie, setItemsEspecie] = useState([
    { label: 'Perro', value: 'Perro' },
    { label: 'Gato', value: 'Gato' },
    { label: 'Ave', value: 'Ave' },
    { label: 'Reptil', value: 'Reptil' },
    { label: 'Otro', value: 'Otro' },
  ]);

  // Estados para Estado de Salud
  const [estadoSalud, setEstadoSalud] = useState(null);
  const [openEstadoSalud, setOpenEstadoSalud] = useState(false);
  const [itemsEstadoSalud, setItemsEstadoSalud] = useState([
    { label: 'Lesionado', value: 'Lesionado' },
    { label: 'Enfermo', value: 'Enfermo' },
    { label: 'Sano', value: 'Sano' },
    { label: 'Perdido', value: 'Perdido' },
  ]);

  // Estados para Nivel de Riesgo
  const [nivelRiesgo, setNivelRiesgo] = useState(null);
  const [openNivelRiesgo, setOpenNivelRiesgo] = useState(false);
  const [itemsNivelRiesgo, setItemsNivelRiesgo] = useState([
    { label: 'Bajo', value: 'Bajo' },
    { label: 'Moderado', value: 'Moderado' },
    { label: 'Alto', value: 'Alto' },
  ]);

  // Estados para Tipo de Alerta
  const [tipoAlerta, setTipoAlerta] = useState(null);
  const [openTipoAlerta, setOpenTipoAlerta] = useState(false);
  const [itemsTipoAlerta, setItemsTipoAlerta] = useState([
    { label: 'Salud Pública', value: 'Salud Pública' },
    { label: 'Seguridad', value: 'Seguridad' },
    { label: 'Rescate', value: 'Rescate' },
  ]);

  // Estado para la ubicación (Puede ser cualquier ubicación seleccionada)
  const [ubicacion, setUbicacion] = useState<{ latitude: number; longitude: number } | null>(null);

  // Estado para controlar si mostrar el mapa o no
  const [mostrarMapa, setMostrarMapa] = useState(false);

  // Función para obtener la ubicación actual del usuario
  const obtenerUbicacionActual = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso Denegado', 'No se puede acceder a la ubicación');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUbicacion(location.coords); // Almacena la ubicación con 'latitude' y 'longitude'
  };

  // Función para manejar el toque largo en el mapa
  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setUbicacion(coordinate); // Actualiza la ubicación con las coordenadas del toque
  };

  const handleCreateReport = () => {
    if (!titulo || !descripcion || !especie || !estadoSalud || !nivelRiesgo || !tipoAlerta || !ubicacion) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    const newReport = {
      titulo,
      descripcion,
      especie,
      estadoSalud,
      nivelRiesgo,
      tipoAlerta,
      ubicacion,
      foto,
      fechaCreacion: new Date().toISOString(),
    };

    console.log('Reporte creado:', newReport);
    Alert.alert('Éxito', 'Reporte creado con éxito');

    setTitulo('');
    setDescripcion('');
    setEspecie(null);
    setEstadoSalud(null);
    setNivelRiesgo(null);
    setTipoAlerta(null);
    setUbicacion(null);
    setFoto(null);
    setMostrarMapa(false); // Ocultamos el mapa después de crear el reporte
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
            <Text style={styles.inputLabel}>Título del Reporte:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ingrese el título"
              value={titulo}
              onChangeText={setTitulo}
            />
          </View>

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
          <View style={[styles.inputContainer, Platform.OS === 'ios' && { zIndex: 5000 }]}>
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
          <View style={[styles.inputContainer, Platform.OS === 'ios' && { zIndex: 4000 }]}>
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

          {/* Nivel de Riesgo */}
          <View style={[styles.inputContainer, Platform.OS === 'ios' && { zIndex: 3000 }]}>
            <Text style={styles.inputLabel}>Nivel de Riesgo:</Text>
            <DropDownPicker
              open={openNivelRiesgo}
              value={nivelRiesgo}
              items={itemsNivelRiesgo}
              setOpen={setOpenNivelRiesgo}
              setValue={setNivelRiesgo}
              setItems={setItemsNivelRiesgo}
              placeholder="Seleccionar Nivel de Riesgo"
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropdownContainerStyle}
            />
          </View>

          {/* Tipo de Alerta */}
          <View style={[styles.inputContainer, Platform.OS === 'ios' && { zIndex: 2000 }]}>
            <Text style={styles.inputLabel}>Tipo de Alerta:</Text>
            <DropDownPicker
              open={openTipoAlerta}
              value={tipoAlerta}
              items={itemsTipoAlerta}
              setOpen={setOpenTipoAlerta}
              setValue={setTipoAlerta}
              setItems={setItemsTipoAlerta}
              placeholder="Seleccionar Tipo de Alerta"
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
                  '¿Quieres ver la ubicación en el mapa o usar la ubicación actual?',
                  [
                    {
                      text: 'Ver en Mapa',
                      onPress: () => setMostrarMapa(true), // Muestra el mapa para seleccionar una ubicación
                    },
                    {
                      text: 'Usar Ubicación Actual',
                      onPress: obtenerUbicacionActual, // Obtiene la ubicación actual
                    },
                    { text: 'Cancelar', style: 'cancel' },
                  ]
                )
              }
            >
              <Text>{ubicacion ? `${ubicacion.latitude}, ${ubicacion.longitude}` : 'Seleccionar ubicación'}</Text>
            </TouchableOpacity>
          </View>

          {/* Mostrar Mapa para seleccionar ubicación */}
          {mostrarMapa && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: 37.7749,  // Usamos un valor predeterminado si no hay ubicación
                  longitude: -122.4194, // Usamos un valor predeterminado si no hay ubicación
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onLongPress={handleMapPress}  // Permite al usuario seleccionar una ubicación en el mapa
              >
                {ubicacion && (
                  <Marker coordinate={ubicacion} title="Ubicación Seleccionada" />
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
