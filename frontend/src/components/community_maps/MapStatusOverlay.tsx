//Un componente solo para los overlays de "Cargando..." y "Sin Resultados".
import { AppText, fontWeightBold, fontWeightMedium } from '@/src/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { MapStatusOverlayProps } from './types'; // Importar los props

export const MapStatusOverlay = ({
  currentLoadingState,
  shouldHideMap,
  reportsToRenderCount,
  showCriticalReports,
  onClearFilters,
}: MapStatusOverlayProps) => {
    
  if (currentLoadingState) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <AppText style={styles.loadingText}>
          {showCriticalReports ? 'Buscando emergencias...' : 'Cargando mapa...'}
        </AppText>
      </View>
    );
  }

  if (shouldHideMap && reportsToRenderCount === 0) {
    return (
      <View style={styles.noResultsContainer}>
        <Ionicons name="search-outline" size={64} color={Colors.gray} />
        <AppText style={styles.noResultsTitle}>
          {showCriticalReports ? '¡Excelente! No hay reportes críticos.' : 'No se encontraron resultados'}
        </AppText>
        {!showCriticalReports && (
          <TouchableOpacity style={styles.clearFilterButton} onPress={onClearFilters}>
            <AppText style={styles.clearFilterText}>Limpiar filtros</AppText>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  loadingContainer: {
    position: 'absolute', top: '50%', left: '50%',
    transform: [{ translateX: -75 }, { translateY: -50 }],
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20, borderRadius: 10, alignItems: 'center', zIndex: 20,
  },
  loadingText: { marginTop: 10, fontSize: 14, color: Colors.text },
  noResultsContainer: {
    position: 'absolute', top: '40%', left: '10%', right: '10%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 30, borderRadius: 15, alignItems: 'center',
    zIndex: 20, elevation: 5,
  },
  noResultsTitle: {
    fontSize: 18, fontWeight: fontWeightBold,
    color: Colors.text, marginTop: 16, marginBottom: 8,
    textAlign: 'center',
  },
  clearFilterButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 8,
  },
  clearFilterText: {
    color: Colors.lightText, fontWeight: fontWeightMedium,
    fontSize: 16,
  },
});