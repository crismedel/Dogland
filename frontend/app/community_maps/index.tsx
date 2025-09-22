import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform, Alert, ScrollView } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location'; 

const CommunityMapScreen = () => {
  const router = useRouter();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportes, setReportes] = useState<any[]>([]); // Para almacenar los reportes cargados

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

  // Cargar los reportes desde el archivo JSON (simulado)
  useEffect(() => {
    // Simula la carga de datos desde el archivo JSON
    const cargarReportes = async () => {
      const response = require('../../assets/reportes.json'); // Ruta corregida para cargar el archivo desde la carpeta assets
      setReportes(response); // Guarda los reportes en el estado
    };

    cargarReportes();
    obtenerUbicacionActual(); // Llamar a la función para obtener la ubicación actual al cargar el componente
  }, []);

  // Función para determinar el color del marcador basado en el nivel de riesgo
  const obtenerColorMarcador = (nivelRiesgo: string) => {
    switch (nivelRiesgo) {
      case 'Bajo':
        return 'green'; // Verde para riesgo bajo
      case 'Moderado':
        return 'yellow'; // Amarillo para riesgo moderado
      case 'Alto':
        return 'red'; // Rojo para riesgo alto
      default:
        return 'blue'; // Azul por defecto si no se especifica el nivel de riesgo
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mapa Comunitario</Text>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location ? location.latitude : -38.7369, // Valor predeterminado si no hay ubicación
          longitude: location ? location.longitude : -72.5994, // Valor predeterminado si no hay ubicación
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* Verifica si la ubicación está disponible y muestra el marcador */}
        {location ? (
          <Marker
            coordinate={location}
            title="Ubicación Actual"
            description="Ubicación actual del usuario"
            pinColor="blue" 
          >
            <Callout style={styles.calloutContainer}>
              <View>
                <Text style={styles.calloutTitle}>Ubicación Actual</Text>
                <Text style={styles.calloutText}>Lat: {location.latitude}</Text>
                <Text style={styles.calloutText}>Lon: {location.longitude}</Text>
              </View>
            </Callout>
          </Marker>
        ) : (
          <Text style={styles.noLocationText}>Esperando ubicación...</Text>
        )}

        {/* Mostrar los reportes como marcadores */}
        {reportes.map((reporte, index) => {
          const colorMarcador = obtenerColorMarcador(reporte.nivelRiesgo); // Obtener el color basado en el nivel de riesgo

          return (
            <Marker
              key={index}
              coordinate={reporte.ubicacion}
              title={reporte.titulo}
              description={reporte.descripcion}
              pinColor={colorMarcador} // Asignar el color del marcador según el nivel de riesgo
            >
              <Callout style={styles.calloutContainer}>
                <ScrollView contentContainerStyle={styles.calloutContent}>
                  <View>
                    <Text style={styles.calloutTitle}>{reporte.titulo}</Text>
                    <Text style={styles.calloutText}>{reporte.descripcion}</Text>
                    <Text style={[styles.calloutText, { fontWeight: 'bold' }]}>Especie: {reporte.especie}</Text>
                    <Text style={[styles.calloutText, { fontWeight: 'bold' }]}>Estado de Salud: {reporte.estadoSalud}</Text>
                    <Text style={[styles.calloutText, { fontWeight: 'bold' }]}>Nivel de Riesgo: {reporte.nivelRiesgo}</Text>
                    <Text style={[styles.calloutText, { fontWeight: 'bold' }]}>Ubicación: Lat: {reporte.ubicacion.latitude}, Lon: {reporte.ubicacion.longitude}</Text>
                  </View>
                </ScrollView>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Menú flotante persistente */}
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
  noLocationText: {
    fontSize: 16,
    color: '#FF0000',
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  calloutContainer: {
    padding: 10,
    maxWidth: 250,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 4,
  },
  calloutContent: {
    paddingBottom: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calloutText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
});

export default CommunityMapScreen;
