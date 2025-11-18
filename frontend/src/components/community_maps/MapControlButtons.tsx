import { AppText, fontWeightBold } from '@/src/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { MapControlButtonsProps } from './types'; // Importar los props

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

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
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

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
          color={showCriticalReports ? colors.gray : colors.lightText}
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
        onPress={onToggleCriticalView}
        activeOpacity={0.8}
      >
        {criticalLoading ? (
          <ActivityIndicator size="small" color={colors.lightText} /> // 4. Usar colores del tema
        ) : (
          <Ionicons
            name="warning"
            size={24}
            color={showCriticalReports ? colors.lightText : colors.danger}
          />
        )}
        {criticalCountForBadge > 0 && !showCriticalReports && (
          <View style={styles.criticalBadge}>
            <AppText style={styles.criticalBadgeText}>
              {criticalCountForBadge}
            </AppText>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.mapHeatmapButton,
          showHeatmap && styles.mapHeatmapButtonActive,
        ]}
        onPress={onToggleHeatmap}
        activeOpacity={0.8}
        disabled={heatmapLoading}
      >
        {heatmapLoading ? (
          <ActivityIndicator size="small" color={colors.lightText} /> // 4. Usar colores del tema
        ) : (
          <Ionicons
            name="flame-outline"
            size={24}
            // 4. Usar colores del tema
            color={showHeatmap ? colors.lightText : colors.danger}
          />
        )}
      </TouchableOpacity>
    </>
  );
};

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    filterButton: {
      position: 'absolute',
      top: 130,
      left: 20,
      backgroundColor: colors.primary, // Dinámico
      borderRadius: 30,
      borderWidth: 1,
      borderColor: colors.secondary, // Dinámico
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
      top: 130,
      right: 20,
      backgroundColor: colors.cardBackground, // Dinámico
      borderRadius: 30,
      padding: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
      zIndex: 10,
      borderWidth: 2,
      borderColor: colors.danger, // Dinámico
    },
    criticalButtonActive: {
      backgroundColor: colors.danger, // Dinámico
      borderColor: colors.danger, // Dinámico
      shadowColor: colors.danger, // Dinámico
      shadowOpacity: 0.5,
    },
    filterIndicator: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.success, // Dinámico
    },
    criticalBadge: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: colors.danger, // Dinámico
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    criticalBadgeText: {
      color: colors.lightText, // Dinámico
      fontSize: 12,
      fontWeight: fontWeightBold,
    },
    mapHeatmapButton: {
      position: 'absolute',
      top: 130,
      left: 80,
      backgroundColor: colors.cardBackground, // Dinámico
      borderRadius: 30,
      padding: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
      zIndex: 10,
      borderWidth: 2,
      borderColor: colors.secondary, // Dinámico
    },
    mapHeatmapButtonActive: {
      backgroundColor: colors.danger, // Dinámico
      borderColor: colors.danger, // Dinámico
      shadowColor: colors.danger, // Dinámico
      shadowOpacity: 0.5,
    },
  });
