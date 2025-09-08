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
import { router } from 'expo-router';
import { mockAlerts } from '../../src/data/alertsData';
import {
  Alert,
  FilterOptions,
  tipoAlertas,
  nivelesRiesgo,
} from '../../src/features/types';
import AlertCard from '../../src/components/alerts/AlertCard';
import FilterModal from '../../src/components/alerts/FilterModal';

const CommunityAlertsScreen = () => {
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'todos',
    riskLevel: 'todos',
    status: 'activas',
    timeRange: 'todas',
  });

  // Función para verificar y archivar alertas expiradas
  const checkAndArchiveExpiredAlerts = (alerts: Alert[]): Alert[] => {
    const now = new Date();
    return alerts.map((alert) => {
      const expirationDate = new Date(alert.fecha_expiracion);
      if (expirationDate < now && alert.activa) {
        return { ...alert, activa: false };
      }
      return alert;
    });
  };

  // Función para aplicar filtros
  const applyFilters = (
    alerts: Alert[],
    filterOptions: FilterOptions,
  ): Alert[] => {
    return alerts.filter((alert) => {
      // Mapeamos ids a strings legibles
      const tipoName = alert.tipo ?? tipoAlertas[alert.id_tipo_alerta];
      const riesgoName =
        alert.nivelRiesgo ?? nivelesRiesgo[alert.id_nivel_riesgo];

      // Filtro por tipo
      if (filterOptions.type !== 'todos' && tipoName !== filterOptions.type) {
        return false;
      }

      // Filtro por nivel de riesgo
      if (
        filterOptions.riskLevel !== 'todos' &&
        riesgoName !== filterOptions.riskLevel
      ) {
        return false;
      }

      // Filtro por estado
      if (filterOptions.status === 'activas' && !alert.activa) {
        return false;
      }
      if (filterOptions.status === 'archivadas' && alert.activa) {
        return false;
      }

      // Filtro por tiempo
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

  // Simulación de llamadas al backend con datos extendidos
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data: Alert[] = mockAlerts;

        // Verificar y archivar alertas expiradas
        const updatedAlerts = checkAndArchiveExpiredAlerts(data);
        setAllAlerts(updatedAlerts);
      } catch (error) {
        console.error('Error cargando alertas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  // Aplicar filtros cuando cambien los filtros o las alertas
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
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Cargando alertas...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>

        {/* Header con filtros */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Alertas Comunitarias ({filteredAlerts.length})
          </Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterButtonText}>🔍 Filtros</Text>
          </TouchableOpacity>
        </View>

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

        <FlatList
          data={filteredAlerts}
          renderItem={({ item }) => <AlertCard alert={item} />}
          keyExtractor={(item) => item.id_alerta.toString()}
          showsVerticalScrollIndicator={false}
        />

        <FilterModal
          visible={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default CommunityAlertsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  filterButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  activeFilters: {
    backgroundColor: '#e3f2fd',
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
