import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../src/api/client';
import { Colors } from '@/src/constants/colors';
import { useNotification } from '@/src/components/notifications';
import {
  obtenerNombreEspecie,
  obtenerNombreEstadoSalud,
} from '../../src/types/report';
import { AppText, fontWeightSemiBold } from '@/src/components/AppText';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { Ionicons } from '@expo/vector-icons';

interface MySighting {
  id_avistamiento: number;
  descripcion: string;
  fecha_creacion: string;
  direccion: string;
  id_estado_salud: number;
  id_estado_avistamiento: number;
  id_especie: number;
}

const MySightingCard = ({
  sighting,
  onPress,
}: {
  sighting: MySighting;
  onPress: () => void;
}) => {
  // Lógica de MySightingCard
  const estadoSaludNombre = obtenerNombreEstadoSalud(sighting.id_estado_salud);
  const especieNombre = obtenerNombreEspecie(sighting.id_especie);
  const estadoAvistamientoNombre = obtenerNombreEstadoSalud(
    sighting.id_estado_avistamiento,
  ); // Usando un solo helper temporal
  const isCritical = sighting.id_estado_salud === 3;
  const shortDescription =
    sighting.descripcion.length > 50
      ? sighting.descripcion.substring(0, 50) + '...'
      : sighting.descripcion;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, isCritical && styles.criticalCard]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <AppText style={styles.cardTitle}>{shortDescription}</AppText>

      <View style={styles.infoRow}>
        <Ionicons
          name="paw-outline"
          size={16}
          color={Colors.darkGray}
          style={{ marginRight: 8 }}
        />
        <AppText style={styles.label}>Especie ID:</AppText>
        <AppText style={styles.value}>{sighting.id_especie}</AppText>
      </View>

      <View style={styles.infoRow}>
        <Ionicons
          name="medkit-outline"
          size={16}
          color={isCritical ? Colors.danger : Colors.darkGray}
          style={{ marginRight: 8 }}
        />
        <AppText style={styles.label}>Salud ID:</AppText>
        <AppText
          style={[
            styles.value,
            isCritical && { color: Colors.danger, fontWeight: '700' },
          ]}
        >
          {sighting.id_estado_salud}
        </AppText>
      </View>

      <View style={styles.infoRow}>
        <Ionicons
          name="list-outline"
          size={16}
          color={Colors.darkGray}
          style={{ marginRight: 8 }}
        />
        <AppText style={styles.label}>Estado Av. ID:</AppText>
        <AppText style={styles.value}>
          {sighting.id_estado_avistamiento}
        </AppText>
      </View>

      <AppText style={styles.cardDate}>
        Reportado: {formatDate(sighting.fecha_creacion)}
      </AppText>
    </TouchableOpacity>
  );
};

const MySightingsScreen = () => {
  const router = useRouter();
  const { showSuccess } = useNotification();

  const [sightings, setSightings] = useState<MySighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🚨 Bandera para evitar el bucle de recarga infinita en el montaje inicial.
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const fetchMySightings = useCallback(
    async (showNotification = false) => {
      // Se usa 'refreshing' o 'loading' para evitar que se ejecute la recarga si ya está en curso
      if (loading && !refreshing && initialLoadComplete) return;

      // Solo establecemos loading si no es una recarga manual (pull-to-refresh)
      if (!refreshing) {
        setLoading(true);
      }

      setError(null);
      try {
        const response = await apiClient.get('/sightings/me');
        setSightings(response.data.data);

        if (showNotification) {
          showSuccess('Actualización', 'Tus reportes han sido actualizados.');
        }
      } catch (err: any) {
        console.error('Error fetching my sightings:', err);
        const errorMessage =
          err.response?.status === 401
            ? 'Sesión expirada o no iniciada. Por favor, inicia sesión para ver tus reportes.'
            : 'No se pudieron cargar tus avistamientos. Inténtalo de nuevo.';
        setError(errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
        // Marcamos que la carga inicial terminó, previniendo el bucle.
        setInitialLoadComplete(true);
      }
    },
    [loading, refreshing, showSuccess, initialLoadComplete],
  ); // Añadimos initialLoadComplete a las dependencias

  useEffect(() => {
    if (!initialLoadComplete) {
      fetchMySightings();
    }
  }, [initialLoadComplete, fetchMySightings]);

  // Función de Recarga que activa la notificación
  const handleRefresh = () => {
    setRefreshing(true);
    // Llamamos a la función con el flag para mostrar notificación
    fetchMySightings(true);
  };

  const handlePressSighting = (id: number) => {
    router.push({
      pathname: '/sightings/[id]',
      params: { id: id.toString() },
    });
  };

  const renderItem = ({ item }: { item: MySighting }) => (
    <MySightingCard
      sighting={item}
      onPress={() => handlePressSighting(item.id_avistamiento)}
    />
  );

  if (loading && sightings.length === 0 && !error) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <AppText style={styles.loadingText}>
          Cargando tus avistamientos...
        </AppText>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title="Mis Avistamientos"
        rightComponent={
          <TouchableOpacity onPress={handleRefresh}>
            <Ionicons name="refresh-outline" size={24} color={'#fff'} />
          </TouchableOpacity>
        }
      />

      {error ? (
        <View style={styles.centered}>
          <AppText style={styles.errorText}>{error}</AppText>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <AppText style={styles.retryText}>Reintentar</AppText>
          </TouchableOpacity>
        </View>
      ) : sightings.length === 0 ? (
        <View style={styles.centered}>
          <AppText style={styles.emptyText}>
            Aún no has creado ningún avistamiento. ¡Anímate a reportar!
          </AppText>
          <TouchableOpacity
            onPress={() => router.push('/create-report')}
            style={styles.retryButton}
          >
            <AppText style={styles.retryText}>Crear Reporte Ahora</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sightings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id_avistamiento.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            // Se usa handleRefresh directamente en el onRefresh
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
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
  loadingText: { marginTop: 10, fontSize: 16, color: Colors.primary },
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
    fontWeight: fontWeightSemiBold,
    color: '#1f2937',
    marginBottom: 10,
  },
  infoRow: { flexDirection: 'row', marginBottom: 5 },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    width: 120,
  },
  value: { fontSize: 14, color: '#374151', flexShrink: 1 },
  emptyText: { fontSize: 16, color: Colors.gray, textAlign: 'center' },
  errorText: {
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 16,
    fontWeight: '700',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  retryText: { color: 'white', fontWeight: 'bold' },
  cardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.darkGray,
    width: 100,
  },
  cardValue: {
    fontSize: 14,
    color: Colors.text,
    flexShrink: 1,
  },
  cardDate: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 10,
    textAlign: 'right',
  },
});

export default MySightingsScreen;
