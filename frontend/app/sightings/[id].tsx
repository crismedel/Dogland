import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import apiClient from '../../src/api/client';
interface SightingDetails {
  id_avistamiento: number;
  descripcion: string;
  ubicacion: {
    latitude: number;
    longitude: number;
  };
  especie: {
    nombre: string;
  };
  estadoSalud: {
    nombre: string;
  };
  fecha_creacion: string;
}

const SightingDetailsScreen = () => {
  // El ID que se recibe del Link debe ser el id_avistamiento
  const { id } = useLocalSearchParams();
  const [sighting, setSighting] = useState<SightingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSightingDetails = async () => {
      try {
        if (!id) return;
        // ✨ CORRECCIÓN 1: La ruta del API ahora utiliza el id_avistamiento
        const response = await apiClient.get(`/sightings/${id}`);
        // ✨ CORRECCIÓN 2: Accede a 'data' para obtener el avistamiento
        setSighting(response.data.data);
      } catch (err) {
        console.error('Error fetching sighting details:', err);
        setError('No se pudo cargar la información del avistamiento.');
      } finally {
        setLoading(false);
      }
    };

    fetchSightingDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fbbf24" />
        <Text style={styles.text}>Cargando detalles...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!sighting) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>Avistamiento no encontrado.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Detalles del Avistamiento</Text>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: sighting.ubicacion?.latitude || -38.7369,
              longitude: sighting.ubicacion?.longitude || -72.5994,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            {sighting.ubicacion && (
              <Marker
                coordinate={sighting.ubicacion}
                title="Ubicación del Avistamiento"
              />
            )}
          </MapView>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Descripción:</Text>
            <Text style={styles.value}>{sighting.descripcion}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Especie:</Text>
            {/* ✨ CORRECCIÓN 3: Muestra el nombre de la especie */}
            <Text style={styles.value}>
              {sighting.especie?.nombre || 'Desconocida'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Estado de Salud:</Text>
            {/* ✨ CORRECCIÓN 4: Muestra el nombre del estado de salud */}
            <Text style={styles.value}>
              {sighting.estadoSalud?.nombre || 'Desconocido'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha:</Text>
            {/* Muestra la fecha tal como viene */}
            <Text style={styles.value}>{sighting.fecha_creacion}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f7' },
  scrollViewContent: { paddingBottom: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16, color: '#6b7280', marginTop: 10 },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center' },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginVertical: 20,
  },
  mapContainer: {
    width: '90%',
    height: 300,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  map: { ...StyleSheet.absoluteFillObject },
  detailsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    minWidth: 120,
    marginRight: 10,
  },
  value: { fontSize: 16, color: '#374151', flexShrink: 1 },
});

export default SightingDetailsScreen;
