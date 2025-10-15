import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../src/api/client';
import { Colors } from '@/src/constants/colors';
import { useNotification } from '@/src/components/notifications/NotificationContext';
import {
  obtenerNombreEspecie,
  obtenerNombreEstadoSalud,
} from '../../src/types/report';

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
  const { showSuccess } = useNotification();

  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [criticalSightings, setCriticalSightings] = useState<Sighting[]>([]);

  const fetchSightings = useCallback(async () => {
    try {
      const response = await apiClient.get('/sightings');
      setSightings(response.data.data);
    } catch (error) {
      console.error('Error al obtener los avistamientos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchCriticalSightings = useCallback(async () => {
    try {
      const response = await apiClient.get('/sightings/filter', {
        params: { id_estado_salud: 3 },
      });
      setCriticalSightings(response.data.data);
    } catch (error) {
      console.error('Error al obtener avistamientos críticos:', error);
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
    fetchCriticalSightings();
  }, [fetchSightings, fetchCriticalSightings]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const currentCriticalCount = criticalSightings.length;
      await fetchCriticalSightings();
      const newCriticalCount = criticalSightings.length;

      if (newCriticalCount > currentCriticalCount) {
        showSuccess(
          '¡Alerta!',
          `Hay ${newCriticalCount - currentCriticalCount} nuevos avistamientos críticos.`,
        );
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [criticalSightings, fetchCriticalSightings, showSuccess]);

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

    const isCritical = item.id_estado_salud === 3;
    const cardStyle = isCritical ? styles.criticalCard : styles.card;

    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={() => handlePressSighting(item.id_avistamiento)}
        activeOpacity={0.8}
      >
        <Text style={styles.cardTitle}>{item.descripcion}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Especie:</Text>
          <Text style={styles.value}>
            {obtenerNombreEspecie(item.id_especie) || 'Desconocida'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Estado Salud:</Text>
          <Text style={styles.value}>
            {obtenerNombreEstadoSalud(item.id_estado_salud) || 'Desconocido'}
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
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando avistamientos...</Text>
      </View>
    );
  }

  const combinedSightings = [
    ...criticalSightings,
    ...sightings.filter(
      (s) => !criticalSightings.find((c) => c.id_avistamiento === s.id_avistamiento)
    ),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={combinedSightings}
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
              fetchCriticalSightings();
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
    backgroundColor: Colors.lightText,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  criticalCard: {
    backgroundColor: '#FFE5E5',
    borderColor: Colors.danger || 'red',
    borderWidth: 2,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: Colors.danger || 'red',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5.46,
    elevation: 8,
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