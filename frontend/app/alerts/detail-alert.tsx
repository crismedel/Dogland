import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  Pressable, // Importar Pressable
  ActivityIndicator,
  Text, // Importar Text
  TouchableOpacity,
  Linking,
  Platform, // Importar Platform
  Animated, // Importar Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import CustomButton from '../../src/components/UI/CustomButton';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import { fetchAlertById } from '../../src/api/alerts';
// 3. Importar la FUNCIÓN getRiskStyles y el TIPO Alert
import {
  Alert as AlertType,
  getRiskStyles,
} from '@/src/types/alert';
import CustomHeader from '@/src/components/UI/CustomHeader';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';
import MapView, { Marker, Callout } from 'react-native-maps';
import Spinner from '@/src/components/UI/Spinner';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

const { width } = Dimensions.get('window');

const AlertDetailScreen = () => {
  // 4. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

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

  // 4. Generar los estilos de riesgo dinámicamente
  const riskStyles = getRiskStyles(colors);

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

  // 7. Usar el componente Spinner para la carga
  if (loading) {
    return <Spinner />;
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
                // 6. Usar colores del tema
                style={{
                  width: 24,
                  height: 24,
                  tintColor: isDark ? colors.lightText : colors.text,
                }}
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
              // 6. Usar colores del tema
              style={{
                width: 24,
                height: 24,
                tintColor: isDark ? colors.lightText : colors.text,
              }}
            />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity
            onPress={() => {
              /* acción opcional: compartir, editar, etc. */
            }}
          >
            {/* 6. Usar colores del tema */}
            <Ionicons
              name="share-outline"
              size={22}
              color={isDark ? colors.lightText : colors.text}
            />
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
              color={colors.secondary} // 6. Usar colores del tema
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
                color={colors.secondary} // 6. Usar colores del tema
              />
              <AppText style={styles.infoLabel}>Creado por</AppText>
              <AppText style={styles.infoValue}>{alert.creado_por}</AppText>
            </View>
            <View style={styles.infoItem}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={colors.secondary} // 6. Usar colores del tema
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
                        color={colors.lightText} // 6. Usar colores del tema
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

// 7. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background }, // Dinámico
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
      color: colors.text, // Dinámico
      letterSpacing: 0.3,
      marginBottom: 8,
    },
    typeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${colors.info}20`, // Dinámico
      borderRadius: 20,
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: `${colors.info}40`, // Dinámico
      gap: 6,
    },
    subtitle: {
      fontSize: 14,
      fontWeight: fontWeightSemiBold,
      color: colors.secondary, // Dinámico
    },
    card: {
      backgroundColor: colors.cardBackground, // Dinámico
      borderRadius: 20,
      padding: 18,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.1 : 0.08, // Dinámico
      shadowRadius: 6,
      elevation: 3,
    },
    sectionTitle: {
      fontWeight: fontWeightBold,
      marginBottom: 12,
      fontSize: 17,
      color: colors.text, // Dinámico
    },
    description: {
      fontSize: 15,
      color: colors.darkGray, // Dinámico
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
      color: colors.darkGray, // Dinámico
      textTransform: 'uppercase',
    },
    infoValue: {
      fontSize: 14,
      fontWeight: fontWeightSemiBold,
      textAlign: 'center',
      color: colors.text, // Dinámico
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
      borderColor: colors.cardBackground, // Dinámico
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
      backgroundColor: colors.cardBackground, // Dinámico
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
      color: colors.text, // Dinámico
    },
    calloutDivider: {
      height: 1,
      backgroundColor: colors.backgroundSecon, // Dinámico
      marginBottom: 8,
    },
    calloutText: {
      fontSize: 13,
      marginBottom: 4,
      color: colors.darkGray, // Dinámico
    },
    calloutDate: {
      fontSize: 12,
      color: colors.darkGray, // Dinámico
      marginTop: 6,
    },
    noLocation: {
      textAlign: 'center',
      padding: 20,
      color: colors.darkGray, // Dinámico
      fontSize: 14,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      color: colors.secondary, // Dinámico
      fontSize: 15,
    },
    errorText: {
      color: colors.danger, // Dinámico
      fontSize: 16,
      textAlign: 'center',
      fontWeight: fontWeightMedium,
    },
  });