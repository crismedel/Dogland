// app/adoption/misPostulaciones.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';

const mockPostulaciones = [
  { id: '1', animal: 'Luna', estado: 'pendiente', fecha: '2025-09-20' },
  { id: '2', animal: 'Thor', estado: 'aprobada', fecha: '2025-09-18' },
];
 
const MisPostulaciones = () => {
  const [postulaciones, setPostulaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Aquí luego reemplazar por fetch("http://localhost:3001/api/adoption-requests?userId=XX")
        setPostulaciones(mockPostulaciones);
      } catch (error) {
        console.error('Error cargando postulaciones:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔹 Cancelar postulación
  const handleCancelar = async (id: string) => {
    Alert.alert(
      "Cancelar solicitud",
      "¿Estás seguro de que quieres cancelar esta solicitud?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              // Llamada real (cuando tengas el backend listo):
              // await fetch(`http://localhost:3001/api/adoption-requests/${id}`, { method: 'DELETE' });

              // Simulación en mock: quitar de la lista
              setPostulaciones((prev) => prev.filter((p) => p.id !== id));
            } catch (error) {
              console.error("Error cancelando postulación:", error);
              Alert.alert("Error", "No se pudo cancelar la solicitud.");
            }
          }
        }
      ]
    );
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
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require('../../assets/images/volver.png')}
            style={styles.backIconHeader}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Postulaciones ({postulaciones.length})</Text>
      </View>

      {/* Lista */}
      <FlatList
        data={postulaciones}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.animal}</Text>
            <Text>Estado: {item.estado}</Text>
            <Text>Fecha: {item.fecha}</Text>

            {item.estado.toLowerCase() === 'pendiente' && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelar(item.id)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    padding: 12,
    marginTop: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginLeft: 16 },
  backIconHeader: { width: 24, height: 24, tintColor: '#fff' },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e63946',
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#fff', fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default MisPostulaciones;
