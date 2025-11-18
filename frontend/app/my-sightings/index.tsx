import {
  AppText,
  fontWeightBold,
  fontWeightMedium,
  fontWeightSemiBold,
} from '@/src/components/AppText';
import { useNotification } from '@/src/components/notifications';
import CustomHeader from '@/src/components/UI/CustomHeader';
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
  Platform, // Import Platform
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker'; // <-- AÑADIDO
import apiClient from '../../src/api/client';
import { ReporteDetails } from '../../src/components/report/ReporteDetails'; // <-- AÑADIDO
import { useNotification } from '@/src/components/notifications';
import {
  obtenerNombreEspecie,
  obtenerNombreEstadoSalud,
} from '../../src/types/report';
import Spinner from '@/src/components/UI/Spinner';
import {
  AppText,
  fontWeightSemiBold,
  fontWeightMedium, // Importar fontWeightMedium
} from '@/src/components/AppText';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { Ionicons } from '@expo/vector-icons';

// Interfaz expandida para incluir todos los datos necesarios
// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

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
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  // Lógica de MySightingCard
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
          color={colors.darkGray} // 4. Usar colores del tema
          style={{ marginRight: 8 }}
        />
        <AppText style={styles.label}>Especie:</AppText>
        <AppText style={styles.value}>{especieNombre}</AppText>
      </View>

      <View style={styles.infoRow}>
        <Ionicons
          name="medkit-outline"
          size={16}
          color={isCritical ? colors.danger : colors.darkGray} // 4. Usar colores del tema
          style={{ marginRight: 8 }}
        />
        <AppText style={styles.label}>Salud:</AppText>
        <AppText
          style={[
            styles.value,
            isCritical && { color: colors.danger, fontWeight: '700' }, // 4. Usar colores del tema
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
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

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
    return <Spinner />;
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
            {/* 4. Usar colores del tema (texto oscuro sobre fondo amarillo) */}
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

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background }, // Dinámico
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.background, // Dinámico
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: colors.primary, // Dinámico
    },
    listContent: { padding: 10 },
    card: {
      backgroundColor: colors.cardBackground, // Dinámico
      padding: 15,
      borderRadius: 12,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.1, // Dinámico
      shadowRadius: 3.84,
      elevation: 5,
    },
    criticalCard: {
      backgroundColor: `${colors.danger}20`, // Dinámico
      borderColor: colors.danger, // Dinámico
      borderWidth: 2,
      padding: 15,
      borderRadius: 12,
      marginBottom: 10,
      shadowColor: colors.danger, // Dinámico
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5.46,
      elevation: 8,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: fontWeightSemiBold,
      color: colors.text, // Dinámico
      marginBottom: 10,
    },
    infoRow: { flexDirection: 'row', marginBottom: 5 },
    label: {
      fontSize: 14,
      fontWeight: fontWeightMedium, // Dinámico
      color: colors.darkGray, // Dinámico
      width: 120,
    },
    value: {
      fontSize: 14,
      color: colors.text, // Dinámico
      flexShrink: 1,
    },
    emptyText: {
      fontSize: 16,
      color: colors.darkGray, // Dinámico
      textAlign: 'center',
    },
    errorText: {
      color: colors.danger, // Dinámico
      textAlign: 'center',
      marginBottom: 15,
      fontSize: 16,
      fontWeight: '700',
    },
    retryButton: {
      backgroundColor: colors.primary, // Dinámico
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginTop: 15,
    },
    retryText: {
      color: isDark ? colors.lightText : colors.text, // Dinámico
      fontWeight: 'bold',
    },
    cardLabel: {
      fontSize: 14,
      fontWeight: fontWeightMedium, // Dinámico
      color: colors.darkGray, // Dinámico
      width: 100,
    },
    cardValue: {
      fontSize: 14,
      color: colors.text, // Dinámico
      flexShrink: 1,
    },
    cardDate: {
      fontSize: 12,
      color: colors.gray, // Dinámico
      marginTop: 10,
      textAlign: 'right',
    },
  });

export default MySightingsScreen;