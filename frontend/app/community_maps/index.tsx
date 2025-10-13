import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../src/api/client';
import { useNotification } from '@/src/components/notifications/NotificationContext';
import { ReporteMarker } from '../../src/components/report/ReporteMarker';
import { ReporteDetails } from '../../src/components/report/ReporteDetails';
import { Colors } from '../../src/constants/colors';
import MapsFilterModal from '../../src/components/community_maps/MapsFilterModal';
import CustomHeader from '@/src/components/UI/CustomHeader';
import FloatingSpeedDial from '@/src/components/UI/FloatingMenu';

interface Reporte {
  id_avistamiento: number;
  descripcion: string;
  direccion: string;
  id_especie: number;
  id_estado_salud: number; // Usado para la priorización (ID 3 = Grave/Crítico)
  id_estado_avistamiento: number;
  fecha_creacion: string;
  latitude: number;
  longitude: number;
}

interface CurrentFilters {
  especieId?: number | string;
  estadoSaludId?: number | string;
  zona?: string;
}

const CommunityMapScreen = () => {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { showError, showSuccess, confirm } = useNotification();

  // ESTADOS GENERALES DE FILTRO
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<CurrentFilters>({});
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSearchedWithFilters, setHasSearchedWithFilters] = useState(false);

  // ESTADOS DEL MAPA Y REPORTES
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: -38.7369,
    longitude: -72.5994,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [selectedSighting, setSelectedSighting] = useState<Reporte | null>(
    null,
  );

  const [showCriticalReports, setShowCriticalReports] = useState(false);
  const [criticalReports, setCriticalReports] = useState<Reporte[]>([]);
  // Se elimina isCriticalDataLoaded para forzar la recarga de datos críticos (emergencias)
  const [criticalLoading, setCriticalLoading] = useState(false);

  // --- LÓGICA DE FILTROS Y REPORTES GENERALES ---

  // Verificar si hay filtros activos
  useEffect(() => {
    const hasFilters =
      Object.keys(currentFilters).length > 0 &&
      (currentFilters.especieId ||
        currentFilters.estadoSaludId ||
        currentFilters.zona);
    setHasActiveFilters(!!hasFilters);
  }, [currentFilters]);

  const obtenerUbicacionActual = useCallback(async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setMapRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } else {
      showError('Permiso Denegado', 'No se puede acceder a la ubicación.');
    }
  }, [showError]);

  const obtenerReportes = useCallback(
    async (filters: CurrentFilters = {}) => {
      setLoading(true);
      try {
        const params: Record<string, any> = {};
        if (filters.especieId) params.id_especie = Number(filters.especieId);
        if (filters.estadoSaludId)
          params.id_estado_salud = Number(filters.estadoSaludId);
        if (filters.zona) params.zona = filters.zona;

        const filteredParams = Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v !== undefined),
        );
        const response = await apiClient.get('/sightings/filter', {
          params: filteredParams,
        });

        const validReportes = response.data.data.filter(
          (r: Reporte) => r.latitude && r.longitude,
        );
        setReportes(validReportes);
        setHasSearchedWithFilters(Object.keys(filteredParams).length > 0);
      } catch (error: any) {
        console.error('Error al obtener los reportes generales:', error);
        if (error.response && error.response.status === 404) {
          setReportes([]);
          setHasSearchedWithFilters(true);
        } else {
          showError('Error', 'No se pudieron cargar los reportes generales');
          setHasSearchedWithFilters(false);
        }
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  // --- LÓGICA DE REPORTES CRÍTICOS  ---

  const fetchCriticalReports = async () => {
    setCriticalLoading(true);
    try {
      //  Usamos el endpoint de filtro con el ID de estado 3 (Crítico/Grave)
      const response = await apiClient.get<{ data: Reporte[] }>(
        '/sightings/filter',
        {
          params: { id_estado_salud: 3 }, // Solo reportes con estado de salud Crítico/Grave
        },
      );

      const validReports = response.data.data.filter(
        (r: Reporte) => r.latitude && r.longitude,
      );

      setCriticalReports(validReports);
      // Ya no es necesario setIsCriticalDataLoaded(true);

      if (validReports.length > 0) {
        showSuccess(
          'Alerta Crítica',
          `Se encontraron ${validReports.length} avistamientos de ALTA prioridad.`,
        );
      } else {
        showSuccess(
          'Alivio',
          'No se encontraron reportes críticos. ¡Todo tranquilo!',
        );
      }
    } catch (error: any) {
      console.error('Error al obtener reportes críticos:', error);
      showError(
        'Error Crítico',
        'No se pudieron cargar los reportes críticos.',
      );
    } finally {
      setCriticalLoading(false);
    }
  };

  const toggleCriticalView = async () => {
    const newState = !showCriticalReports;
    setShowCriticalReports(newState);

    // Desactivar el detalle de cualquier reporte seleccionado
    setSelectedSighting(null);

    if (newState) {
      // 💡 CORRECCIÓN: Siempre volvemos a obtener los datos críticos
      // al activar la vista para garantizar que estén frescos y evitar el bug de estado.
      await fetchCriticalReports();
    } else {
      // Si volvemos al modo normal, recargamos los reportes generales con los filtros activos
      obtenerReportes(currentFilters);
    }
  };

  /**
   *  PRIORIZACIÓN VISUAL: Devuelve el color del pin si está en modo crítico
   * @param report Reporte a evaluar
   * @returns Color ('red', 'yellow') o undefined si no es crítico.
   */
  const getMarkerColor = (report: Reporte): string | undefined => {
    if (!showCriticalReports) return undefined; // Solo aplica color en modo crítico

    // 3: Grave (Máxima Prioridad - Rojo)
    if (report.id_estado_salud === 3) return Colors.danger || 'red';

    // 2: Herido (Prioridad Media - Amarillo)
    if (report.id_estado_salud === 2) return Colors.warning || 'yellow';

    return undefined; // Si es crítico (estamos mostrando la lista de críticos) pero no 2 o 3, usa el color base
  };

  // --- MANEJO DE ACCIONES ---

  const handleDelete = async () => {
    if (!selectedSighting) return;
    confirm({
      title: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar este reporte?',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      destructive: true,
      onConfirm: async () => {
        try {
          await apiClient.delete(
            `/sightings/${selectedSighting.id_avistamiento}`,
          );
          setSelectedSighting(null);
          // Recargar la vista actual (crítica o general)
          if (showCriticalReports) {
            fetchCriticalReports();
          } else {
            obtenerReportes(currentFilters);
          }
          showSuccess('Éxito', 'Reporte eliminado');
        } catch {
          showError('Error', 'No se pudo eliminar el reporte.');
        }
      },
    });
  };

  const handleApplyFilter = (filters: CurrentFilters) => {
    setCurrentFilters(filters);
    setFilterModalVisible(false);
    // Desactivamos el modo crítico si aplicamos un filtro general
    setShowCriticalReports(false);
  };

  const handleClearFilters = () => {
    setCurrentFilters({});
    setHasSearchedWithFilters(false);
    setShowCriticalReports(false); // Aseguramos que el modo crítico esté apagado
  };

  // --- USE EFFECTS ---

  useEffect(() => {
    if (!showCriticalReports) {
      obtenerReportes(currentFilters);
    }
  }, [currentFilters, obtenerReportes, showCriticalReports]);

  useEffect(() => {
    obtenerUbicacionActual();
  }, [obtenerUbicacionActual]);

  // --- RENDERIZADO ---

  const reportsToRender = showCriticalReports ? criticalReports : reportes;
  const currentLoadingState =
    loading || (showCriticalReports && criticalLoading);
  const shouldHideMap =
    currentLoadingState ||
    (hasSearchedWithFilters && reportsToRender.length === 0);

  return (
    <View style={styles.container}>
      {/* Header con back + título + botón de filtros */}
      <CustomHeader
        title="Mapa Comunitario"
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
              setMenuVisible(false);
              setSelectedSighting(null);
              setFilterModalVisible(true);
            }}
          >
            <Ionicons name="options-outline" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />

      {/* BOTÓN DE FILTRO GENERAL (Izquierda) */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => {
          setMenuVisible(false);
          setSelectedSighting(null);
          setFilterModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <Ionicons
          name="options-outline"
          size={24}
          color={
            showCriticalReports ? Colors.gray : Colors.lightText || 'white'
          }
        />
        {hasActiveFilters && !showCriticalReports && (
          <View style={styles.filterIndicator} />
        )}
      </TouchableOpacity>

      {/* BOTÓN DE REPORTES CRÍTICOS (Derecha) */}
      <TouchableOpacity
        style={[
          styles.criticalButton,
          showCriticalReports && styles.criticalButtonActive,
        ]}
        onPress={toggleCriticalView}
        activeOpacity={0.8}
      >
        {criticalLoading ? (
          <ActivityIndicator size="small" color={Colors.lightText} />
        ) : (
          <Ionicons
            name="warning"
            size={24}
            color={
              showCriticalReports ? Colors.lightText : Colors.danger || 'red'
            }
          />
        )}
      </TouchableOpacity>

      {/* Estado de carga */}
      {currentLoadingState && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {showCriticalReports
              ? 'Buscando emergencias...'
              : 'Buscando avistamientos...'}
          </Text>
        </View>
      )}

      {/* Estado sin resultados con filtros */}
      {!currentLoadingState &&
        shouldHideMap &&
        reportsToRender.length === 0 && (
          <View className="no-results" style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={64} color={Colors.gray} />
            <Text style={styles.noResultsTitle}>
              {showCriticalReports
                ? '¡Excelente! No hay reportes críticos.'
                : 'No se encontraron resultados'}
            </Text>
            {!showCriticalReports && (
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={handleClearFilters}
              >
                <Text style={styles.clearFilterText}>Limpiar filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={[styles.map, shouldHideMap && styles.hiddenMap]}
        region={mapRegion}
        onPress={() => setSelectedSighting(null)}
      >
        {location && (
          <Marker
            coordinate={location}
            title="Ubicación Actual"
            pinColor="blue"
          />
        )}

        {/* RENDERING CRÍTICO/GENERAL */}
        {reportsToRender.map((r) => (
          <ReporteMarker
            key={r.id_avistamiento}
            reporte={r}
            onSelect={setSelectedSighting}
            criticalColor={getMarkerColor(r)}
          />
        ))}
      </MapView>

      {selectedSighting && (
        <ReporteDetails
          reporte={selectedSighting}
          onClose={() => setSelectedSighting(null)}
          onDelete={handleDelete}
        />
      )}

      {/* Menú flotante (reemplaza el FAB y el menú manual) */}
      <FloatingSpeedDial
        visible={menuVisible}
        onToggle={() => setMenuVisible((v) => !v)}
        actions={[
          {
            key: 'Crear Reporte',
            label: 'Crear Reporte',
            onPress: () => {
              setMenuVisible(false);
              router.push('/create-report');
            },
            icon: (
              <Ionicons
                name="document-text-outline"
                size={22}
                color={Colors.secondary}
              />
            ),
          },
          {
            key: 'Crear Alerta',
            label: 'Crear Alerta',
            onPress: () => {
              setMenuVisible(false);
              router.push('/alerts/create-alert');
            },
            icon: (
              <Ionicons
                name="alert-circle-outline"
                size={22}
                color={Colors.secondary}
              />
            ),
          },
        ]}
        placement="left"
        direction="up"
        gap={12}
        persistentTooltips
      />

      <Modal
        animationType="slide"
        transparent
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <MapsFilterModal
          isVisible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApplyFilter={handleApplyFilter}
          currentFilters={currentFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background || '#F8F8F8' },
  map: { flex: 1 },
  hiddenMap: { opacity: 0.3 },

  // Botón de filtro (flotante izquierdo)
  filterButton: {
    position: 'absolute',
    top: 100, // ajusta según altura del header
    left: 20,
    backgroundColor: Colors.accent || '#007AFF',
    borderRadius: 30,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },

  // Botón crítico (flotante derecho)
  criticalButton: {
    position: 'absolute',
    top: 100, // igual que filterButton para alinearlos
    right: 20,
    backgroundColor: Colors.lightText || 'white',
    borderRadius: 30,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
    borderWidth: 2,
    borderColor: Colors.danger || 'red',
  },
  criticalButtonActive: {
    backgroundColor: Colors.danger || 'red',
    borderColor: Colors.danger || 'red',
    shadowColor: Colors.danger || 'red',
    shadowOpacity: 0.5,
  },

  // Indicador de filtros activos
  filterIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success || '#4CAF50',
  },

  // --- CONTENEDORES DE ESTADO ---
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -50 }],
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 20,
  },
  loadingText: { marginTop: 10, fontSize: 14, color: Colors.text },
  noResultsContainer: {
    position: 'absolute',
    top: '40%',
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    zIndex: 20,
    elevation: 5,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  clearFilterButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearFilterText: { color: Colors.lightText, fontWeight: '600', fontSize: 16 },
});

export default CommunityMapScreen;
