import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Link } from 'expo-router';
import apiClient from '../../src/api/client';

// La interfaz debe coincidir con los datos que provienen de tu backend
interface Sighting {
  id_avistamiento: number;
  descripcion: string;
  id_especie: number;
  id_estado_salud: number;
  fecha_creacion: string;
  // Añade aquí las demás propiedades si las necesitas, como ubicación, etc.
}

const AvistamientosScreen = () => {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSightings = useCallback(async () => {
    try {
      const response = await apiClient.get('/sightings');
      // Asegúrate de acceder a los datos de la misma forma que en el mapa
      setSightings(response.data.data);
    } catch (error) {
      console.error('Error al obtener los avistamientos:', error);
      alert('Hubo un problema al cargar los avistamientos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSightings();
  }, [fetchSightings]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fbbf24" />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: Sighting; index: number }) => {
    // Función para formatear la fecha a dd-mm-yyyy si es necesario
    const formatDate = (dateString: string) => {
      if (!dateString) return 'Fecha inválida';
      const parts = dateString.split('-'); // Asume formato dd-mm-yyyy
      if (parts.length === 3) {
        return `${parts[0]}-${parts[1]}-${parts[2]}`;
      }
      return 'Fecha inválida';
    };

    return (
      <Link
        href={{
          pathname: '/sightings/[id]',
          params: { id: item.id_avistamiento },
        }}
        asChild
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.descripcion}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Especie:</Text>
            <Text style={styles.value}>{item.id_especie || 'Desconocida'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Estado de Salud:</Text>
            <Text style={styles.value}>
              {item.id_estado_salud || 'Desconocido'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha:</Text>

            <Text style={styles.value}>{formatDate(item.fecha_creacion)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>ID Avistamiento:</Text>
            <Text style={styles.value}>{item.id_avistamiento}</Text>
          </View>
        </View>
      </Link>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sightings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id_avistamiento?.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              No hay avistamientos registrados.
            </Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchSightings();
            }}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f7' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: { marginTop: 10, fontSize: 16, color: '#6b7280' },
  listContent: { padding: 10 },
  card: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  infoRow: { flexDirection: 'row', marginBottom: 5 },
  label: { fontSize: 14, fontWeight: '500', color: '#4b5563', width: 120 },
  value: { fontSize: 14, color: '#374151', flexShrink: 1 },
  emptyText: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
});

export default AvistamientosScreen;
