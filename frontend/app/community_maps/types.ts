//archivo de tipos para que todos los componentes se comuniquen.
import MapView, { Region } from "react-native-maps"; // 🚨 Importar Region

// Interfaz para los reportes (avistamientos)
export interface Reporte {
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

// Interfaz para los filtros activos
export interface CurrentFilters {
  especieId?: number | string;
  estadoSaludId?: number | string;
  zona?: string;
}

// Interfaz para los datos del Mapa de Calor
export interface HeatmapPoint {
    latitude: number;
    longitude: number;
    weight: number; 
}

// Props para el componente de Mapa
export type MapViewProps = {
  mapRef: React.RefObject<MapView | null>;
  mapRegion: Region; // 🚨 Usar el tipo Region
  location: { latitude: number; longitude: number } | null;
  showHeatmap: boolean;
  heatmapData: HeatmapPoint[];
  reportsToRender: Reporte[];
  onSelectSighting: (report: Reporte | null) => void;
  getMarkerColor: (report: Reporte) => string | undefined;
  shouldHideMap: boolean;
  // 🚨 AÑADIR: Prop para notificar el cambio de región
  onRegionChangeComplete: (newRegion: Region) => void; 
};

// Props para los botones flotantes
export type MapControlButtonsProps = {
  showCriticalReports: boolean;
  criticalLoading: boolean;
  criticalCountForBadge: number;
  onToggleCriticalView: () => void;
  hasActiveFilters: boolean;
  onShowFilters: () => void;
  showHeatmap: boolean;
  heatmapLoading: boolean;
  onToggleHeatmap: () => void;
};

// Props para el overlay de estado (Loading/No Results)
export type MapStatusOverlayProps = {
  currentLoadingState: boolean;
  shouldHideMap: boolean;
  reportsToRenderCount: number;
  showCriticalReports: boolean;
  onClearFilters: () => void;
};