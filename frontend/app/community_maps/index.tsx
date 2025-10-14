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
  id_estado_salud: number;
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

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<CurrentFilters>({});
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSearchedWithFilters, setHasSearchedWithFilters] = useState(false);
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
  const [criticalLoading, setCriticalLoading] = useState(false);
  //Usamos useRef para el conteo y evitar el re-renderizado
  const previousCriticalCount = useRef(0);
  const [criticalCountForBadge, setCriticalCountForBadge] = useState(0);

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

  const fetchCriticalReports = useCallback(async () => {
    setCriticalLoading(true);
    try {
      const response = await apiClient.get<{ data: Reporte[] }>(
        '/sightings/filter',
        {
          params: { id_estado_salud: 3 },
        },
      );
      const validReports = response.data.data.filter(
        (r: Reporte) => r.latitude && r.longitude,
      );
      setCriticalReports(validReports);
      setCriticalCountForBadge(validReports.length);
    } catch (error: any) {
      console.error('Error al obtener reportes críticos:', error);
    } finally {
      setCriticalLoading(false);
    }
  }, []);

  const toggleCriticalView = async () => {
    const newState = !showCriticalReports;
    setShowCriticalReports(newState);
    setSelectedSighting(null);
    if (newState) {
      await fetchCriticalReports();
    } else {
      obtenerReportes(currentFilters);
    }
  };

  const getMarkerColor = (report: Reporte): string | undefined => {
    if (!showCriticalReports) return undefined;
    if (report.id_estado_salud === 3) return Colors.danger || 'red';
    if (report.id_estado_salud === 2) return Colors.warning || 'yellow';
    return undefined;
  };

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
    setShowCriticalReports(false);
  };

  const handleClearFilters = () => {
    setCurrentFilters({});
    setHasSearchedWithFilters(false);
    setShowCriticalReports(false);
  };

  useEffect(() => {
    if (showCriticalReports || hasActiveFilters) {
      return;
    }
    const intervalId = setInterval(async () => {
      try {
        const response = await apiClient.get<{ data: Reporte[] }>(
          '/sightings/filter',
          {
            params: { id_estado_salud: 3 },
          },
        );
        const newReports = response.data.data.filter(
          (r: Reporte) => r.latitude && r.longitude,
        );

        // Notificar si hay nuevos reportes críticos
        const newCount = newReports.length;
        const currentCount = previousCriticalCount.current;
        if (newCount > currentCount) {
          showSuccess(
            '¡Alerta!',
            `Se ha detectado ${newCount - currentCount} avistamiento de alta prioridad.`,
          );
        }
        
        // Actualizar el estado para la insignia y la referencia para el próximo chequeo
        setCriticalCountForBadge(newCount);
        previousCriticalCount.current = newCount;
        setCriticalReports(newReports);

      } catch (error) {
        console.error('Error fetching critical reports:', error);
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [showCriticalReports, hasActiveFilters, showSuccess]);

  // Se mantiene este useEffect para la carga inicial de reportes generales
  useEffect(() => {
    if (!showCriticalReports) {
      obtenerReportes(currentFilters);
    }
  }, [currentFilters, obtenerReportes, showCriticalReports]);

  // Se mantiene este useEffect para la ubicación y la carga inicial de críticos
  useEffect(() => {
    obtenerUbicacionActual();
    fetchCriticalReports();
  }, [obtenerUbicacionActual, fetchCriticalReports]);

  const reportsToRender = showCriticalReports ? criticalReports : reportes;
  const currentLoadingState =
    loading || (showCriticalReports && criticalLoading);
  const shouldHideMap =
    currentLoadingState ||
    (hasSearchedWithFilters && reportsToRender.length === 0);

  return (
    <View style={styles.container}>
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
        {criticalCountForBadge > 0 && !showCriticalReports && (
          <View style={styles.criticalBadge}>
            <Text style={styles.criticalBadgeText}>{criticalCountForBadge}</Text>
          </View>
        )}
      </TouchableOpacity>

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

  filterButton: {
    position: 'absolute',
    top: 100,
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

  criticalButton: {
    position: 'absolute',
    top: 100,
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

  filterIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success || '#4CAF50',
  },

  criticalBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.danger || 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  criticalBadgeText: {
    color: Colors.lightText || 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

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