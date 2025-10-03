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
  const [menuVisible, setMenuVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    type: 'todos',
    riskLevel: 'todos',
    status: 'activas',
    timeRange: 'todas',
  });

  // --- Archivar alertas expiradas ---
  const checkAndArchiveExpiredAlerts = (alerts: Alert[]): Alert[] => {
    const now = new Date();
    return alerts.map((alert) => {
      // Verificar que fecha_expiracion no sea null antes de crear Date
      if (alert.fecha_expiracion) {
        const expirationDate = new Date(alert.fecha_expiracion);
        if (expirationDate < now && alert.activa) {
          return { ...alert, activa: false };
        }
      }
      // Si no hay fecha de expiración o no ha expirado, devolver la alerta sin cambios
      return alert;
    });
  };

  // --- Aplicar filtros ---
  const applyFilters = (
    alerts: Alert[],
    filterOptions: FilterOptions,
  ): Alert[] => {
    return alerts.filter((alert) => {
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
  };

  // --- Fetch inicial de alertas ---
  useEffect(() => {
    const getAlerts = async () => {
      try {
        setLoading(true);
        const result = await fetchAlerts();
        const updatedAlerts = checkAndArchiveExpiredAlerts(result);
        setAllAlerts(updatedAlerts);
      } catch (error) {
        console.error('Error cargando alertas:', error);
      } finally {
        setLoading(false);
      }
    };
    getAlerts();
  }, []);

  // --- Aplicar filtros cada vez que cambian ---
  useEffect(() => {
    const filtered = applyFilters(allAlerts, filters);
    setFilteredAlerts(filtered);
  }, [allAlerts, filters]);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text>Cargando alertas...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ✅ Header fuera del contenedor con padding */}
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
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={24} />
          </TouchableOpacity>
        }
      />

      {/* ✅ Todo el contenido va dentro del container */}
      <View style={styles.container}>
        {/* Resumen de filtros activos */}
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

        {/* Lista de Alertas */}
        <FlatList
          data={filteredAlerts}
          renderItem={({ item }) => <AlertCard alert={item} />}
          keyExtractor={(item) => item.id_alerta.toString()}
          showsVerticalScrollIndicator={false}
        />

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
    padding: 16,
  },
  filterButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
});
