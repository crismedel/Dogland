// app/adoption/historialMedico.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TarjetaMedica from './component/terjetasMedicas'; // <<-- fíjate en el nombre exacto
// import { Colors } from '@/src/constants/colors'; // opcional: si lo usas, revisa que exista

const HistorialMedico = () => {
  const router = useRouter();
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock que incluye estadoMedico + descripcion (nuevo esquema)
    const mockHistorial = [
      {
        id: '1',
        nombre: 'Luna',
        estadoMedico: 2,
        descripcion: 'Vacunada, en recuperación de cirugía menor',
      },
      {
        id: '2',
        nombre: 'Thor',
        estadoMedico: 1,
        descripcion: 'Sano, necesita chequeo dental',
      },
      {
        id: '3',
        nombre: 'Max',
        estadoMedico: 2,
        descripcion: 'Problemas en la piel, tratamiento en curso',
      },
    ];

    setTimeout(() => {
      setHistorial(mockHistorial);
      setLoading(false);
    }, 600);
  }, []);

  const handleAgregarHistorial = () => {
    console.log('Agregar historial médico');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButtonHeader}
        >
          <Image
            source={require('../../assets/images/volver.png')}
            style={styles.backIconHeader}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial Médico</Text>
      </View>

      {/* Lista de tarjetas médicas */}
      <FlatList
        data={historial}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TarjetaMedica
            nombre={item.nombre}
            estadoMedico={item.estadoMedico}
            descripcion={item.descripcion}
            condicion={item.condicion} // por compatibilidad si existiera
          />
        )}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
      />

      {/* Botón amarillo Agregar historial */}
      <TouchableOpacity style={styles.addButton} onPress={handleAgregarHistorial}>
        <Text style={styles.addButtonText}>+ Agregar historial médico</Text>
      </TouchableOpacity>
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

  addButton: {
    backgroundColor: '#fbbf24', // si usas Colors.background reestablece
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: { color: '#333', fontSize: 16, fontWeight: 'bold' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default HistorialMedico;
