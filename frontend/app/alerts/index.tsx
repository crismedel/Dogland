import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  RefreshControl,
  Text, // Asegúrate de que Text esté importado
  Pressable, // Asegúrate de que Pressable esté importado
} from 'react-native';
import { useRouter } from 'expo-router';
import { Alert, FilterOptions } from '../../src/types/alert';
import AlertCard from '../../src/components/alerts/AlertCard';
import FilterModal from '../../src/components/alerts/FilterModal';
import { fetchAlerts } from '../../src/api/alerts';
import { useAutoRefresh } from '@/src/utils/useAutoRefresh';
import { REFRESH_KEYS } from '@/src/constants/refreshKeys';

import { Ionicons } from '@expo/vector-icons';
import FloatingSpeedDial from '../../src/components/UI/FloatingMenu';
import CustomHeader from '@/src/components/UI/CustomHeader';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';
import Spinner from '@/src/components/UI/Spinner';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

const CommunityAlertsScreen = () => {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const router = useRouter();
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [menuVisible, setMenuVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    type: 'todos',
    riskLevel: 'todos',
    status: 'activas',
    timeRange: 'todas',
  });

  // Archivar alertas expiradas
  const checkAndArchiveExpiredAlerts = (alerts: Alert[]): Alert[] => {
    const now = new Date();
    return alerts.map((alert) => {
      if (alert.fecha_expiracion) {
        const expirationDate = new Date(alert.fecha_expiracion);
        if (expirationDate < now && alert.activa) {
          return { ...alert, activa: false };
        }
      }
      return alert;
    });
  };

  // Aplicar filtros
  const applyFilters = (
    alerts: Alert[],
    filterOptions: FilterOptions,
  ): Alert[] =>
    alerts.filter((alert) => {
      if (filterOptions.type !== 'todos' && alert.tipo !== filterOptions.type)
        return false;
      if (
        filterOptions.riskLevel !== 'todos' &&
        alert.nivel_riesgo !== filterOptions.riskLevel
      )
        return false;
      if (filterOptions.status === 'activas' && !alert.activa) return false;
      if (filterOptions.status === 'archivadas' && alert.activa) return false;

      if (filterOptions.timeRange !== 'todas') {
        const alertDate = new Date(alert.fecha_creacion);
        const now = new Date();
        const diffTime = now.getTime() - alertDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filterOptions.timeRange) {
          case 'recientes':
            if (diffDays > 1) return false;
            break;
          case 'semana':
            if (diffDays > 7) return false;
            break;
          case 'mes':
            if (diffDays > 30) return false;
            break;
        }
      }
      return true;
    });

  // Fetch de alertas (reutilizable)
  const loadAlerts = async () => {
    try {
      setError(null);
      const result = await fetchAlerts();
      const updatedAlerts = checkAndArchiveExpiredAlerts(result);
      setAllAlerts(updatedAlerts);
    } catch (e: any) {
      console.error('Error cargando alertas:', e);
      setError(
        'No se pudieron cargar las alertas. Revisa tu conexión e inténtalo nuevamente.',
      );
      setAllAlerts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useAutoRefresh({
    key: REFRESH_KEYS.ALERTS,
    onRefresh: loadAlerts,
    refreshOnFocus: true,
    refreshOnMount: true,
  });

  // Aplicar filtros cuando cambien
  useEffect(() => {
    const filtered = applyFilters(allAlerts, filters);
    setFilteredAlerts(filtered);
  }, [allAlerts, filters]);

  const handleFiltersChange = (newFilters: FilterOptions) =>
    setFilters(newFilters);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
  };

  const clearAllFilters = () => {
    setFilters({
      type: 'todos',
      riskLevel: 'todos',
      status: 'activas',
      timeRange: 'todas',
    });
  };

  // Loading
  if (loading) {
    return <Spinner />;
  }

  // UI
  return (
    <KeyboardAvoidingView
      style={styles.container} // 4. Usar estilos dinámicos
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <CustomHeader
        title={`Alertas Comunitarias (${filteredAlerts.length})`}
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              // 4. Usar colores del tema (texto oscuro sobre fondo amarillo)
              style={{
                width: 24,
                height: 24,
                tintColor: isDark ? colors.lightText : colors.text,
              }}
            />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            {/* 4. Usar colores del tema (texto oscuro sobre fondo amarillo) */}
            <Ionicons
              name="options-outline"
              size={22}
              color={isDark ? colors.lightText : colors.text}
            />
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        {/* Chips de filtros activos */}
        {(filters.type !== 'todos' ||
          filters.riskLevel !== 'todos' ||
          filters.status !== 'activas' ||
          filters.timeRange !== 'todas') && (
          <View style={styles.filtersBar}>
            <Ionicons name="options-outline" size={16} color={colors.text} />
            <AppText style={styles.filtersBarLabel}>Filtros:</AppText>

            {/* Chip combinado (texto resumido) */}
            <View style={styles.filterChip}>
              <AppText numberOfLines={1} style={styles.filterChipText}>
                {filters.type !== 'todos' ? `Tipo: ${filters.type}  •  ` : ''}
                {filters.riskLevel !== 'todos'
                  ? `Riesgo: ${filters.riskLevel}  •  `
                  : ''}
                {filters.status !== 'activas'
                  ? `Estado: ${filters.status}  •  `
                  : ''}
                {filters.timeRange !== 'todas'
                  ? `Período: ${filters.timeRange}`
                  : ''}
              </AppText>
              <TouchableOpacity
                style={styles.chipClose}
                onPress={clearAllFilters}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={14} color={colors.darkGray} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Estados vacíos y de error */}
        {error ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="cloud-offline-outline"
              size={56}
              color={colors.primary} // 4. Usar colores del tema
            />
            <AppText style={styles.emptyTitle}>
              No se pudo cargar la información
            </AppText>
            <AppText style={styles.emptySubtitle}>{error}</AppText>
            <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
              <Ionicons
                name="refresh"
                size={18}
                color={isDark ? colors.lightText : colors.text} // 4. Usar colores del tema
              />
              <AppText style={styles.retryText}>Reintentar</AppText>
            </TouchableOpacity>
          </View>
        ) : filteredAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off-outline"
              size={56}
              color={colors.primary} // 4. Usar colores del tema
            />
            <AppText style={styles.emptyTitle}>
              No hay alertas para mostrar
            </AppText>
            <AppText style={styles.emptySubtitle}>
              {allAlerts.length === 0
                ? 'Aún no hay alertas creadas.'
                : 'Ajusta los filtros o crea una nueva alerta.'}
            </AppText>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.push('/alerts/create-alert')}
            >
              <Ionicons
                name="add"
                size={18}
                color={isDark ? colors.lightText : colors.text} // 4. Usar colores del tema
              />
              <AppText style={styles.primaryBtnText}>Crear alerta</AppText>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredAlerts}
            renderItem={({ item }) => <AlertCard alert={item} />}
            keyExtractor={(item) => item.id_alerta.toString()}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary} // 4. Usar colores del tema
              />
            }
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}

        {/* Modal de filtros */}
        <FilterModal
          visible={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        <FloatingSpeedDial
          visible={menuVisible}
          onToggle={() => setMenuVisible((v) => !v)}
          actions={[
            {
              key: 'Crear Reporte',
              label: 'Crear Reporte',
              onPress: () => {
                setMenuVisible(false);
                router.push('/create-report');
              },
              icon: (
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color={colors.secondary} // 4. Usar colores del tema
                />
              ),
            },
            {
              key: 'Crear Alerta',
              label: 'Crear Alerta',
              onPress: () => {
                setMenuVisible(false);
                router.push('/alerts/create-alert');
              },
              icon: (
                <Ionicons
                  name="alert-circle-outline"
                  size={22}
                  color={colors.secondary} // 4. Usar colores del tema
                />
              ),
            },
          ]}
          placement="left"
          direction="up"
          gap={12}
          persistentTooltips
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default CommunityAlertsScreen;

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 8,
      backgroundColor: colors.background, // Dinámico
    },

    filterButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 16,
      borderWidth: 0,
      backgroundColor: 'transparent',
    },

    // Nueva barra de filtros con chips
    filtersBar: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.cardBackground, // Dinámico
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
      marginHorizontal: 0,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 1,
    },
    filtersBarLabel: {
      fontSize: 13,
      color: colors.text, // Dinámico
      fontWeight: fontWeightSemiBold,
      marginRight: 4,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundSecon, // Dinámico
      borderColor: colors.gray, // Dinámico
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      maxWidth: '86%',
    },
    filterChipText: {
      color: colors.text, // Dinámico
      fontSize: 12,
      fontWeight: fontWeightMedium,
      maxWidth: '90%',
    },
    chipClose: {
      marginLeft: 8,
      backgroundColor: colors.cardBackground, // Dinámico
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background, // Dinámico
    },
    loadingText: { marginTop: 8, color: colors.secondary }, // Dinámico

    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: fontWeightSemiBold,
      color: colors.text, // Dinámico
      textAlign: 'center',
      marginTop: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.darkGray, // Dinámico
      textAlign: 'center',
      marginBottom: 12,
    },
    retryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primary, // Dinámico
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
    },
    retryText: {
      color: isDark ? colors.lightText : colors.text, // Dinámico
      fontWeight: fontWeightMedium,
    },

    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primary, // Dinámico
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
    },
    primaryBtnText: {
      color: isDark ? colors.lightText : colors.text, // Dinámico
      fontWeight: fontWeightSemiBold,
    },
  });