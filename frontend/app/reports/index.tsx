import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

const CreateReportScreen = () => {
  // Estados para almacenar la información del reporte
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [especie, setEspecie] = useState('');
  const [estadoSalud, setEstadoSalud] = useState('');
  const [nivelRiesgo, setNivelRiesgo] = useState('');
  const [tipoAlerta, setTipoAlerta] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [foto, setFoto] = useState(null); // Aquí almacenaremos la URL de la foto seleccionada

  // Función para manejar la creación del reporte
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
      fechaCreacion: new Date().toISOString(), // Fecha de creación automática
    };

    // Aquí iría la lógica para enviar el reporte al backend o almacenarlo en la base de datos
    console.log('Reporte creado:', newReport);

    // Después de crear el reporte, mostrar una alerta de éxito
    Alert.alert('Exito', 'Reporte creado con éxito');

    // Limpiar los campos después de crear el reporte
    setTitulo('');
    setDescripcion('');
    setEspecie('');
    setEstadoSalud('');
    setNivelRiesgo('');
    setTipoAlerta('');
    setUbicacion('');
    setFoto(null);
  };

  return (
  
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
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

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Especie del Animal:</Text>
              <Picker
                selectedValue={especie}
                style={styles.picker}
                onValueChange={(itemValue) => setEspecie(itemValue)}
              >
                <Picker.Item label="Seleccionar Especie" value="" />
                <Picker.Item label="Perro" value="Perro" />
                <Picker.Item label="Gato" value="Gato" />
              </Picker>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Estado de Salud del Animal:</Text>
              <Picker
                selectedValue={estadoSalud}
                style={styles.picker}
                onValueChange={(itemValue) => setEstadoSalud(itemValue)}
              >
                <Picker.Item label="Seleccionar Estado de Salud" value="" />
                <Picker.Item label="Lesionado" value="Lesionado" />
                <Picker.Item label="Enfermo" value="Enfermo" />
                <Picker.Item label="Sano" value="Sano" />
              </Picker>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nivel de Riesgo:</Text>
              <Picker
                selectedValue={nivelRiesgo}
                style={styles.picker}
                onValueChange={(itemValue) => setNivelRiesgo(itemValue)}
              >
                <Picker.Item label="Seleccionar Nivel de Riesgo" value="" />
                <Picker.Item label="Bajo" value="Bajo" />
                <Picker.Item label="Moderado" value="Moderado" />
                <Picker.Item label="Alto" value="Alto" />
              </Picker>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tipo de Alerta:</Text>
              <Picker
                selectedValue={tipoAlerta}
                style={styles.picker}
                onValueChange={(itemValue) => setTipoAlerta(itemValue)}
              >
                <Picker.Item label="Seleccionar Tipo de Alerta" value="" />
                <Picker.Item label="Salud Pública" value="Salud Pública" />
                <Picker.Item label="Seguridad" value="Seguridad" />
              </Picker>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Ubicación (Latitud, Longitud):</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ejemplo: 37.7749, -122.4194"
                value={ubicacion}
                onChangeText={setUbicacion}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleCreateReport}>
              <Text style={styles.buttonText}>Generar Reporte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    paddingTop: 40, // Para dejar espacio del status bar
  },
  formContainer: {
    width: width * 0.9,
    maxWidth: 400,
    paddingHorizontal: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    paddingVertical: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#ffffff",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    marginBottom: 20,
    height: 50,
  },
  button: {
    backgroundColor: "#fbbf24",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start", // Para asegurar que los elementos queden arriba
    paddingBottom: 30, // Espacio para no cortar contenido
  },
});

export default CreateReportScreen;