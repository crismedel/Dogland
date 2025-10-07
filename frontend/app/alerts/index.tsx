import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Alert, FilterOptions } from '../../src/types/alert';
import AlertCard from '../../src/components/alerts/AlertCard';
import FilterModal from '../../src/components/alerts/FilterModal';
import { fetchAlerts } from '../../src/api/alerts';

import { Ionicons } from '@expo/vector-icons';
import FloatingMenu from '../../src/components/UI/FloatingMenu';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { Colors } from '@/src/constants/colors';

const CommunityAlertsScreen = () => {
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
      setAllAlerts([]); // opcional: vaciar lista en error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch inicial
  useEffect(() => {
    setLoading(true);
    loadAlerts();
  }, []);

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

  // Loading
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando alertas...</Text>
      </View>
    );
  }

  // UI
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header sin “cuadrado blanco”. Forzamos transparente aquí por si el componente trae fondo por defecto. */}
      <CustomHeader
        title={`Alertas Comunitarias (${filteredAlerts.length})`}
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              style={{ width: 24, height: 24, tintColor: '#fff' }}
            />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity
            // sin fondo, solo borde sutil opcional
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={22} color="#fff" />
          </TouchableOpacity>
        }
        // Si tu CustomHeader acepta estilos del contenedor, asegura transparentes:
        // containerStyle={{ backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 }}
        // contentStyle={{ backgroundColor: 'transparent' }}
      />

      <View style={styles.container}>
        {(filters.type !== 'todos' ||
          filters.riskLevel !== 'todos' ||
          filters.status !== 'activas' ||
          filters.timeRange !== 'todas') && (
          <View style={styles.activeFilters}>
            <Text style={styles.activeFiltersText}>
              Filtros: {filters.type !== 'todos' && `Tipo: ${filters.type} `}
              {filters.riskLevel !== 'todos' && `Riesgo: ${filters.riskLevel} `}
              {filters.status !== 'activas' && `Estado: ${filters.status} `}
              {filters.timeRange !== 'todas' && `Período: ${filters.timeRange}`}
            </Text>
          </View>
        )}

        {/* Estados vacíos y de error */}
        {error ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="cloud-offline-outline"
              size={56}
              color={Colors.primary}
            />
            <Text style={styles.emptyTitle}>
              No se pudo cargar la información
            </Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : filteredAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off-outline"
              size={56}
              color={Colors.primary}
            />
            <Text style={styles.emptyTitle}>No hay alertas para mostrar</Text>
            <Text style={styles.emptySubtitle}>
              {allAlerts.length === 0
                ? 'Aún no hay alertas creadas.'
                : 'Ajusta los filtros o crea una nueva alerta.'}
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.push('/alerts/create-alert')}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>Crear alerta</Text>
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
                tintColor={Colors.primary}
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

        <FloatingMenu
          visible={menuVisible}
          onToggle={() => setMenuVisible(!menuVisible)}
          onNavigateToReports={() => {
            setMenuVisible(false);
            router.push('/create-report');
          }}
          onNavigateToCreateAlert={() => {
            setMenuVisible(false);
            router.push('/alerts/create-alert');
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default CommunityAlertsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingTop: 8, // evita choques visuales con el header
  },

  // Botón del header sin fondo blanco
  filterButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 0, // sin borde; si quieres un aro: borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)'
    backgroundColor: 'transparent',
  },

  activeFilters: {
    backgroundColor: Colors.secondary,
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  activeFiltersText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 8, color: Colors.secondary },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.lightText,
    textAlign: 'center',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: '#fff', fontWeight: '600' },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
});
