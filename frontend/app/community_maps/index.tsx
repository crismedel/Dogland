//Solo contiene la lógica de estado y pasa las props a los nuevos componentes.
import { useNotification } from '@/src/components/notifications';
import CustomHeader from '@/src/components/UI/CustomHeader';
import FloatingSpeedDial from '@/src/components/UI/FloatingMenu';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import apiClient from '../../src/api/client';
import MapsFilterModal from '../../src/components/community_maps/MapsFilterModal';
import { ReporteDetails } from '../../src/components/report/ReporteDetails';
import { Colors } from '../../src/constants/colors';

// 1. Importar los nuevos componentes y tipos
import { CommunityMapView } from '../../src/components/community_maps/CommunityMapView';
import { MapControlButtons } from '../../src/components/community_maps/MapControlButtons';
import { MapStatusOverlay } from '../../src/components/community_maps/MapStatusOverlay';
import { CurrentFilters, HeatmapPoint, Reporte } from '../../src/components/community_maps/types';

const CommunityMapScreen = () => {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const { showError, showSuccess, confirm } = useNotification();

  // --- ESTADOS ---
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<CurrentFilters>({});
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSearchedWithFilters, setHasSearchedWithFilters] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
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
  const previousCriticalCount = useRef(0);
  const [criticalCountForBadge, setCriticalCountForBadge] = useState(0);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [initialZoomDone, setInitialZoomDone] = useState(false);

  // --- LÓGICA DE DATOS ---
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
      if (!initialZoomDone) {
        setMapRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setInitialZoomDone(true);
      }
    } else {
      showError('Permiso Denegado', 'No se puede acceder a la ubicación.');
    }
  }, [showError, initialZoomDone]);

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

  const fetchHeatmapData = useCallback(async () => {
    setHeatmapLoading(true);
    try {
      const response = await apiClient.get<{ data: any[] }>(
        '/stats/heatmap-data',
      );
      const transformedData: HeatmapPoint[] = response.data.data
        .map((item) => ({
          latitude: item.latitude,
          longitude: item.longitude,
          weight:
            item.id_estado_salud === 3
              ? 3.0
              : item.id_estado_salud === 2
              ? 1.5
              : 0.5,
        }))
        .filter((point) => point.latitude && point.longitude);
      setHeatmapData(transformedData);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    } finally {
      setHeatmapLoading(false);
    }
  }, []);

  // --- LÓGICA DE MANEJADORES (HANDLERS) ---
  const toggleCriticalView = useCallback(async () => {
    const newState = !showCriticalReports;
    setShowCriticalReports(newState);
    setSelectedSighting(null);
    if (newState) {
      await fetchCriticalReports();
    } else {
      obtenerReportes(currentFilters);
    }
  }, [
    showCriticalReports,
    currentFilters,
    fetchCriticalReports,
    obtenerReportes,
  ]);

  const toggleHeatmap = useCallback(() => {
    const newState = !showHeatmap;
    setShowHeatmap(newState);
    if (newState && heatmapData.length === 0 && !heatmapLoading) {
      fetchHeatmapData();
    }
  }, [showHeatmap, heatmapData.length, heatmapLoading, fetchHeatmapData]);

  const handleDelete = useCallback(async () => {
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
  }, [
    selectedSighting,
    showCriticalReports,
    currentFilters,
    confirm,
    fetchCriticalReports,
    obtenerReportes,
    showSuccess,
    showError,
  ]);

  const handleApplyFilter = useCallback((filters: CurrentFilters) => {
    setCurrentFilters(filters);
    setFilterModalVisible(false);
    setShowCriticalReports(false);
  }, []);

  const handleClearFilters = useCallback(() => {
    setCurrentFilters({});
    setHasSearchedWithFilters(false);
    setShowCriticalReports(false);
  }, []);

  const onRegionChangeComplete = (newRegion: Region) => {
    setMapRegion(newRegion);
  };

  // --- EFECTOS (EFFECTS) ---
  useEffect(() => {
    if (showCriticalReports || hasActiveFilters) return;
    const intervalId = setInterval(async () => {
      try {
        const response = await apiClient.get<{ data: Reporte[] }>(
          '/sightings/filter',
          {
            params: { id_estado_salud: 3 },
          },
        );
        const newReports = response.data.data.filter(
          (r) => r.latitude && r.longitude,
        );
        const newCount = newReports.length;
        const currentCount = previousCriticalCount.current;
        if (newCount > currentCount) {
          showSuccess(
            '¡Alerta!',
            `Se ha detectado ${
              newCount - currentCount
            } avistamiento de alta prioridad.`,
          );
        }
        setCriticalCountForBadge(newCount);
        previousCriticalCount.current = newCount;
        setCriticalReports(newReports);
      } catch (error) {
        console.error('Error fetching critical reports:', error);
      }
    }, 30000);
    return () => clearInterval(intervalId);
  }, [showCriticalReports, hasActiveFilters, showSuccess]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          obtenerUbicacionActual(),
          obtenerReportes(currentFilters),
          fetchCriticalReports(),
          fetchHeatmapData(),
        ]);
      } catch (error) {
        console.error('Error durante la inicialización del mapa:', error);
      }
    };
    if (!showCriticalReports && !hasActiveFilters) {
      initializeData();
    }
  }, [
    obtenerUbicacionActual,
    obtenerReportes,
    fetchCriticalReports,
    fetchHeatmapData,
    showCriticalReports,
    hasActiveFilters,
  ]);

  // 🚨 CORRECCIÓN DE ORDEN: Mover la declaración de reportsToRender ANTES del useEffect de Zoom
  const reportsToRender = showCriticalReports ? criticalReports : reportes;

  // 🚨 EFECTO DE ZOOM DINÁMICO
  useEffect(() => {
    if (reportsToRender.length === 0 || showHeatmap || !mapRef.current) {
      return;
    }
    const coordinates = reportsToRender.map((report) => ({
      latitude: report.latitude,
      longitude: report.longitude,
    }));

    if (location) {
      coordinates.push(location);
    }

    // 🚨 Timeout corto para asegurar que el mapa esté listo
    setTimeout(() => {
      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: { top: 150, right: 50, bottom: 100, left: 50 },
        animated: true,
      });
    }, 500); // 500ms de espera
  }, [reportsToRender, showHeatmap, location]); // Depende de los reportes, el heatmap y la ubicación

  useEffect(() => {
    if (!showCriticalReports) {
      obtenerReportes(currentFilters);
    }
  }, [currentFilters, obtenerReportes, showCriticalReports]);

  // --- DATOS DERIVADOS ---
  const currentLoadingState =
    loading || (showCriticalReports && criticalLoading) || heatmapLoading;
  const shouldHideMap =
    currentLoadingState ||
    (hasSearchedWithFilters && reportsToRender.length === 0);

  // --- NAVEGACIÓN ---
  const goToStatsScreen = () => {
    setMenuVisible(false);
    router.push('/stats');
  };
  const goToMySightingsScreen = () => {
    setMenuVisible(false);
    router.push('/my-sightings');
  };
  const goToCreateReport = () => {
    setMenuVisible(false);
    router.push('/create-report');
  };
  const goToCreateAlert = () => {
    setMenuVisible(false);
    router.push('/alerts/create-alert');
  };

  const getMarkerColor = (report: Reporte): string | undefined => {
    if (!showCriticalReports) return undefined;
    if (report.id_estado_salud === 3) return Colors.danger || 'red';
    if (report.id_estado_salud === 2) return Colors.warning || 'yellow';
    return undefined;
  };

  // --- RENDERIZADO ---
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

      <MapControlButtons
        showCriticalReports={showCriticalReports}
        criticalLoading={criticalLoading}
        criticalCountForBadge={criticalCountForBadge}
        onToggleCriticalView={toggleCriticalView}
        hasActiveFilters={hasActiveFilters}
        onShowFilters={() => {
          setMenuVisible(false);
          setSelectedSighting(null);
          setFilterModalVisible(true);
        }}
        showHeatmap={showHeatmap}
        heatmapLoading={heatmapLoading}
        onToggleHeatmap={toggleHeatmap}
      />

      <MapStatusOverlay
        currentLoadingState={currentLoadingState}
        shouldHideMap={shouldHideMap}
        reportsToRenderCount={reportsToRender.length}
        showCriticalReports={showCriticalReports}
        onClearFilters={handleClearFilters}
      />

      <CommunityMapView
        mapRef={mapRef}
        mapRegion={mapRegion}
        location={location}
        showHeatmap={showHeatmap}
        heatmapData={heatmapData}
        reportsToRender={reportsToRender}
        onSelectSighting={setSelectedSighting}
        getMarkerColor={getMarkerColor}
        shouldHideMap={shouldHideMap}
        onRegionChangeComplete={onRegionChangeComplete} // 🚨 Pasar el handler
      />

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
            key: 'Mis Avistamientos',
            label: 'Mis Avistamientos',
            onPress: goToMySightingsScreen,
            icon: (
              <Ionicons
                name="person-circle-outline"
                size={22}
                color={Colors.secondary}
              />
            ),
          },
          {
            key: 'Estadísticas',
            label: 'Estadísticas',
            onPress: goToStatsScreen,
            icon: (
              <Ionicons
                name="bar-chart-outline"
                size={22}
                color={Colors.secondary}
              />
            ),
          },
          {
            key: 'Crear Reporte',
            label: 'Crear Reporte',
            onPress: goToCreateReport,
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
            onPress: goToCreateAlert,
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

// Estilos mínimos para el contenedor principal
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background || '#F8F8F8' },
});

export default CommunityMapScreen;
