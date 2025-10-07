import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity, // Usaremos TouchableOpacity para las tarjetas
} from 'react-native';
import { useRouter } from 'expo-router'; 
import apiClient from '../../src/api/client';
// Ya no necesitamos SightingDetails ni Modal aquí

interface Sighting {
  id_avistamiento: number;
  descripcion: string;
  id_especie: number;
  id_estado_salud: number;
  fecha_creacion: string;
  fotos_url: string[];
  nivel_riesgo: string;
  activa: boolean;
  latitude?: number;
  longitude?: number;
}

const AvistamientosScreen = () => {
  const router = useRouter(); 

  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Eliminamos: selectedSighting y modalVisible

  const fetchSightings = useCallback(async () => {
    try {
      const response = await apiClient.get('/sightings');
      setSightings(response.data.data);
    } catch (error) {
      console.error('Error al obtener los avistamientos:', error);
      alert('Hubo un problema al cargar los avistamientos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handlePressSighting = (id: number) => {
    router.push({
      pathname: '/sightings/[id]',
      params: { id: id.toString() },
    });
  };

  useEffect(() => {
    fetchSightings();
  }, [fetchSightings]);

  const renderItem = ({ item }: { item: Sighting; index: number }) => {
    const formatDate = (dateString: string) => {
      if (!dateString) return 'Fecha inválida';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString();
      } catch {
        return 'Fecha inválida';
      }
    };

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => handlePressSighting(item.id_avistamiento)} 
        activeOpacity={0.8}
      >
        <Text style={styles.cardTitle}>{item.descripcion}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Especie ID:</Text>
          <Text style={styles.value}>{item.id_especie || 'Desconocida'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Estado Salud ID:</Text>
          <Text style={styles.value}>
            {item.id_estado_salud || 'Desconocido'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Fecha:</Text>
          <Text style={styles.value}>{formatDate(item.fecha_creacion)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && sightings.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fbbf24" />
        <Text style={styles.loadingText}>Cargando avistamientos...</Text>
      </View>
    );
  }

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