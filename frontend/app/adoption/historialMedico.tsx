import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const HistorialMedico = () => {
  const router = useRouter();

  // Estado para manejar las entradas del historial
  const [historial, setHistorial] = useState([
    { id: '1', texto: 'Historial de mascota 1' },
    { id: '2', texto: 'Historial de mascota 2' },
  ]);

  // Agregar un nuevo historial
  const handleAgregarHistorial = () => {
    const newId = (historial.length + 1).toString();
    setHistorial([...historial, { id: newId, texto: '' }]);
  };

  // Eliminar un historial
  const handleEliminarHistorial = (id: string) => {
    setHistorial(historial.filter((item) => item.id !== id));
  };

  // Guardar cambios
  const handleGuardar = () => {
    Alert.alert('Cambios guardados', 'El historial médico ha sido actualizado correctamente.');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
          <Image
            source={require('../../assets/images/volver.png')}
            style={styles.backIconHeader}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Actualizar His - Médico</Text>
      </View>

      {/* Datos del animal */}
      <View style={styles.animalInfo}>
        <Ionicons name="paw" size={22} color="#333" />
        <Text style={styles.animalText}>Perro (Pastor Alemán)</Text>
      </View>

      {/* Lista de historiales */}
      <FlatList
        data={historial}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.historialCard}>
            <TextInput
              style={styles.input}
              placeholder={`Historial ${item.id}`}
              value={item.texto}
              onChangeText={(text) =>
                setHistorial((prev) =>
                  prev.map((h) => (h.id === item.id ? { ...h, texto: text } : h))
                )
              }
            />
            <TouchableOpacity onPress={() => handleEliminarHistorial(item.id)}>
              <Ionicons name="close-circle" size={22} color="#e63946" />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.addButton} onPress={handleAgregarHistorial}>
            <Ionicons name="add" size={28} color="#4A90E2" />
          </TouchableOpacity>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Botón Guardar Cambios */}
      <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
        <Text style={styles.saveButtonText}>Guardar Cambios</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Puedes buscarnos en :</Text>
        <View style={styles.socials}>
          <Ionicons name="logo-twitter" size={24} color="black" />
          <Ionicons name="logo-facebook" size={24} color="black" />
          <Ionicons name="logo-instagram" size={24} color="black" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#dbe8d3' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    padding: 12,
    marginTop: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginLeft: 16 },
  backButtonHeader: { padding: 6 },
  backIconHeader: { width: 24, height: 24, tintColor: '#fff' },
  animalInfo: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  animalText: { fontSize: 16, fontWeight: 'bold', marginLeft: 8, color: '#333' },
  historialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  input: { flex: 1, fontSize: 14, color: '#333' },
  addButton: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  saveButton: {
    backgroundColor: '#fbbf24',
    margin: 16,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
  footer: {
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  footerText: { marginBottom: 5, fontSize: 12, color: '#333' },
  socials: { flexDirection: 'row', gap: 15 },
});

export default HistorialMedico;
