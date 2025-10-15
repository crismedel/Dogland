import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { updateAnimal } from '../../src/api/animals';
import { Ionicons } from '@expo/vector-icons';

const EditarPerfilCan = () => {
  const { id, name, breed, age } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Estados para editar los campos
  const [nombre, setNombre] = useState(name as string);
  const [raza, setRaza] = useState(breed as string);
  const [edad, setEdad] = useState(age as string);

  const handleGuardarCambios = async () => {
    if (!nombre || !raza || !edad) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    const updatedData = {
      nombre_animal: nombre,
      edad_animal: Number(edad),
      edad_aproximada: String(edad+" meses"),
      id_estado_salud: 1,
      id_raza: Number(raza)
    };

    console.log('Actualizar animal ID:', id);
    console.log('Datos enviados:', updatedData);

    try {
      setLoading(true);
      await updateAnimal(Number(id), updatedData);
      Alert.alert('Éxito', 'El perfil del animal ha sido actualizado.');
      router.back();
    } catch (error: any) {
      console.error('Error al actualizar el animal:', error);
      const message =
        error?.error || 'No se pudo actualizar la información del animal.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >

      <View style={styles.container}>
        {/* Barra superior */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Editar Perfil</Text>
          <View style={{ width: 40 }} /> {/* Espaciador simétrico */}
        </View>

        {/* Campos del formulario */}
        <View style={styles.form}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre del animal"
          />

          <Text style={styles.label}>Raza</Text>
          <TextInput
            style={styles.input}
            value={raza}
            onChangeText={setRaza}
            placeholder="Raza"
          />

          <Text style={styles.label}>Edad (meses)</Text>
          <TextInput
            style={styles.input}
            value={edad}
            onChangeText={setEdad}
            keyboardType="numeric"
            placeholder="Edad en meses"
          />
        </View>

        {/* Botón de guardar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleGuardarCambios}>
          <Ionicons name="save-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>Guardar Cambios</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dbe8d3',
    padding: 20,
    alignItems: 'center',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#4A90E2',
    marginVertical: 20,
  },
  form: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditarPerfilCan;
