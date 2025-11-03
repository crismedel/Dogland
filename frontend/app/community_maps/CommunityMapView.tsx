//Un componente para el MapView y sus capas (Heatmap, Marker).
import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Heatmap, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ReporteMarker } from '../../src/components/report/ReporteMarker';
import { Colors } from '../../src/constants/colors';
import { MapViewProps, Reporte } from './types'; // Importar los props y tipos

export const CommunityMapView = ({
  mapRef,
  mapRegion,
  location,
  showHeatmap,
  heatmapData,
  reportsToRender,
  onSelectSighting,
  getMarkerColor,
  shouldHideMap,
  onRegionChangeComplete, // 🚨 1. Recibir la prop
}: MapViewProps) => {
  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={[styles.map, shouldHideMap && styles.hiddenMap]}
      initialRegion={mapRegion} // Usar initialRegion para la carga inicial
      // 🚨 2. Pasar la prop al MapView
      onRegionChangeComplete={onRegionChangeComplete} 
      onPress={() => onSelectSighting(null)}
    >
      {/* Capa de Mapa de Calor */}
      {showHeatmap && heatmapData.length > 0 && (
        <Heatmap
          points={heatmapData}
          radius={50}
          opacity={0.9}
          gradient={{
            colors: ['rgba(0, 0, 0, 0)', 'rgba(255, 255, 0, 0.6)', Colors.danger],
            startPoints: [0.01, 0.4, 0.8],
            colorMapSize: 256,
          }}
        />
      )}

      {/* Ubicación del Usuario */}
      {location && (
        <Marker coordinate={location} title="Ubicación Actual" pinColor="blue" />
      )}

      {/* Marcadores de Reportes (solo si el heatmap está apagado) */}
      {!showHeatmap &&
        reportsToRender.map((r: Reporte) => (
          <ReporteMarker
            key={r.id_avistamiento.toString()} // 🚨 Key como string
            reporte={r}
            onSelect={onSelectSighting}
            criticalColor={getMarkerColor(r)}
          />
        ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: { flex: 1 },
  hiddenMap: { opacity: 0.3 },
});