import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchAlertById } from '../../src/api/alerts';
import { Alert as AlertType } from '../../src/types/alert';

const AlertDetailScreen = () => {
  // Hook para manejar la navegación
  const router = useRouter();
  // Obtener el parámetro 'id' de la URL o ruta local
  const { id } = useLocalSearchParams<{ id: string }>();

  // Estado para almacenar la alerta obtenida
  const [alert, setAlert] = useState<AlertType | null>(null);
  // Estado para controlar la carga de datos
  const [loading, setLoading] = useState(true);
  // Estado para manejar errores
  const [error, setError] = useState<string | null>(null);

  // useEffect para cargar la alerta cuando cambia el 'id'
  useEffect(() => {
    // Si no hay id, mostrar error y detener carga
    if (!id) {
      setError('ID de alerta no proporcionado');
      setLoading(false);
      return;
    }

    // Función asíncrona para obtener la alerta desde la API
    const loadAlert = async () => {
      try {
        setLoading(true); // Iniciar indicador de carga
        const alertData = await fetchAlertById(Number(id)); // Obtener datos de alerta
        setAlert(alertData); // Guardar alerta en estado
      } catch (e) {
        setError('Error al cargar la alerta'); // Manejar error en la carga
      } finally {
        setLoading(false); // Finalizar indicador de carga
      }
    };

    loadAlert();
  }, [id]);

  // Definir la ubicación para el mapa si la alerta tiene latitud y longitud válidas
  const location =
    alert && alert.latitude != null && alert.longitude != null
      ? { latitude: alert.latitude, longitude: alert.longitude }
      : null;

  // Mostrar indicador de carga mientras se obtienen los datos
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Cargando alerta...</Text>
      </View>
    );
  }

  // Mostrar mensaje de error si ocurrió un problema o no se encontró la alerta
  if (error || !alert) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Alerta no encontrada'}</Text>
        <TouchableOpacity
          onPress={() => router.back()} // Botón para volver a la pantalla anterior
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Renderizado principal con detalles de la alerta
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Encabezado con título y tipo de alerta */}
      <View style={styles.header}>
        <Text style={styles.title}>{alert.titulo}</Text>
        <Text style={styles.subtitle}>{alert.tipo}</Text>
      </View>

      {/* Descripción de la alerta */}
      <Text style={styles.description}>{alert.descripcion}</Text>

      {/* Información adicional: nivel de riesgo, creador y fecha */}
      <View style={styles.infoContainer}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Nivel de Riesgo</Text>
          <Text style={styles.infoValue}>{alert.nivel_riesgo}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Creado por</Text>
          <Text style={styles.infoValue}>{alert.creado_por}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Fecha de creación</Text>
          <Text style={styles.infoValue}>
            {new Date(alert.fecha_creacion).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Mostrar mapa si hay ubicación válida */}
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          loadingEnabled
          loadingIndicatorColor="#4A90E2"
          loadingBackgroundColor="#e1e4e8"
          showsUserLocation={false}
          showsMyLocationButton={false}
          zoomControlEnabled={true}
          mapType="standard"
        >
          {/* Marcador en la ubicación de la alerta */}
          <Marker coordinate={location} title={alert.titulo} />
        </MapView>
      ) : (
        // Mostrar texto si no hay ubicación disponible
        <Text style={styles.noLocation}>
          {alert.direccion || 'Ubicación no disponible'}
        </Text>
      )}

      {/* Botón para volver a la pantalla anterior */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AlertDetailScreen;

// Estilos para los componentes de la pantalla
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#D32F2F',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
  },
  subtitle: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
    marginTop: 4,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '700',
  },
  map: {
    height: 220,
    borderRadius: 15,
    marginBottom: 30,
  },
  noLocation: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
