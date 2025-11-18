import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';

import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import apiClient from '../../src/api/client';
import { ReporteDetails } from '../../src/components/report/ReporteDetails';
import { useNotification } from '@/src/components/notifications';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

import {
  obtenerNombreEspecie,
  obtenerNombreEstadoSalud,
} from '../../src/types/report';

import {
  AppText,
  fontWeightSemiBold,
  fontWeightMedium,
  fontWeightBold,
} from '@/src/components/AppText';
import CustomHeader from '@/src/components/UI/CustomHeader';
import Spinner from '@/src/components/UI/Spinner';

interface MySighting {
  id_avistamiento: number;
  titulo: string;
  descripcion: string;
  fecha_creacion: string;
  direccion: string;
  id_estado_salud: number;
  id_estado_avistamiento: number;
  id_especie: number;
  id_usuario: number;
  motivo_cierre?: string;
  latitude?: number;
  longitude?: number;
}

const getSightingStatusName = (id: number) => {
  switch (id) {
    case 1:
      return 'Activo';
    case 2:
      return 'Desaparecido';
    case 3:
      return 'Observado';
    case 4:
      return 'Recuperado';
    case 5:
      return 'Cerrado';
    default:
      return 'Desconocido';
  }
};

const CERRADO_STATUS_ID = 5;

const MySightingCard = ({
  sighting,
  onPress,
}: {
  sighting: MySighting;
  onPress: () => void;
}) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const estadoSaludNombre = obtenerNombreEstadoSalud(sighting.id_estado_salud);
  const especieNombre = obtenerNombreEspecie(sighting.id_especie);
  const estadoAvistamientoNombre = getSightingStatusName(
    sighting.id_estado_avistamiento,
  );

  const isCritical = sighting.id_estado_salud === 3;
  const isClosed = sighting.id_estado_avistamiento === CERRADO_STATUS_ID;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isCritical && styles.criticalCard,
        isClosed && styles.closedCard,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <AppText style={styles.cardTitle} numberOfLines={1}>
          {sighting.titulo || sighting.descripcion}
        </AppText>

        <View
          style={[
            styles.badge,
            isClosed
              ? styles.badgeClosed
              : isCritical
              ? styles.badgeCritical
              : styles.badgeActive,
          ]}
        >
          <AppText style={styles.badgeText}>{estadoAvistamientoNombre}</AppText>
        </View>
      </View>

      <AppText style={styles.cardDescription} numberOfLines={2}>
        {sighting.descripcion}
      </AppText>

      <View style={styles.infoRow}>
        <Ionicons
          name="paw-outline"
          size={16}
          color={colors.darkGray}
          style={{ marginRight: 8 }}
        />
        <AppText style={styles.label}>Especie:</AppText>
        <AppText style={styles.value}>{especieNombre}</AppText>
      </View>

      <View style={styles.infoRow}>
        <Ionicons
          name="medkit-outline"
          size={16}
          color={isCritical ? colors.danger : colors.darkGray}
          style={{ marginRight: 8 }}
        />
        <AppText style={styles.label}>Salud:</AppText>
        <AppText
          style={[
            styles.value,
            isCritical && { color: colors.danger, fontWeight: '700' },
          ]}
        >
          {estadoSaludNombre}
        </AppText>
      </View>

      {isClosed && sighting.motivo_cierre && (
        <View style={styles.reasonContainer}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.darkGray}
            style={{ marginRight: 6 }}
          />
          <AppText style={styles.reasonText}>
            Motivo: {sighting.motivo_cierre}
          </AppText>
        </View>
      )}

      <AppText style={styles.cardDate}>
        Reportado: {formatDate(sighting.fecha_creacion)}
      </AppText>
    </TouchableOpacity>
  );
};

const MySightingsScreen = () => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const router = useRouter();
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth();

  const [sightings, setSightings] = useState<MySighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const [selectedSighting, setSelectedSighting] = useState<MySighting | null>(
    null,
  );

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

  const fetchMySightings = useCallback(
    async (showNotification = false) => {
      if (loading && !refreshing && initialLoadComplete) return;
      if (!refreshing) setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get('/sightings/me');
        setSightings(response.data.data);
        if (showNotification) {
          showSuccess('Actualización', 'Tus reportes han sido actualizados.');
        }
      } catch (err: any) {
        console.error('Error fetching my sightings:', err);
        const errorMessage =
          err.response?.status === 401
            ? 'Sesión expirada. Por favor, inicia sesión.'
            : 'No se pudieron cargar tus avistamientos.';
        setError(errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setInitialLoadComplete(true);
      }
    },
    [loading, refreshing, showSuccess, initialLoadComplete],
  );

  useEffect(() => {
    if (!initialLoadComplete) {
      fetchMySightings();
    }
  }, [initialLoadComplete, fetchMySightings]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMySightings(true);
  };

  const handlePressSighting = (sighting: MySighting) => {
    setSelectedSighting(sighting);
  };

  const handleDelete = async () => {
    if (!selectedSighting) return;
    try {
      await apiClient.delete(`/sightings/${selectedSighting.id_avistamiento}`);
      showSuccess('Éxito', 'Reporte eliminado');
      setSelectedSighting(null);
      fetchMySightings();
    } catch (err) {
      showError('Error', 'No se pudo eliminar el reporte.');
    }
  };

  const handleConfirmCloseSighting = async () => {
    if (!closeReason || !selectedSighting) {
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
      await apiClient.patch(
        `/sightings/${selectedSighting.id_avistamiento}/close`,
        {
          newStatusId,
          reason: fullReason,
        },
      );
      showSuccess('Éxito', 'Reporte actualizado.');
      setCloseModalVisible(false);
      setSelectedSighting(null);
      setCloseReason(null);
      setCloseComment('');
      fetchMySightings();
    } catch (err) {
      showError('Error', 'No se pudo actualizar el reporte.');
    } finally {
      setIsClosing(false);
    }
  };

  const renderItem = ({ item }: { item: MySighting }) => (
    <MySightingCard sighting={item} onPress={() => handlePressSighting(item)} />
  );

  if (loading && sightings.length === 0 && !error) {
    return <Spinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title="Mis Avistamientos"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: isDark ? colors.lightText : colors.text,
              }}
            />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity onPress={handleRefresh}>
            <Ionicons
              name="refresh-outline"
              size={24}
              color={isDark ? colors.lightText : colors.text}
            />
          </TouchableOpacity>
        }
      />

      {error ? (
        <View style={styles.centered}>
          <AppText style={styles.errorText}>{error}</AppText>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <AppText style={styles.retryText}>Reintentar</AppText>
          </TouchableOpacity>
        </View>
      ) : sightings.length === 0 ? (
        <View style={styles.centered}>
          <AppText style={styles.emptyText}>
            Aún no has creado ningún avistamiento. ¡Anímate a reportar!
          </AppText>
          <TouchableOpacity
            onPress={() => router.push('/create-report')}
            style={styles.retryButton}
          >
            <AppText style={styles.retryText}>Crear Reporte Ahora</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sightings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id_avistamiento.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      {selectedSighting && (
        <ReporteDetails
          reporte={selectedSighting}
          onClose={() => setSelectedSighting(null)}
          onDelete={handleDelete}
          distance={null}
          onCloseSighting={() => setCloseModalVisible(true)}
          canModify={
            user?.role === 'Admin' || user?.id === selectedSighting.id_usuario
          }
        />
      )}

      <Modal
        animationType="fade"
        transparent
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
              multiline
            />

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.accent }]}
              onPress={handleConfirmCloseSighting}
              disabled={isClosing}
            >
              {isClosing ? (
                <ActivityIndicator color={colors.cardBackground} />
              ) : (
                <AppText style={styles.modalButtonText}>
                  Confirmar Cierre
                </AppText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: colors.cardBackground },
              ]}
              onPress={() => setCloseModalVisible(false)}
            >
              <AppText style={[styles.modalButtonText, { color: colors.text }]}>
                Cancelar
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: colors.primary,
    },
    listContent: { padding: 10 },
    card: {
      backgroundColor: colors.cardBackground,
      padding: 15,
      borderRadius: 12,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    criticalCard: {
      backgroundColor: `${colors.danger}20`,
      borderColor: colors.danger,
      borderWidth: 2,
      padding: 15,
      borderRadius: 12,
      marginBottom: 10,
      shadowColor: colors.danger,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5.46,
      elevation: 8,
    },
    closedCard: {
      opacity: 0.6,
      backgroundColor: colors.cardBackground,
      borderColor: colors.darkGray,
      borderWidth: 1,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: fontWeightSemiBold,
      color: colors.text,
      flex: 1,
      marginRight: 10,
    },
    cardDescription: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 10,
    },
    infoRow: {
      flexDirection: 'row',
      marginBottom: 5,
      alignItems: 'center',
    },
    label: {
      fontSize: 14,
      fontWeight: fontWeightMedium,
      color: colors.darkGray,
      width: 120,
    },
    value: {
      fontSize: 14,
      color: colors.text,
      flexShrink: 1,
    },
    reasonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      padding: 10,
      backgroundColor: colors.backgroundSecon,
      borderRadius: 8,
    },
    reasonText: {
      fontSize: 14,
      color: colors.darkGray,
      marginLeft: 6,
      flexShrink: 1,
    },
    cardDate: {
      fontSize: 12,
      color: colors.gray,
      textAlign: 'right',
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      minWidth: 70,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeClosed: {
      backgroundColor: colors.darkGray,
    },
    badgeCritical: {
      backgroundColor: colors.danger,
    },
    badgeActive: {
      backgroundColor: colors.success,
    },
    badgeText: {
      color: colors.lightText,
      fontWeight: '600',
      fontSize: 12,
    },
    errorText: {
      color: colors.danger,
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 15,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: fontWeightBold,
      marginBottom: 10,
      color: colors.text,
    },
    modalSubtitle: {
      fontSize: 16,
      marginBottom: 20,
      color: colors.text,
    },
    dropdown: {
      marginBottom: 20,
      borderColor: colors.secondary,
      backgroundColor: colors.backgroundSecon,
    },
    dropdownContainer: {
      backgroundColor: colors.backgroundSecon,
      borderColor: colors.secondary,
    },
    modalTextInput: {
      height: 80,
      borderColor: colors.secondary,
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
      marginBottom: 20,
      textAlignVertical: 'top',
      color: colors.text,
      fontSize: 14,
    },
    modalButton: {
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalButtonText: {
      color: colors.lightText,
      fontWeight: '700',
      fontSize: 16,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginTop: 15,
      alignSelf: 'center',
    },
    retryText: {
      color: isDark ? colors.lightText : colors.text,
      fontWeight: 'bold',
    },
    emptyText: {
      fontSize: 16,
      color: colors.darkGray,
      textAlign: 'center',
    },
  });

export default MySightingsScreen;
