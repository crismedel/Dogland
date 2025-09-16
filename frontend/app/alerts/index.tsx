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
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Alert, FilterOptions } from '../../src/features/types';
import AlertCard from '../../src/components/alerts/AlertCard';
import FilterModal from '../../src/components/alerts/FilterModal';
import { fetchAlerts } from '../../src/api/alerts';

const CommunityAlertsScreen = () => {
  const router = useRouter();
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false); // nuevo estado para menú
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'todos',
    riskLevel: 'todos',
    status: 'activas',
    timeRange: 'todas',
  });

  // Animación para el menú flotante
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (menuVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          speed: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [menuVisible]);

  // Verificar y archivar alertas expiradas
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

  // Aplicar filtros
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

  // Fetch de alertas desde el backend
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
        {/* Header con back + título + filtros */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonHeader}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Image
              source={require('../../assets/images/volver.png')}
              style={styles.backIconHeader}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Alertas Comunitarias ({filteredAlerts.length})
          </Text>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterButtonText}>Filtros</Text>
          </TouchableOpacity>
        </View>

        {/* Resumen de filtros */}
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

        {/* Lista de alertas */}
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

        {/* Menú flotante persistente */}
        {menuVisible && (
          <Animated.View
            style={[
              styles.fabMenuContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push('/reports');
              }}
            >
              <Text style={styles.fabMenuItemText}>Ir a Reportes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.fabMenuItem, { marginTop: 10 }]}
              onPress={() => {
                setMenuVisible(false);
                router.push('/create-alert');
              }}
            >
              <Text style={styles.fabMenuItemText}>Crear Nueva Alerta</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Botón flotante principal */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => setMenuVisible(!menuVisible)}
        >
          <Text style={styles.fabText}>{menuVisible ? '×' : '+'}</Text>
        </TouchableOpacity>
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
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  backButtonHeader: {
    padding: 6,
  },
  backIconHeader: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  filterButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  filterButtonText: {
    color: '#007AFF',
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 1000,
  },
  fabText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  fabMenuContainer: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
  },
  fabMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  fabMenuItemText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});
