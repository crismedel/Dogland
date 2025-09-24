import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import axios from 'axios';

interface Reporte {
  descripcion: string;
  direccion: string;
  id_especie: number;
  id_estado_salud: number;
  id_estado_avistamiento: number;
  fecha_creacion: string;
  id_avistamiento: number;
  latitude: number;
  longitude: number;
}

const CommunityMapScreen = () => {
  const router = useRouter();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: -38.7369,
    longitude: -72.5994,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [selectedSighting, setSelectedSighting] = useState<Reporte | null>(null);

  const obtenerUbicacionActual = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso Denegado', 'No se puede acceder a la ubicación. Por favor, habilite los permisos de ubicación en la configuración de su dispositivo.');
      return;
    }
    
    let locationResult = await Location.getCurrentPositionAsync({});
    setLocation(locationResult.coords);
    
    setMapRegion({
      latitude: locationResult.coords.latitude,
      longitude: locationResult.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  const obtenerReportes = async () => {
    try {
      const response = await axios.get('http://172.20.10.3:3001/api/sightings');
      console.log('Reportes recibidos del backend:', response.data.data);
      setReportes(response.data.data);
    } catch (error) {
      console.error('Error al obtener los reportes:', error);
      Alert.alert('Error', 'No se pudieron cargar los reportes');
    }
  };

  useEffect(() => {
    obtenerReportes();
    obtenerUbicacionActual();
  }, []);

  const obtenerColorMarcador = (idEstadoSalud: number) => {
    switch (idEstadoSalud) {
        case 1:
            return 'green';
        case 2:
        case 3:
            return 'red';
        default:
            return 'blue';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mapa Comunitario</Text>

      <MapView
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

        {reportes.map((reporte, index) => {
          const colorMarcador = obtenerColorMarcador(reporte.id_estado_salud);
          return (
            <Marker
              key={index}
              coordinate={{
                latitude: reporte.latitude,
                longitude: reporte.longitude,
              }}
              pinColor={colorMarcador}
              onPress={(e) => {
                e.stopPropagation();
                setSelectedSighting(reporte);
              }}
            />
          );
        })}
      </MapView>

      {selectedSighting && (
        <View style={styles.floatingDetailsContainer}>
          <TouchableOpacity onPress={() => setSelectedSighting(null)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.scrollableContent}>
            <Text style={styles.detailTitle}>{selectedSighting.descripcion}</Text>
            <Text style={styles.detailText}><Text style={styles.boldText}>Dirección:</Text> {selectedSighting.direccion}</Text>
            <Text style={styles.detailText}><Text style={styles.boldText}>Especie ID:</Text> {selectedSighting.id_especie}</Text>
            <Text style={styles.detailText}><Text style={styles.boldText}>Estado de Salud ID:</Text> {selectedSighting.id_estado_salud}</Text>
            <Text style={styles.detailText}><Text style={styles.boldText}>Estado Avistamiento ID:</Text> {selectedSighting.id_estado_avistamiento}</Text>
            <Text style={styles.detailText}><Text style={styles.boldText}>Fecha:</Text> {new Date(selectedSighting.fecha_creacion).toLocaleDateString()}</Text>
            <Text style={styles.detailText}><Text style={styles.boldText}>ID:</Text> {selectedSighting.id_avistamiento}</Text>
          </ScrollView>
        </View>
      )}

      {menuVisible && (
        <Animated.View style={[styles.fabMenuContainer]}>
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
              router.push('/create-alert');
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
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
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
  map: {
    flex: 1,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
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
  fabMenuItemText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  floatingDetailsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    maxHeight: '60%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 26,
    color: '#999',
    fontWeight: '300',
  },
  scrollableContent: {
    paddingTop: 10,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 6,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#222',
  },
});

export default CommunityMapScreen;