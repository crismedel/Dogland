import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Heatmap, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ReporteMarker } from '../report/ReporteMarker';
// 1. Quitar la importación estática
// import { Colors } from '../../constants/colors';
import { MapViewProps, Reporte } from './types'; // Importar los props y tipos

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

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
  // 3. Llamar al hook y generar los estilos
  const { colors } = useTheme();
  const styles = getStyles(colors);

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
            // 4. Usar colores del tema
            colors: ['rgba(0, 0, 0, 0)', 'rgba(255, 255, 0, 0.6)', colors.danger],
            startPoints: [0.01, 0.4, 0.8],
            colorMapSize: 256,
          }}
        />
      )}

      {/* Ubicación del Usuario */}
      {location && (
        <Marker
          coordinate={location}
          title="Ubicación Actual"
          pinColor={colors.info} // 4. Usar colores del tema
        />
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

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType) =>
  StyleSheet.create({
    map: { flex: 1 },
    hiddenMap: { opacity: 0.3 },
  });