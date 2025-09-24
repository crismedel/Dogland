import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Image,
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

  // Función para obtener el color según el nivel de riesgo
  const getRiskColor = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'bajo':
        return '#4CAF50';
      case 'medio':
        return '#FF9800';
      case 'alto':
        return '#FF5722';
      case 'crítico':
        return '#E91E63';
      default:
        return '#666';
    }
  };

  // Definir la ubicación para el mapa si la alerta tiene latitud y longitud válidas
  const location =
    alert && alert.latitude != null && alert.longitude != null
      ? { latitude: alert.latitude, longitude: alert.longitude }
      : null;

  // Mostrar indicador de carga mientras se obtienen los datos
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d97706" />
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Encabezado con título y tipo de alerta */}
        <View style={styles.headerDetail}>
          <Text style={styles.title}>{alert.titulo}</Text>
          <Text style={styles.subtitle}>{alert.tipo}</Text>
        </View>

        {/* Descripción de la alerta */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{alert.descripcion}</Text>
        </View>

        {/* Información adicional: nivel de riesgo, creador y fecha */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Información adicional</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Nivel de Riesgo</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: getRiskColor(alert.nivel_riesgo) },
                ]}
              >
                {alert.nivel_riesgo}
              </Text>
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
        </View>

        {/* Ubicación */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          {location ? (
            <View style={styles.mapCard}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                loadingEnabled
                loadingIndicatorColor="#d97706"
                loadingBackgroundColor="#e1e4e8"
                showsUserLocation={false}
                showsMyLocationButton={false}
                zoomControlEnabled={true}
                mapType="standard"
              >
                {/* Marcador en la ubicación de la alerta */}
                <Marker coordinate={location} title={alert.titulo} />
              </MapView>
            </View>
          ) : (
            <Text style={styles.noLocation}>
              {alert.direccion || 'Ubicación no disponible'}
            </Text>
          )}
        </View>

        {/* Botón para volver a la pantalla anterior */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Volver a la lista</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AlertDetailScreen;

// Estilos para los componentes de la pantalla
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },

  placeholder: {
    width: 32, // Para balancear el botón de volver
  },

  scrollContent: {
    padding: 20,
  },

  // TITULO + SUBTITULO
  headerDetail: {
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#d97706',
    fontWeight: '600',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  // SECCIONES TIPO CARD
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
  },
  description: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },

  // INFO EXTRA
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#f8f9fc',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#777',
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
  },

  // MAPA
  mapCard: {
    overflow: 'hidden',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  map: {
    height: 250,
    width: '100%',
  },
  noLocation: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    padding: 16,
    textAlign: 'center',
    backgroundColor: '#f8f9fc',
    borderRadius: 8,
  },

  // BOTON VOLVER
  backButton: {
    backgroundColor: '#fbbf24',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  // ESTADOS DE ERROR Y LOADING
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E53935',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#d97706',
    fontWeight: '600',
    fontSize: 16,
  },
});
