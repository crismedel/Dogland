import {
  AppText,
  fontWeightBold,
  fontWeightMedium,
} from '@/src/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
// 1. Quitar la importación estática
// import { Colors } from '../../constants/colors';
import { MapStatusOverlayProps } from './types'; // Importar los props

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

export const MapStatusOverlay = ({
  currentLoadingState,
  shouldHideMap,
  reportsToRenderCount,
  showCriticalReports,
  onClearFilters,
}: MapStatusOverlayProps) => {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  if (currentLoadingState) {
    return (
      <View style={styles.loadingContainer}>
        {/* 4. Usar colores del tema */}
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={styles.loadingText}>
          {showCriticalReports ? 'Buscando emergencias...' : 'Cargando mapa...'}
        </AppText>
      </View>
    );
  }

  if (shouldHideMap && reportsToRenderCount === 0) {
    return (
      <View style={styles.noResultsContainer}>
        {/* 4. Usar colores del tema */}
        <Ionicons name="search-outline" size={64} color={colors.gray} />
        <AppText style={styles.noResultsTitle}>
          {showCriticalReports
            ? '¡Excelente! No hay reportes críticos.'
            : 'No se encontraron resultados'}
        </AppText>
        {!showCriticalReports && (
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={onClearFilters}
          >
            <AppText style={styles.clearFilterText}>Limpiar filtros</AppText>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return null;
};

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    loadingContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -75 }, { translateY: -50 }],
      // Usamos el color de fondo de las tarjetas con opacidad
      backgroundColor: isDark
        ? 'rgba(44, 62, 80, 0.9)'
        : 'rgba(244, 236, 222, 0.9)',
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
      zIndex: 20,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 14,
      color: colors.text, // Dinámico
    },
    noResultsContainer: {
      position: 'absolute',
      top: '40%',
      left: '10%',
      right: '10%',
      backgroundColor: isDark
        ? 'rgba(44, 62, 80, 0.95)'
        : 'rgba(244, 236, 222, 0.95)',
      padding: 30,
      borderRadius: 15,
      alignItems: 'center',
      zIndex: 20,
      elevation: 5,
    },
    noResultsTitle: {
      fontSize: 18,
      fontWeight: fontWeightBold,
      color: colors.text, // Dinámico
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    clearFilterButton: {
      backgroundColor: colors.primary, // Dinámico
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    clearFilterText: {
      // 6. Lógica clave: el texto sobre fondo amarillo (primary) debe ser oscuro en ambos modos
      color: isDark ? colors.lightText : colors.text,
      fontWeight: fontWeightMedium,
      fontSize: 16,
    },
  });