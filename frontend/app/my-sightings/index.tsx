import { AppText, fontWeightBold, fontWeightMedium, fontWeightSemiBold } from '@/src/components/AppText';
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
  const estadoAvistamientoNombre = getSightingStatusName(sighting.id_estado_avistamiento);
  
  const isCritical = sighting.id_estado_salud === 3;
  const isClosed = sighting.id_estado_avistamiento === CERRADO_STATUS_ID;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, isCritical && styles.criticalCard, isClosed && styles.closedCard]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <AppText style={styles.cardTitle} numberOfLines={1}>
          {sighting.titulo || sighting.descripcion}
        </AppText>
        <View style={[styles.badge, isClosed ? styles.badgeClosed : (isCritical ? styles.badgeCritical : styles.badgeActive)]}>
          <AppText style={styles.badgeText}>{estadoAvistamientoNombre}</AppText>
        </View>
      </View>
      
      <AppText style={styles.cardDescription} numberOfLines={2}>{sighting.descripcion}</AppText>

      <View style={styles.infoRow}>
        <Ionicons name="paw-outline" size={16} color={Colors.darkGray} style={styles.icon} />
        <AppText style={styles.label}>Especie:</AppText>
        <AppText style={styles.value}>{especieNombre}</AppText>
      </View>

      <View style={styles.infoRow}>
        <Ionicons
          name="medkit-outline"
          size={16}
          color={isCritical ? Colors.danger : Colors.darkGray}
          style={styles.icon}
        />
        <AppText style={styles.label}>Salud:</AppText>
        <AppText style={[styles.value, isCritical && { color: Colors.danger, fontWeight: '700' }]}>
          {estadoSaludNombre}
        </AppText>
      </View>

      {/* Mostrar motivo de cierre si está cerrado */}
      {isClosed && sighting.motivo_cierre && (
        <View style={styles.reasonContainer}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.gray} />
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
  const [selectedSighting, setSelectedSighting] = useState<MySighting | null>(null);
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
        const errorMessage = err.response?.status === 401
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
      showError("Error", "Debes seleccionar un motivo.");
      return;
    }
    setIsClosing(true);
    const fullReason = closeComment ? `${closeReason}: ${closeComment}` : closeReason;

    let newStatusId;
    if (closeReason === 'Rescatado') newStatusId = 4; // Recuperado [cite: 580-585]
    else if (closeReason === 'No Encontrado') newStatusId = 2; // Desaparecido [cite: 580-585]
    else newStatusId = 5; // Cerrado

    try {
      await apiClient.patch(`/sightings/${selectedSighting.id_avistamiento}/close`, {
        newStatusId: newStatusId,
        reason: fullReason,
      });
      showSuccess("Éxito", "Reporte actualizado.");
      setCloseModalVisible(false);
      setSelectedSighting(null);
      setCloseReason(null);
      setCloseComment('');
      fetchMySightings(); // Recargar lista
    } catch (err) {
      showError("Error", "No se pudo actualizar el reporte.");
    } finally {
      setIsClosing(false);
    }
  };

  const renderItem = ({ item }: { item: MySighting }) => (
    <MySightingCard
      sighting={item}
      onPress={() => handlePressSighting(item)}
    />
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
        leftComponent={ // Botón de Volver
          <TouchableOpacity onPress={() => router.back()}>
             <Image
              source={require('../../assets/images/volver.png')}
              style={{ width: 24, height: 24, tintColor: '#fff' }}
            />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity onPress={handleRefresh}>
            <Ionicons name="refresh-outline" size={24} color={'#fff'} />
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
              style={[styles.modalButton, {backgroundColor: Colors.primary}]} 
              onPress={handleConfirmCloseSighting}
              disabled={isClosing}
            >
              {isClosing 
                ? <ActivityIndicator color="#fff" /> 
                : <AppText style={styles.modalButtonText}>Confirmar Cierre</AppText>
              }
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, {backgroundColor: Colors.gray}]} 
              onPress={() => setCloseModalVisible(false)}
            >
              <AppText style={[styles.modalButtonText, {color: '#000'}]}>Cancelar</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f7' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: { marginTop: 10, fontSize: 16, color: Colors.primary },
  listContent: { padding: 10 },
  card: {
    backgroundColor: Colors.lightText,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  criticalCard: {
    backgroundColor: '#FFE5E5',
    borderColor: Colors.danger || 'red',
    borderWidth: 1,
  },
  closedCard: { // Estilo para reportes cerrados
    backgroundColor: '#f1f1f1',
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: fontWeightSemiBold,
    color: '#1f2937',
    flex: 1,
    marginRight: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 10,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  badgeActive: {
    backgroundColor: "rgba(76, 175, 80, 0.2)", // Color 'success' con opacidad
  },
  badgeCritical: {
    backgroundColor: "rgba(244, 67, 54, 0.2)", // Color 'danger' con opacidad
  },
  badgeClosed: {
    backgroundColor: Colors.gray,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: fontWeightMedium,
    color: 'black',
  },
  infoRow: { flexDirection: 'row', marginBottom: 5, alignItems: 'center' },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    width: 60, // Ancho fijo para 'Especie:' 'Salud:'
  },
  value: { fontSize: 14, color: '#374151', flexShrink: 1 },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  reasonText: {
    fontSize: 13,
    color: Colors.darkGray,
    marginLeft: 8,
    fontStyle: 'italic',
    flex: 1,
  },
  cardDate: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 10,
    textAlign: 'right',
  },
  emptyText: { fontSize: 16, color: Colors.gray, textAlign: 'center' },
  errorText: {
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 16,
    fontWeight: '700',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  retryText: { color: 'white', fontWeight: 'bold' },
  
  // --- ESTILOS PARA LOS MODALES ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    zIndex: 2000,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: fontWeightBold,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: Colors.gray,
    marginBottom: 20,
  },
  dropdown: {
    marginBottom: 15,
    borderColor: Colors.gray,
  },
  dropdownContainer: {
    borderColor: Colors.gray,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    minHeight: 80,
    textAlignVertical: 'top',
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

export default MySightingsScreen;