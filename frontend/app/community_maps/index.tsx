// src/screens/CommunityMapScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import apiClient from '../../src/api/client';
import { ReporteMarker } from '../../src/components/report/ReporteMarker';
import { ReporteDetails } from '../../src/components/report/ReporteDetails';

interface Reporte {
  id_avistamiento: number;
  descripcion: string;
  direccion: string;
  id_especie: number;
  id_estado_salud: number;
  id_estado_avistamiento: number;
  fecha_creacion: string;
  latitude: number;
  longitude: number;
}

const CommunityMapScreen = () => {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: -38.7369,
    longitude: -72.5994,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [selectedSighting, setSelectedSighting] = useState<Reporte | null>(
    null,
  );

  const obtenerUbicacionActual = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setMapRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } else {
      Alert.alert('Permiso Denegado', 'No se puede acceder a la ubicación.');
    }
  };

  const obtenerReportes = async () => {
    try {
      const response = await apiClient.get(`/sightings`);
      setReportes(response.data.data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los reportes');
    }
  };

  const handleDelete = async () => {
    if (!selectedSighting) return;
    Alert.alert(
      'Confirmar Eliminación',
      '¿Estás seguro de que deseas eliminar este reporte?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(
                `/sightings/${selectedSighting.id_avistamiento}`,
              );
              setSelectedSighting(null);
              obtenerReportes();
              Alert.alert('Éxito', 'Reporte eliminado');
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el reporte.');
            }
          },
        },
      ],
    );
  };

  useEffect(() => {
    obtenerReportes();
    obtenerUbicacionActual();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mapa Comunitario</Text>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={mapRegion}
        onPress={() => setSelectedSighting(null)}
      >
        {location && (
          <Marker
            coordinate={location}
            title="Ubicación Actual"
            pinColor="blue"
          />
        )}

        {reportes.map((r) => (
          <ReporteMarker
            key={r.id_avistamiento}
            reporte={r}
            onSelect={setSelectedSighting}
          />
        ))}
      </MapView>

      {selectedSighting && (
        <ReporteDetails
          reporte={selectedSighting}
          onClose={() => setSelectedSighting(null)}
          onDelete={handleDelete}
        />
      )}

      {menuVisible && (
        <Animated.View style={styles.fabMenuContainer}>
          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={() => {
              setMenuVisible(false);
              router.push('/create-report');
            }}
          >
            <Text style={styles.fabMenuItemText}>Crear Reporte</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fabMenuItem, { marginTop: 10 }]}
            onPress={() => {
              setMenuVisible(false);
              router.push('/alerts/create-alert');
            }}
          >
            <Text style={styles.fabMenuItemText}>Crear Alerta</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => setMenuVisible(!menuVisible)}
      >
        <Text style={styles.fabText}>{menuVisible ? '×' : '+'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    paddingVertical: 15,
    textAlign: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  map: { flex: 1 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  fabText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  fabMenuContainer: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  fabMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    alignItems: 'center',
  },
  fabMenuItemText: { fontSize: 16, color: '#007AFF', fontWeight: '500' },
});

export default CommunityMapScreen;
