import { Ionicons } from '@expo/vector-icons'; // Ionicons para marcadores
import React from 'react';
import { StyleSheet, View } from 'react-native'; // Asegurarse de importar View
import Clustering from 'react-native-map-clustering'; // Clustering
import {
  Heatmap,
  Marker,
  PROVIDER_GOOGLE
} from 'react-native-maps';

import { MapViewProps, Reporte } from './types';

// 1. Importar el hook y los tipos de tema (Cambios de tu compañero)
import { ColorsType } from '@/src/constants/colors';
import { useTheme } from '@/src/contexts/ThemeContext';

export const CommunityMapView = ({
  mapRef,
  mapRegion,
  // location, // Ya no se necesita, showsUserLocation lo maneja
  showHeatmap,
  heatmapData,
  reportsToRender,
  onSelectSighting,
  getMarkerColor,
  shouldHideMap,
  onRegionChangeComplete,
}: MapViewProps) => {
  
  // 2. Llamar al hook y generar los estilos dinámicos
  const { colors } = useTheme();
  const styles = getStyles(colors);

  if (shouldHideMap) {
    return <View style={[styles.map, styles.hiddenMap]} />;
  }

  return (
    <Clustering
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      
      // --- Configuración del Mapa ---
      initialRegion={mapRegion} // MODO LIBRE (Arregla el zoom)
      onRegionChangeComplete={onRegionChangeComplete} 
      onPress={() => onSelectSighting(null)} 
      showsUserLocation={true} 
      
      // --- Configuración del Clúster (Usando colores del tema) ---
      radius={20}
      minPoints={2}
      maxZoom={15} 
      animationEnabled={true}
      clusterColor={colors.primary} // Dinámico
      clusterTextColor={colors.lightText} // Dinámico
    >
      {/* Capa de Mapa de Calor */}
      {showHeatmap && heatmapData.length > 0 && (
        <Heatmap
          points={heatmapData}
          radius={90}
          opacity={1}
          gradient={{
            // Usar colores del tema en el gradiente
            colors: ['rgba(0, 0, 0, 0)', 'rgba(255, 255, 0, 0.6)', colors.danger],
            startPoints: [0.01, 0.4, 0.8],
            colorMapSize: 256,
          }}
        />
      )}

      {/* Capa de Marcadores (Dentro del Clustering) */}
      {!showHeatmap &&
        reportsToRender.map((r: Reporte) => (
          <Marker
            key={r.id_avistamiento.toString()}
            coordinate={{ latitude: r.latitude, longitude: r.longitude }}
            onPress={() => onSelectSighting(r)}
            stopPropagation 
            centerOffset={{ x: 0, y: -15 }} // Ajuste para la punta del icono
          >
            {/* Usamos Ionicons para tener forma de pin y color exacto */}
            <Ionicons 
              name="location" 
              size={40} 
              color={getMarkerColor(r)} 
            />
          </Marker>
        ))}
    </Clustering>
  );
};

// 3. StyleSheet como función (Cambios de tu compañero)
const getStyles = (colors: ColorsType) =>
  StyleSheet.create({
    map: { flex: 1 },
    hiddenMap: { 
      opacity: 0.3,
      backgroundColor: colors.background, // Fondo dinámico
    },
  });