import {
  AppText,
  fontWeightBold,
  fontWeightMedium,
  fontWeightSemiBold,
} from '@/src/components/AppText';
import { useNotification } from '@/src/components/notifications';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { Colors } from '@/src/constants/colors';
import { useAuth } from '@/src/contexts/AuthContext'; // <-- AÑADIDO
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  StyleSheet, // <-- AÑADIDO
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker'; // <-- AÑADIDO
import apiClient from '../../src/api/client';
import { ReporteDetails } from '../../src/components/report/ReporteDetails'; // <-- AÑADIDO
import {
  obtenerNombreEspecie,
  obtenerNombreEstadoSalud,
} from '../../src/types/report';

// Interfaz expandida para incluir todos los datos necesarios
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
  motivo_cierre?: string; // <-- AÑADIDO
  // Añade latitude y longitude si ReporteDetails las necesita
  latitude?: number;
  longitude?: number;
}

// Helper para obtener el nombre del estado (basado en IDs de tu DB)
const getSightingStatusName = (id: number) => {
  if (id === 1) return 'Activo'; // [cite: 580-585]
  if (id === 2) return 'Desaparecido'; // [cite: 580-585]
  if (id === 3) return 'Observado'; // [cite: 580-585]
  if (id === 4) return 'Recuperado'; // [cite: 580-585]
  if (id === 5) return 'Cerrado'; //
  return 'Desconocido';
};
const CERRADO_STATUS_ID = 5; //

// --- COMPONENTE MySightingCard (MEJORADO) ---
const MySightingCard = ({
  sighting,
  onPress,
}: {
  sighting: MySighting;
  onPress: () => void;
}) => {
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
          color="#6b7280"
          style={styles.icon}
        />
        <AppText style={styles.label}>Especie:</AppText>
        <AppText style={styles.value}>{especieNombre}</AppText>
      </View>

      <View style={styles.infoRow}>
        <Ionicons
          name="medkit-outline"
          size={16}
          color={isCritical ? Colors.danger : '#6b7280'}
          style={styles.icon}
        />
        <AppText style={styles.label}>Salud:</AppText>
        <AppText
          style={[
            styles.value,
            isCritical && { color: Colors.danger, fontWeight: '700' },
          ]}
        >
          {estadoSaludNombre}
        </AppText>
      </View>

      {/* Mostrar motivo de cierre si está cerrado */}
      {isClosed && sighting.motivo_cierre && (
        <View style={styles.reasonContainer}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#6b7280"
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

// --- PANTALLA PRINCIPAL ---
const MySightingsScreen = () => {
  const router = useRouter();
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth(); // <-- Obtenemos el usuario

  const [sightings, setSightings] = useState<MySighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // --- Estados para Modales ---
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
        // Asumimos que /sightings/me devuelve el array
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

  // --- CAMBIO: Abrir el modal en lugar de navegar ---
  const handlePressSighting = (sighting: MySighting) => {
    setSelectedSighting(sighting);
  };

  // --- Lógica para los botones del Modal ---
  const handleDelete = async () => {
    if (!selectedSighting) return;
    try {
      await apiClient.delete(`/sightings/${selectedSighting.id_avistamiento}`);
      showSuccess('Éxito', 'Reporte eliminado');
      setSelectedSighting(null);
      fetchMySightings(); // Recargar lista
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
    if (closeReason === 'Rescatado')
      newStatusId = 4; // Recuperado [cite: 580-585]
    else if (closeReason === 'No Encontrado')
      newStatusId = 2; // Desaparecido [cite: 580-585]
    else newStatusId = 5; // Cerrado

    try {
      await apiClient.patch(
        `/sightings/${selectedSighting.id_avistamiento}/close`,
        {
          newStatusId: newStatusId,
          reason: fullReason,
        },
      );
      showSuccess('Éxito', 'Reporte actualizado.');
      setCloseModalVisible(false);
      setSelectedSighting(null);
      setCloseReason(null);
      setCloseComment('');
      fetchMySightings(); // Recargar lista
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
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <AppText style={styles.loadingText}>
          Cargando tus avistamientos...
        </AppText>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title="Mis Avistamientos"
        leftComponent={
          // Botón de Volver
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              style={{ width: 24, height: 24, tintColor: '#fff' }}
            />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity onPress={handleRefresh}>
            <Ionicons name="refresh-outline" size={24} color="#fff" />
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

      {/* --- MODAL DE DETALLES --- */}
      {selectedSighting && (
        <ReporteDetails
          reporte={selectedSighting}
          onClose={() => setSelectedSighting(null)}
          onDelete={handleDelete}
          distance={null} // No calculamos distancia en esta pantalla
          onCloseSighting={() => setCloseModalVisible(true)}
          canModify={
            user?.role === 'Admin' || //
            user?.id === selectedSighting.id_usuario // <-- ¡CORREGIDO!
          }
        />
      )}

      {/* --- MODAL DE CIERRE --- */}
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
              style={[styles.modalButton, { backgroundColor: Colors.primary }]}
              onPress={handleConfirmCloseSighting}
              disabled={isClosing}
            >
              {isClosing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <AppText style={styles.modalButtonText}>
                  Confirmar Cierre
                </AppText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#e5e7eb' }]}
              onPress={() => setCloseModalVisible(false)}
            >
              <AppText style={[styles.modalButtonText, { color: '#111827' }]}>
                Cancelar
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },

  loadingText: { fontSize: 16, color: Colors.primary, marginTop: 10 },
  listContent: { padding: 12 },

  // CARDS
  card: {
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.secondary,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  criticalCard: {
    backgroundColor: '#fff5f5',
    borderColor: '#ef4444',
    borderWidth: 1,
  },

  closedCard: {
    backgroundColor: '#f3f4f6',
    opacity: 0.55,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: fontWeightSemiBold,
    color: '#111827',
    flex: 1,
    marginRight: 10,
  },

  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
    lineHeight: 18,
  },

  // BADGES
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },

  badgeActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#34d399',
  },

  badgeCritical: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },

  badgeClosed: {
    backgroundColor: '#f3f4f6',
    borderColor: '#9ca3af',
  },

  badgeText: {
    fontSize: 11,
    fontWeight: fontWeightMedium,
    color: '#111827',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  icon: {
    marginRight: 6,
    opacity: 0.75,
  },

  label: {
    fontSize: 14,
    fontWeight: fontWeightSemiBold,
    color: '#6b7280',
    marginRight: 4,
  },

  value: {
    fontSize: 14,
    color: '#374151',
  },

  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },

  reasonText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
    fontStyle: 'italic',
    flex: 1,
  },

  cardDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'right',
  },

  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },

  errorText: {
    color: Colors.danger,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },

  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 15,
  },

  retryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 15,
    elevation: 12,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: fontWeightBold,
    textAlign: 'center',
    marginBottom: 8,
    color: '#111827',
  },

  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 18,
  },

  dropdown: {
    marginBottom: 15,
    borderColor: '#d1d5db',
    borderRadius: 10,
  },

  dropdownContainer: {
    borderColor: '#d1d5db',
  },

  modalTextInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    minHeight: 90,
    textAlignVertical: 'top',
    marginTop: 10,
  },

  modalButton: {
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },

  modalButtonText: {
    fontSize: 16,
    fontWeight: fontWeightBold,
    color: '#fff',
  },
});

export default MySightingsScreen;
