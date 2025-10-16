import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchAlertById } from '../../src/api/alerts';
import { Alert as AlertType, riskStyles } from '../../src/types/alert';
import { Colors } from '@/src/constants/colors';
import CustomHeader from '@/src/components/UI/CustomHeader';
import CustomButton from '@/src/components/UI/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

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
      <View style={styles.container}>
        <CustomHeader
          title="Detalle de Alerta"
          leftComponent={
            <TouchableOpacity onPress={() => router.back()}>
              <Image
                source={require('../../assets/images/volver.png')}
                style={{ width: 24, height: 24, tintColor: '#fff' }}
              />
            </TouchableOpacity>
          }
        />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.secondary} />
          <AppText style={styles.loadingText}>Cargando alerta...</AppText>
        </View>
      </View>
    );
  }

  // Mostrar mensaje de error si ocurrió un problema o no se encontró la alerta
  if (error || !alert) {
    return (
      <View style={styles.container}>
        <CustomHeader
          title="Detalle de Alerta"
          leftComponent={
            <TouchableOpacity onPress={() => router.back()}>
              <Image
                source={require('../../assets/images/volver.png')}
                style={{ width: 24, height: 24, tintColor: '#fff' }}
              />
            </TouchableOpacity>
          }
        />
        <View style={styles.center}>
          <AppText style={styles.errorText}>
            {error || 'Alerta no encontrada'}
          </AppText>
          <CustomButton
            title="Volver"
            onPress={() => router.back()}
            variant="primary"
            icon="arrow-back-outline"
            style={{ marginTop: 16 }}
          />
        </View>
      </View>
    );
  }

  // Obtener el color del marcador según el nivel de riesgo
  const markerColor = riskStyles[alert.nivel_riesgo].color;

  // Renderizado principal con detalles de la alerta
  return (
    <View style={styles.container}>
      {/* Header con back y acción opcional */}
      <CustomHeader
        title="Detalle de Alerta"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              style={{ width: 24, height: 24, tintColor: '#fff' }}
            />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity
            onPress={() => {
              /* acción opcional: compartir, editar, etc. */
            }}
          >
            <Ionicons name="share-outline" size={22} color="#fff" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Encabezado con título y tipo de alerta */}
        <View style={styles.headerDetail}>
          <AppText style={styles.title}>{alert.titulo}</AppText>
          <AppText style={styles.subtitle}>{alert.tipo}</AppText>
        </View>

        {/* Descripción de la alerta */}
        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>Descripción</AppText>
          <AppText style={styles.description}>{alert.descripcion}</AppText>
        </View>

        {/* Información adicional: nivel de riesgo, creador y fecha */}
        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>Información adicional</AppText>
          <View style={styles.infoContainer}>
            <View style={styles.infoBox}>
              <AppText style={styles.infoLabel}>Nivel de Riesgo</AppText>
              <AppText
                style={[
                  styles.infoValue,
                  { color: riskStyles[alert.nivel_riesgo].color },
                ]}
              >
                {alert.nivel_riesgo}
              </AppText>
            </View>
            <View style={styles.infoBox}>
              <AppText style={styles.infoLabel}>Creado por</AppText>
              <AppText style={styles.infoValue}>{alert.creado_por}</AppText>
            </View>
            <View style={styles.infoBox}>
              <AppText style={styles.infoLabel}>Fecha de creación</AppText>
              <AppText style={styles.infoValue}>
                {new Date(alert.fecha_creacion).toLocaleDateString()}
              </AppText>
            </View>
          </View>
        </View>

        {/* Ubicación */}
        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>Ubicación</AppText>
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
              >
                <Marker coordinate={location}>
                  {/* Marcador personalizado estilo mapa comunitario */}
                  <View style={styles.customMarker}>
                    {/* Círculo con color dinámico según nivel de riesgo */}
                    <View
                      style={[
                        styles.markerCircle,
                        { backgroundColor: markerColor },
                      ]}
                    >
                      <AppText style={styles.markerEmoji}>⚠️</AppText>
                    </View>
                    {/* Triángulo apuntando hacia abajo */}
                    <View
                      style={[
                        styles.markerTriangle,
                        { borderTopColor: markerColor },
                      ]}
                    />
                  </View>

                  {/* Callout personalizado con información de la alerta */}
                  <Callout tooltip>
                    <View style={styles.calloutContainer}>
                      <AppText style={styles.calloutTitle} numberOfLines={2}>
                        {alert.titulo}
                      </AppText>
                      <View style={styles.calloutDivider} />
                      <AppText style={styles.calloutText}>
                        📍 {alert.tipo}
                      </AppText>
                      <AppText
                        style={[styles.calloutText, { color: markerColor }]}
                      >
                        🚨 {alert.nivel_riesgo}
                      </AppText>
                      <AppText style={styles.calloutDate}>
                        📅{' '}
                        {new Date(alert.fecha_creacion).toLocaleDateString(
                          'es-ES',
                        )}
                      </AppText>
                    </View>
                  </Callout>
                </Marker>
              </MapView>
            </View>
          ) : (
            <AppText style={styles.noLocation}>
              {alert.direccion || 'Ubicación no disponible'}
            </AppText>
          )}
        </View>

        {/* Botón para volver a la pantalla anterior con CustomButton */}
        <CustomButton
          title="Volver a la lista"
          onPress={() => router.back()}
          variant="primary"
          icon="arrow-back-outline"
          style={{ marginTop: 10 }}
        />
      </ScrollView>
    </View>
  );
};

export default AlertDetailScreen;

// Estilos para los componentes de la pantalla
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContent: { padding: 20 },
  // TITULO + SUBTITULO
  headerDetail: { marginBottom: 20, marginTop: 20 },
  title: {
    fontSize: 24,
    fontWeight: fontWeightBold,
    color: '#222',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: fontWeightMedium,
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
  },
  sectionTitle: {
    fontWeight: fontWeightSemiBold,
    marginBottom: 12,
    fontSize: 16,
  },
  description: { fontSize: 15, color: '#444' },
  // INFO EXTRA
  infoContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  infoBox: { flex: 1, alignItems: 'center', padding: 12 },
  infoLabel: { fontSize: 12, color: '#777' },
  infoValue: {
    fontSize: 14,
    fontWeight: fontWeightSemiBold,
  },
  // MAPA
  mapCard: { borderRadius: 12, overflow: 'hidden' },
  map: { height: 250, width: '100%' },
  noLocation: { textAlign: 'center', padding: 16, color: '#666' },
  // ESTADOS DE ERROR Y LOADING
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: {
    color: '#E53935',
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  loadingText: { marginTop: 8, color: Colors.secondary },

  // MARCADOR PERSONALIZADO (estilo mapa comunitario)
  customMarker: { alignItems: 'center' },
  markerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 4,
  },
  markerEmoji: { fontSize: 20 },
  markerTriangle: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },

  // CALLOUT PERSONALIZADO
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    minWidth: 160,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  calloutTitle: {
    fontWeight: fontWeightSemiBold,
    fontSize: 14,
    marginBottom: 6,
  },
  calloutDivider: { height: 1, backgroundColor: '#ddd', marginBottom: 6 },
  calloutText: { fontSize: 13, marginBottom: 3 },
  calloutDate: { fontSize: 12, color: '#888', marginTop: 4 },
});
