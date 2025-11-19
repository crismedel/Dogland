import {
  AppText,
  fontWeightBold,
  fontWeightMedium,
  fontWeightSemiBold,
} from '@/src/components/AppText';
import Spinner from '@/src/components/UI/Spinner';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ImageBackground,
  Linking,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import apiClient from '../../src/api/client';
import { Sighting } from '../../src/types/sighting';
import {
  obtenerNombreEspecie,
  obtenerNombreEstadoSalud,
} from '../../src/types/report';

// 1. Hooks y Contextos (Fusionados)
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';
import { useNotification } from '@/src/components/notifications';
import { useAuth } from '@/src/contexts/AuthContext';
import DropDownPicker from 'react-native-dropdown-picker';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = Math.round(width * 0.58);

// --- Helpers de Estado ---
const getSightingStatusName = (id: number) => {
  if (id === 1) return 'Activo';
  if (id === 2) return 'Desaparecido';
  if (id === 3) return 'Observado';
  if (id === 4) return 'Recuperado';
  if (id === 5) return 'Cerrado';
  return 'Desconocido';
};
const CERRADO_STATUS_ID = 5;

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

const SightingDetailScreen = () => {
  // 2. Hook de temas (De tu compañero)
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification(); // (Fusionado)

  const [sighting, setSighting] = useState<Sighting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  // --- Estados para Modales (Mío) ---
  const [isCloseModalVisible, setCloseModalVisible] = useState(false);
  const [closeReason, setCloseReason] = useState<string | null>(null);
  const [closeComment, setCloseComment] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [openReasonPicker, setOpenReasonPicker] = useState(false);
  const [reasonItems, setReasonItems] = useState([
    { label: 'Animal Rescatado', value: 'Rescatado' },
    { label: 'No Encontrado / Desaparecido', value: 'No Encontrado' },
    { label: 'Falsa Alarma', value: 'Falsa Alarma' },
    { label: 'Reporte Duplicado', value: 'Duplicado' },
    { label: 'Otro (ver comentario)', value: 'Otro' },
  ]);

  // --- Función de Mapa (Fusionada con showInfo/showError) ---
  const openInMaps = async (
    lat?: number | null,
    lon?: number | null,
    label?: string,
  ) => {
    if (lat === undefined || lat === null || lon === undefined || lon === null) {
      showError(
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
        showError(
          'No se pudo abrir el mapa',
          'No hay una aplicación disponible para abrir el mapa.',
        );
      }
    } catch (e) {
      console.error('openInMaps error', e);
      showError('Error', 'No se pudo abrir la aplicación de mapas.');
    }
  };

  const fetchSightingDetails = useCallback(async () => {
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
      showError('Error', 'No se pudo cargar la información del avistamiento.');
      setError('No se pudo cargar la información del avistamiento.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSightingDetails();
  }, [fetchSightingDetails]);

  // --- HANDLERS (Fusionados) ---
  const handleEdit = () => {
    router.push(`/sightings/edit/${id}`);
  };

  const handleConfirmCloseSighting = async () => {
    if (!closeReason || !sighting) {
      showError('Error', 'Debes seleccionar un motivo.');
      return;
    }
    setIsClosing(true);
    const fullReason = closeComment
      ? `${closeReason}: ${closeComment}`
      : closeReason;

    let newStatusId;
    if (closeReason === 'Rescatado') newStatusId = 4;
    else if (closeReason === 'No Encontrado') newStatusId = 2;
    else newStatusId = 5;

    try {
      await apiClient.patch(`/sightings/${sighting.id_avistamiento}/close`, {
        newStatusId: newStatusId,
        reason: fullReason,
      });
      showSuccess('Éxito', 'Reporte actualizado.');
      setCloseModalVisible(false);
      setCloseReason(null);
      setCloseComment('');
      fetchSightingDetails(); 
    } catch (err) {
      showError('Error', 'No se pudo actualizar el reporte.');
    } finally {
      setIsClosing(false);
    }
  };

  if (loading) {
    return <Spinner />;
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

  // --- LÓGICA DE PERMISOS (Mía) ---
  // @ts-ignore - 'id_usuario' puede no estar en el tipo 'Sighting' importado pero viene de la API
  const canModify = user?.role === 'Admin' || user?.id === sighting?.id_usuario;
  const isClosed = sighting?.id_estado_avistamiento === CERRADO_STATUS_ID; 

  // --- LÓGICA DE IMAGEN (Mía - Base64) ---
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

  // --- Componente InfoSection ---
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

    const estadoDisplay = getSightingStatusName(s.id_estado_avistamiento);
    const estaActivo = s.id_estado_avistamiento === 1;

    const lat = (s as any).latitude ?? (s as any).lat ?? null;
    const lon = (s as any).longitude ?? (s as any).lng ?? null;
    const coordsDisplay = formatCoords(lat, lon) || 'Sin coordenadas';
    const riesgo = (s as any).nivel_riesgo || null;
    
    // @ts-ignore
    const motivoCierre = s.motivo_cierre || null; 

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
                color={colors.primary}
              />
            </View>
          </View>

          <View style={styles.infoBody}>
            <View style={styles.infoRow}>
              <View style={[styles.iconCircle, styles.iconCircleInfo]}>
                <Ionicons name="calendar-outline" size={18} color={colors.info} />
              </View>
              <View style={styles.infoTextWrap}>
                <AppText style={styles.rowLabel}>Fecha de Creación</AppText>
                <AppText style={styles.rowValue}>{fecha}</AppText>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.iconCircle, styles.iconCircleSuccess]}>
                <Ionicons name="paw-outline" size={18} color={colors.success} />
              </View>
              <View style={styles.infoTextWrap}>
                <AppText style={styles.rowLabel}>Especie</AppText>
                <AppText style={styles.rowValue}>{especieDisplay}</AppText>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.iconCircle, styles.iconCircleWarning]}>
                <Ionicons name="medkit-outline" size={18} color={colors.secondary} />
              </View>
              <View style={styles.infoTextWrap}>
                <AppText style={styles.rowLabel}>Estado de Salud</AppText>
                <AppText style={styles.rowValue}>{saludDisplay}</AppText>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.iconCircle, styles.iconCircleGray]}>
                <Ionicons name="location-sharp" size={18} color={colors.darkGray} />
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
                  estaActivo ? styles.iconCircleSuccess : styles.iconCircleGray,
                ]}
              >
                <Ionicons
                  name={estaActivo ? 'checkmark-circle' : 'lock-closed-outline'} 
                  size={18}
                  color={estaActivo ? colors.success : colors.darkGray}
                />
              </View>
              <View style={styles.infoTextWrap}>
                <AppText style={styles.rowLabel}>
                  Estado del avistamiento
                </AppText>
                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: estaActivo ? `${colors.success}20` : `${colors.gray}40` },
                    ]}
                  >
                    <AppText
                      style={[
                        styles.statusBadgeText,
                        { color: estaActivo ? colors.success : colors.darkGray },
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
            
            {/* --- Mostrar Motivo de Cierre --- */}
            {!estaActivo && motivoCierre && (
              <View style={styles.infoRow}>
                <View style={[styles.iconCircle, styles.iconCircleGray]}>
                  <Ionicons name="document-text-outline" size={18} color={colors.darkGray} />
                </View>
                <View style={styles.infoTextWrap}>
                  <AppText style={styles.rowLabel}>Motivo de Cierre</AppText>
                  <AppText style={styles.rowValue}>{motivoCierre}</AppText>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <View style={[styles.iconCircle, styles.iconCircleDanger]}>
                <Ionicons name="map-outline" size={18} color={colors.danger} />
              </View>
              <View style={styles.infoTextWrap}>
                <AppText style={styles.rowLabel}>Ubicación</AppText>
                <View style={{marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                  <AppText style={[styles.rowValue, { flex: 1 }]} numberOfLines={1}>
                    {coordsDisplay}
                  </AppText>

                  <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                    <TouchableOpacity
                      onPress={() => openInMaps(lat, lon, s.descripcion)}
                      style={styles.mapBtn}
                      accessibilityLabel="Ver en mapa"
                    >
                      <Ionicons name="navigate-circle-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.mapBtn, { marginLeft: 8 }]}
                      accessibilityLabel="Copiar coordenadas"
                      onPress={() => {
                         if (coordsDisplay) {
                           // Falta importar Clipboard o usar API nativa, por ahora showSuccess
                           showSuccess('Copiado', 'Coordenadas listas.'); 
                         } else {
                           showError('Error', 'No hay coordenadas.');
                         }
                      }}
                    >
                      <Ionicons name="copy-outline" size={18} color={colors.darkGray} />
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
      <StatusBar barStyle="light-content" backgroundColor={isDark ? colors.backgroundSecon : colors.text} />

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
              // La propiedad 'source' acepta Data URIs (Base64) directamente
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
                  color={isDark ? colors.text : colors.lightText}
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
              <Ionicons name="chevron-back" size={22} color={isDark ? colors.text : colors.lightText} />
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            <TouchableOpacity
              onPress={() => showInfo('Compartir', 'Funcionalidad de compartir.')}
              style={styles.iconBtn}
              accessibilityLabel="Compartir"
            >
              <Ionicons name="share-social-outline" size={20} color={isDark ? colors.text : colors.lightText} />
            </TouchableOpacity>
          </View>

          <Animated.View
            style={[styles.heroTitleWrap, { opacity: headerTitleOpacity }]}
          ></Animated.View>
        </View>

        {/* CONTENIDO DEBAJO */}
        <View style={{ paddingHorizontal: 18, marginTop: 16 }}>
          <View style={styles.sheetHandle} />

          <View style={styles.titleRow}>
            <View style={{flex: 1}}>
              {/* @ts-ignore */}
              <AppText style={styles.mainTitle} numberOfLines={2}>{sighting.titulo || "Detalle del Avistamiento"}</AppText>
            </View>

            {/* --- BOTONES CONDICIONALES --- */}
            {canModify && (
              <TouchableOpacity
                onPress={handleEdit}
                style={styles.editFab}
                accessibilityLabel="Editar"
              >
                <Ionicons name="pencil" size={18} color={colors.cardBackground} />
              </TouchableOpacity>
            )}
            {!isClosed && canModify && (
              <TouchableOpacity
                onPress={() => setCloseModalVisible(true)} 
                style={[styles.editFab, { backgroundColor: colors.success, marginLeft: 10 }]}
                accessibilityLabel="Cerrar Reporte"
              >
                <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <InfoSection s={sighting} />
        </View>
      </Animated.ScrollView>

      {/* --- MODAL DE CIERRE --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCloseModalVisible}
        onRequestClose={() => setCloseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle}>Cerrar Avistamiento</AppText>
            <AppText style={styles.modalSubtitle}>
              Selecciona un motivo para cerrar este reporte.
            </AppText>

            <DropDownPicker
              open={openReasonPicker}
              value={closeReason}
              items={reasonItems}
              setOpen={setOpenReasonPicker}
              setValue={setCloseReason}
              setItems={setReasonItems}
              placeholder="Selecciona un motivo"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={3000}
            />
            
            <TextInput
              style={styles.modalTextInput}
              placeholder="Comentario adicional (opcional)"
              value={closeComment}
              onChangeText={setCloseComment}
            />
            
            <TouchableOpacity 
              style={[styles.modalButton, {backgroundColor: colors.primary}]} 
              onPress={handleConfirmCloseSighting}
              disabled={isClosing}
            >
              {isClosing 
                ? <ActivityIndicator color="#fff" /> 
                : <AppText style={styles.modalButtonText}>Confirmar Cierre</AppText>
              }
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, {backgroundColor: colors.gray}]} 
              onPress={() => setCloseModalVisible(false)}
            >
              <AppText style={[styles.modalButtonText, {color: '#000'}]}>Cancelar</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

// Estilos Dinámicos
const getStyles = (colors: ColorsType, isDark: boolean) => StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: { fontSize: 16, color: colors.darkGray, marginTop: 10 },
  errorText: {
    fontSize: 18,
    color: colors.danger,
    textAlign: 'center',
    fontWeight: fontWeightBold,
  },
  heroContainer: {
    width: '100%',
    height: HERO_HEIGHT,
    backgroundColor: isDark ? colors.backgroundSecon : colors.text,
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
    backgroundColor: isDark ? colors.backgroundSecon : colors.text,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: isDark ? colors.text : colors.lightText,
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
    color: isDark ? colors.text : colors.lightText,
    fontSize: 20,
    fontWeight: fontWeightBold as any,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 14,
  },
  sheetHandle: {
    width: 56,
    height: 5,
    backgroundColor: colors.gray,
    borderRadius: 6,
    alignSelf: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0, 
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: fontWeightBold,
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },
  editFab: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSectionWrap: { marginTop: 12 },
  infoCardNew: {
    backgroundColor: colors.cardBackground,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: isDark ? 0.1 : 0.07,
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
    backgroundColor: `${colors.primary}20`,
    borderRadius: 8,
    padding: 6,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: fontWeightSemiBold,
    color: colors.text,
  },
  infoSubtitle: {
    fontSize: 13,
    color: colors.darkGray,
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
  // Icon circle variants
  iconCircleInfo: { backgroundColor: `${colors.info}20` },
  iconCircleSuccess: { backgroundColor: `${colors.success}20` },
  iconCircleWarning: { backgroundColor: `${colors.warning}20` },
  iconCircleGray: { backgroundColor: `${colors.gray}40` },
  iconCircleDanger: { backgroundColor: `${colors.danger}20` },

  infoTextWrap: { flex: 1 },
  rowLabel: {
    fontSize: 13,
    color: colors.darkGray,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: fontWeightMedium,
    color: colors.text,
  },
  mapBtn: {
    padding: 6,
    backgroundColor: colors.backgroundSecon,
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
    backgroundColor: `${colors.danger}20`,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  riskBadgeText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: fontWeightSemiBold,
  },
  descriptionBox: {
    backgroundColor: colors.cardBackground,
    marginBottom: 16,
    borderRadius: 18,
    padding: 16,
  },
  descTitle: {
    fontSize: 16,
    fontWeight: fontWeightSemiBold,
    marginBottom: 6,
    color: colors.text,
  },
  descText: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
  },
  
  // --- ESTILOS PARA LOS MODALES ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    zIndex: 2000,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: fontWeightBold,
    textAlign: 'center',
    color: colors.text,
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: colors.gray,
    marginBottom: 20,
  },
  dropdown: {
    marginBottom: 15,
    borderColor: colors.gray,
    backgroundColor: isDark ? '#333' : '#fff',
  },
  dropdownContainer: {
    borderColor: colors.gray,
    backgroundColor: isDark ? '#333' : '#fff',
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: isDark ? '#333' : '#fff',
    color: colors.text,
  },
  modalButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: fontWeightBold,
  },
});

export default SightingDetailScreen;