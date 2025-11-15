import {
  AppText,
  fontWeightBold,
  fontWeightMedium,
  fontWeightSemiBold,
} from '@/src/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  ImageBackground,
  Platform,
  View,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import apiClient from '../../src/api/client';
import { Colors } from '../../src/constants/colors';
import { Sighting } from '../../src/types/sighting';
import {
  obtenerNombreEspecie,
  obtenerNombreEstadoSalud,
} from '../../src/types/report';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = Math.round(width * 0.58);

const formatDateDDMMYYYY = (input?: string | null) => {
  if (!input) return 'N/A';
  const d = new Date(input);
  if (isNaN(d.getTime())) return input;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatCoords = (lat?: number | null, lon?: number | null) => {
  if (lat === undefined || lat === null || lon === undefined || lon === null)
    return null;
  return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
};

const openInMaps = async (
  lat?: number | null,
  lon?: number | null,
  label?: string,
) => {
  if (lat === undefined || lat === null || lon === undefined || lon === null) {
    Alert.alert(
      'Ubicación no disponible',
      'No hay coordenadas para abrir en el mapa.',
    );
    return;
  }
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'No se pudo abrir el mapa',
        'No hay una aplicación disponible para abrir el mapa.',
      );
    }
  } catch (e) {
    console.error('openInMaps error', e);
    Alert.alert('Error', 'No se pudo abrir la aplicación de mapas.');
  }
};

const SightingDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [sighting, setSighting] = useState<Sighting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchSightingDetails = async () => {
      try {
        if (!id) {
          setError('ID de avistamiento no proporcionado.');
          setLoading(false);
          return;
        }
        const response = await apiClient.get(`/sightings/${id}`);
        setSighting(response.data.data);
      } catch (err) {
        console.error('Error fetching sighting details:', err);
        Alert.alert(
          'Error',
          'No se pudo cargar la información del avistamiento.',
        );
        setError('No se pudo cargar la información del avistamiento.');
      } finally {
        setLoading(false);
      }
    };
    fetchSightingDetails();
  }, [id]);

  const handleEdit = () => {
    router.push(`/sightings/edit/${id}`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <AppText style={styles.text}>Cargando detalles...</AppText>
      </View>
    );
  }

  if (error || !sighting) {
    return (
      <View style={styles.centered}>
        <AppText style={styles.errorText}>
          {error || 'Avistamiento no encontrado.'}
        </AppText>
      </View>
    );
  }

  const primaryImageUrl =
    sighting.fotos_url && sighting.fotos_url.length > 0
      ? sighting.fotos_url[0]
      : null;

  const imageScale = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0, HERO_HEIGHT],
    outputRange: [2, 1, 1],
    extrapolate: 'clamp',
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT],
    outputRange: [0, -HERO_HEIGHT * 0.15],
    extrapolate: 'clamp',
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT * 0.35],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const InfoSection = ({ s }: { s: Sighting }) => {
    const fecha = formatDateDDMMYYYY(s.fecha_creacion);
    const especieDisplay =
      obtenerNombreEspecie?.(s.id_especie as number) || 'Especie desconocida';
    const saludDisplay =
      obtenerNombreEstadoSalud?.(s.id_estado_salud as number) ||
      'Estado desconocido';
    const direccion =
      // @ts-ignore
      s.direccion || s.address || (s as any).ubicacion_text || 'Sin dirección';
    const estaActivo = (s as any).activa === true;
    const estadoDisplay = estaActivo ? 'Activo' : 'Inactivo';
    const lat = (s as any).latitude ?? (s as any).lat ?? null;
    const lon = (s as any).longitude ?? (s as any).lng ?? null;
    const coordsDisplay = formatCoords(lat, lon) || 'Sin coordenadas';
    const riesgo = (s as any).nivel_riesgo || null;

    return (
      <View style={styles.infoSectionWrap}>
        {s.descripcion ? (
          <View style={styles.descriptionBox}>
            <AppText style={styles.descTitle}>Descripción</AppText>
            <AppText style={styles.descText}>{s.descripcion}</AppText>
          </View>
        ) : null}
        <View style={styles.infoCardNew}>
          <View style={styles.infoHeader}>
            <View>
              <AppText style={styles.infoTitle}>Información Clave</AppText>
              <AppText style={styles.infoSubtitle}>
                Detalles esenciales del avistamiento
              </AppText>
            </View>
            <View style={styles.infoHeaderIcon}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={Colors.primary}
              />
            </View>
          </View>

          <View style={styles.infoBody}>
            {/* --- Detalles del avistamiento --- */}
            <View style={styles.infoRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#eef8ff' }]}>
                <Ionicons name="calendar-outline" size={18} color="#2b6cff" />
              </View>
              <View style={styles.infoTextWrap}>
                <AppText style={styles.rowLabel}>Fecha de Creación</AppText>
                <AppText style={styles.rowValue}>{fecha}</AppText>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#f6fbf4' }]}>
                <Ionicons name="paw-outline" size={18} color="#2b7a78" />
              </View>
              <View style={styles.infoTextWrap}>
                <AppText style={styles.rowLabel}>Especie</AppText>
                <AppText style={styles.rowValue}>{especieDisplay}</AppText>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#fff7ec' }]}>
                <Ionicons name="medkit-outline" size={18} color="#e8772b" />
              </View>
              <View style={styles.infoTextWrap}>
                <AppText style={styles.rowLabel}>Estado de Salud</AppText>
                <AppText style={styles.rowValue}>{saludDisplay}</AppText>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#f0f4f8' }]}>
                <Ionicons name="location-sharp" size={18} color="#5b6b82" />
              </View>
              <View style={styles.infoTextWrap}>
                <AppText style={styles.rowLabel}>Dirección</AppText>
                <AppText style={styles.rowValue}>{direccion}</AppText>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: estaActivo ? '#e6fbf0' : '#f4f4f6' },
                ]}
              >
                <Ionicons
                  name={estaActivo ? 'checkmark-circle' : 'close-circle'}
                  size={18}
                  color={estaActivo ? Colors.success : Colors.darkGray}
                />
              </View>
              <View style={styles.infoTextWrap}>
                <AppText style={styles.rowLabel}>
                  Estado del avistamiento
                </AppText>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 4,
                  }}
                >
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: estaActivo ? '#E6FBF0' : '#F1F1F3' },
                    ]}
                  >
                    <AppText
                      style={[
                        styles.statusBadgeText,
                        {
                          color: estaActivo ? Colors.success : Colors.darkGray,
                        },
                      ]}
                    >
                      {estadoDisplay}
                    </AppText>
                  </View>

                  {riesgo ? (
                    <View style={[styles.riskBadge, { marginLeft: 8 }]}>
                      <AppText style={styles.riskBadgeText}>{riesgo}</AppText>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#fff5f3' }]}>
                <Ionicons name="map-outline" size={18} color="#c85a4d" />
              </View>
              <View style={styles.infoTextWrap}>
                <AppText style={styles.rowLabel}>Ubicación</AppText>
                <View
                  style={{
                    marginTop: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <AppText
                    style={[styles.rowValue, { flex: 1 }]}
                    numberOfLines={1}
                  >
                    {coordsDisplay}
                  </AppText>

                  <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                    <TouchableOpacity
                      onPress={() => openInMaps(lat, lon, s.descripcion)}
                      style={styles.mapBtn}
                      accessibilityLabel="Ver en mapa"
                    >
                      <Ionicons
                        name="navigate-circle-outline"
                        size={20}
                        color={Colors.primary}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.mapBtn, { marginLeft: 8 }]}
                      accessibilityLabel="Copiar coordenadas"
                    >
                      <Ionicons
                        name="copy-outline"
                        size={18}
                        color={Colors.darkGray}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.text} />

      {/* TODO SE MUEVE JUNTOS */}
      <Animated.ScrollView
        contentContainerStyle={{
          paddingHorizontal: 0,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        {/* HERO DENTRO DEL SCROLL */}
        <View style={styles.heroContainer}>
          <Animated.View
            style={[
              styles.heroImageWrapper,
              {
                transform: [
                  { translateY: imageTranslateY },
                  { scale: imageScale },
                ],
              },
            ]}
          >
            {primaryImageUrl ? (
              <ImageBackground
                source={{ uri: primaryImageUrl }}
                style={styles.heroImage}
                imageStyle={{ resizeMode: 'cover' }}
              >
                <View style={styles.heroOverlay} />
              </ImageBackground>
            ) : (
              <View style={[styles.heroImage, styles.placeholder]}>
                <Ionicons
                  name="image-outline"
                  size={64}
                  color={Colors.lightText}
                />
                <AppText style={styles.placeholderText}>
                  Sin Imagen Reportada
                </AppText>
              </View>
            )}
          </Animated.View>

          {/* Botones sobre la imagen */}
          <View style={styles.heroTopRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.iconBtn}
              accessibilityLabel="Volver"
            >
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            <TouchableOpacity
              onPress={() =>
                Alert.alert('Compartir', 'Funcionalidad de compartir.')
              }
              style={styles.iconBtn}
              accessibilityLabel="Compartir"
            >
              <Ionicons name="share-social-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Título sobre la imagen */}
          <Animated.View
            style={[styles.heroTitleWrap, { opacity: headerTitleOpacity }]}
          ></Animated.View>
        </View>

        {/* CONTENIDO DEBAJO */}
        <View style={{ paddingHorizontal: 18, marginTop: 16 }}>
          <View style={styles.sheetHandle} />

          <View style={styles.titleRow}>
            <TouchableOpacity
              onPress={handleEdit}
              style={styles.editFab}
              accessibilityLabel="Editar"
            >
              <Ionicons name="pencil" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <InfoSection s={sighting} />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

/* --- ESTILOS --- */
const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  text: { fontSize: 16, color: Colors.darkGray, marginTop: 10 },
  errorText: {
    fontSize: 18,
    color: Colors.danger,
    textAlign: 'center',
    fontWeight: fontWeightBold,
  },
  heroContainer: {
    width: '100%',
    height: HERO_HEIGHT,
    backgroundColor: Colors.text,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroImageWrapper: {
    width: '100%',
    height: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.text,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.text,
  },
  placeholderText: {
    color: Colors.lightText,
    fontSize: 16,
    marginTop: 8,
    fontWeight: fontWeightSemiBold as any,
  },
  heroTopRow: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight ?? 12 : 12,
    left: 15,
    right: 15,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitleWrap: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    right: 80,
    zIndex: 6,
  },
  heroTitleText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: fontWeightBold as any,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 14,
  },
  sheetHandle: {
    width: 56,
    height: 5,
    backgroundColor: '#EEE',
    borderRadius: 6,
    alignSelf: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: fontWeightBold,
    color: Colors.text,
    flex: 1,
    marginRight: 10,
  },
  editFab: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSectionWrap: { marginTop: 12 },
  infoCardNew: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  infoHeaderIcon: {
    backgroundColor: '#eff3ff',
    borderRadius: 8,
    padding: 6,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: fontWeightSemiBold,
    color: Colors.text,
  },
  infoSubtitle: {
    fontSize: 13,
    color: Colors.darkGray,
    marginTop: 2,
  },
  infoBody: { gap: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTextWrap: { flex: 1 },
  rowLabel: {
    fontSize: 13,
    color: Colors.darkGray,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: fontWeightMedium,
    color: Colors.text,
  },
  mapBtn: {
    padding: 6,
    backgroundColor: '#f7f8f9',
    borderRadius: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: fontWeightSemiBold,
  },
  riskBadge: {
    backgroundColor: '#ffe8e5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  riskBadgeText: {
    color: '#c85a4d',
    fontSize: 13,
    fontWeight: fontWeightSemiBold,
  },
  descriptionBox: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 18,
    padding: 16,
  },
  descTitle: {
    fontSize: 16,
    fontWeight: fontWeightSemiBold,
    marginBottom: 6,
    color: Colors.text,
  },
  descText: {
    fontSize: 14,
    color: Colors.darkGray,
    lineHeight: 20,
  },
});

export default SightingDetailScreen;
