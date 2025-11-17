import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
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

const { width } = Dimensions.get('window');

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

  // Función para obtener el ícono según el nivel de riesgo
  const getMarkerIcon = (nivelRiesgo: string) => {
    switch (nivelRiesgo.toLowerCase()) {
      case 'bajo':
        return 'alert-circle-outline';
      case 'medio':
        return 'warning-outline';
      case 'alto':
        return 'alert-circle';
      default:
        return 'alert-circle';
    }
  };

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
        <View style={styles.headerDetail}>
          <AppText style={styles.title}>{alert.titulo}</AppText>
          <View style={styles.typeBadge}>
            <Ionicons
              name="megaphone-outline"
              size={16}
              color={Colors.secondary}
            />
            <AppText style={styles.subtitle}>{alert.tipo}</AppText>
          </View>
        </View>

        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>Descripción</AppText>
          <AppText style={styles.description}>{alert.descripcion}</AppText>
        </View>

        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>Información adicional</AppText>
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons name="flame-outline" size={18} color={markerColor} />
              <AppText style={styles.infoLabel}>Riesgo</AppText>
              <AppText style={[styles.infoValue, { color: markerColor }]}>
                {alert.nivel_riesgo}
              </AppText>
            </View>
            <View style={styles.infoItem}>
              <Ionicons
                name="person-outline"
                size={18}
                color={Colors.secondary}
              />
              <AppText style={styles.infoLabel}>Creado por</AppText>
              <AppText style={styles.infoValue}>{alert.creado_por}</AppText>
            </View>
            <View style={styles.infoItem}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={Colors.secondary}
              />
              <AppText style={styles.infoLabel}>Fecha</AppText>
              <AppText style={styles.infoValue}>
                {new Date(alert.fecha_creacion).toLocaleDateString('es-ES')}
              </AppText>
            </View>
          </View>
        </View>

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
                  <View style={styles.customMarker}>
                    <View
                      style={[
                        styles.pinContainer,
                        { backgroundColor: markerColor },
                      ]}
                    >
                      <Ionicons
                        name={getMarkerIcon(alert.nivel_riesgo)}
                        size={20}
                        color="#fff"
                      />
                    </View>
                    <View
                      style={[styles.pinPoint, { borderTopColor: markerColor }]}
                    />
                  </View>

                  <Callout tooltip>
                    <View style={styles.calloutContainer}>
                      <AppText style={styles.calloutTitle}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  headerDetail: {
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: fontWeightBold,
    color: '#1A1A1A',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    gap: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: fontWeightSemiBold,
    color: Colors.secondary,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontWeight: fontWeightBold,
    marginBottom: 12,
    fontSize: 17,
    color: '#1A1A1A',
  },
  description: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: fontWeightSemiBold,
    textAlign: 'center',
  },
  mapCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  map: {
    height: width * 0.65,
    width: '100%',
  },
  customMarker: { alignItems: 'center' },
  pinContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    elevation: 6,
  },
  pinPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    minWidth: 180,
    maxWidth: 220,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  calloutTitle: {
    fontWeight: fontWeightBold,
    fontSize: 15,
    marginBottom: 8,
    color: '#1A1A1A',
  },
  calloutDivider: {
    height: 1,
    backgroundColor: Colors.cardBackground,
    marginBottom: 8,
  },
  calloutText: {
    fontSize: 13,
    marginBottom: 4,
    color: '#444',
  },
  calloutDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },
  noLocation: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.secondary,
    fontSize: 15,
  },
  errorText: {
    color: '#E53935',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: fontWeightMedium,
  },
});
