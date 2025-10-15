// src/components/ReporteMarker.tsx
import React from 'react';
import { Marker, Callout } from 'react-native-maps';
import { View, Text, StyleSheet } from 'react-native';
import {
  obtenerColorMarcador,
  obtenerNombreEspecie,
  obtenerNombreEstadoSalud,
} from '../../types/report';

export const ReporteMarker = ({ reporte, onSelect }: any) => {
  const color = obtenerColorMarcador(reporte.id_estado_salud);

  return (
    <Marker
      key={reporte.id_avistamiento}
      coordinate={{ latitude: reporte.latitude, longitude: reporte.longitude }}
      onPress={(e) => {
        e.stopPropagation();
        onSelect(reporte);
      }}
    >
      <View style={styles.customMarker}>
        <View style={[styles.markerCircle, { backgroundColor: color }]}>
          <Text style={styles.markerEmoji}>🐾</Text>
        </View>
        <View style={[styles.markerTriangle, { borderTopColor: color }]} />
      </View>

      <Callout tooltip>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle} numberOfLines={2}>
            {reporte.descripcion}
          </Text>
          <View style={styles.calloutDivider} />
          <Text style={styles.calloutText}>
            🐶 {obtenerNombreEspecie(reporte.id_especie)}
          </Text>
          <Text style={styles.calloutText}>
            🏥 {obtenerNombreEstadoSalud(reporte.id_estado_salud)}
          </Text>
          <Text style={styles.calloutDate}>
            📅 {new Date(reporte.fecha_creacion).toLocaleDateString('es-ES')}
          </Text>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  customMarker: { alignItems: 'center' },
  markerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerEmoji: { fontSize: 18 },
  markerTriangle: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    minWidth: 150,
  },
  calloutTitle: { fontWeight: '700', marginBottom: 4 },
  calloutDivider: { height: 1, backgroundColor: '#ddd', marginBottom: 4 },
  calloutText: { fontSize: 13 },
  calloutDate: { fontSize: 12, color: '#888' },
});
