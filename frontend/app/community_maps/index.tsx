import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location'; // Asegúrate de tener esta importación

const CommunityMapScreen = () => {
  const router = useRouter();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  // Función para obtener la ubicación actual del usuario
  const obtenerUbicacionActual = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permiso Denegado', 'No se puede acceder a la ubicación');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location.coords); // Establece la ubicación en el estado
  };

  useEffect(() => {
    obtenerUbicacionActual(); // Llamar a la función para obtener la ubicación actual al cargar el componente
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mapa Comunitario</Text>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location ? location.latitude : 37.7749,  // Valor predeterminado si no hay ubicación
          longitude: location ? location.longitude : -122.4194,  // Valor predeterminado si no hay ubicación
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {location && (
          <Marker coordinate={location} title="Ubicación Actual" />
        )}
      </MapView>

      {/* Menú flotante persistente */}
      {menuVisible && (
        <Animated.View style={[styles.fabMenuContainer]}>
          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={() => {
              setMenuVisible(false);
              // Redirigir a la pantalla de reportes
              router.push('/create-report');
            }}
          >
            <Text style={styles.fabMenuItemText}>Crear Reporte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fabMenuItem, { marginTop: 10 }]}
            onPress={() => {
              setMenuVisible(false);
              // Redirigir a la pantalla de alertas
              router.push('/create-alert');
            }}
          >
            <Text style={styles.fabMenuItemText}>Crear Alerta</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Botón flotante principal */}
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
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: '80%',
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
  },
  fabText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  fabMenuContainer: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
  },
  fabMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  fabMenuItemText: {
    fontSize: 16,
    color: '#007AFF',
  },
});

export default CommunityMapScreen;
