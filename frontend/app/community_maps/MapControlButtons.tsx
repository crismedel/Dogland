//Un componente solo para los 3 botones flotantes (Filtro, Crítico, Heatmap).
import { AppText, fontWeightBold } from '@/src/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../src/constants/colors';
import { MapControlButtonsProps } from './types'; // Importar los props

export const MapControlButtons = ({
  showCriticalReports,
  criticalLoading,
  criticalCountForBadge,
  onToggleCriticalView,
  hasActiveFilters,
  onShowFilters,
  showHeatmap,
  heatmapLoading,
  onToggleHeatmap,
}: MapControlButtonsProps) => {
  return (
    <>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={onShowFilters}
        activeOpacity={0.8}
      >
        <Ionicons
          name="options-outline"
          size={24}
          color={showCriticalReports ? Colors.gray : Colors.lightText || 'white'}
        />
        {hasActiveFilters && !showCriticalReports && (
          <View style={styles.filterIndicator} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.criticalButton, showCriticalReports && styles.criticalButtonActive]}
        onPress={onToggleCriticalView}
        activeOpacity={0.8}
      >
        {criticalLoading ? (
          <ActivityIndicator size="small" color={Colors.lightText} />
        ) : (
          <Ionicons
            name="warning"
            size={24}
            color={showCriticalReports ? Colors.lightText : Colors.danger || 'red'}
          />
        )}
        {criticalCountForBadge > 0 && !showCriticalReports && (
          <View style={styles.criticalBadge}>
            <AppText style={styles.criticalBadgeText}>{criticalCountForBadge}</AppText>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.mapHeatmapButton, showHeatmap && styles.mapHeatmapButtonActive]}
        onPress={onToggleHeatmap}
        activeOpacity={0.8}
        disabled={heatmapLoading}
      >
        {heatmapLoading ? (
          <ActivityIndicator size="small" color={Colors.lightText} />
        ) : (
          <Ionicons
            name="flame-outline"
            size={24}
            color={showHeatmap ? Colors.lightText : Colors.danger}
          />
        )}
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    position: 'absolute', top: 100, left: 20,
    backgroundColor: Colors.accent || '#007AFF',
    borderRadius: 30, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4,
    elevation: 5, zIndex: 10,
  },
  criticalButton: {
    position: 'absolute', top: 100, right: 20,
    backgroundColor: Colors.lightText || 'white',
    borderRadius: 30, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4,
    elevation: 5, zIndex: 10,
    borderWidth: 2, borderColor: Colors.danger || 'red',
  },
  criticalButtonActive: {
    backgroundColor: Colors.danger || 'red',
    borderColor: Colors.danger || 'red',
    shadowColor: Colors.danger || 'red',
    shadowOpacity: 0.5,
  },
  filterIndicator: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.success || '#4CAF50',
  },
  criticalBadge: {
    position: 'absolute', top: -5, right: -5,
    backgroundColor: Colors.danger || 'red',
    borderRadius: 10, width: 20, height: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  criticalBadgeText: {
    color: Colors.lightText || 'white',
    fontSize: 12, fontWeight: fontWeightBold,
  },
  mapHeatmapButton: {
    position: 'absolute', top: 100, left: 80,
    backgroundColor: Colors.lightText || 'white',
    borderRadius: 30, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4,
    elevation: 5, zIndex: 10,
    borderWidth: 2, borderColor: Colors.accent || 'blue',
  },
  mapHeatmapButtonActive: {
    backgroundColor: Colors.danger || 'red',
    borderColor: Colors.danger || 'red',
    shadowColor: Colors.danger || 'red',
    shadowOpacity: 0.5,
  },
});