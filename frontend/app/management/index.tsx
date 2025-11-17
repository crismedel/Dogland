import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { Colors } from '@/src/constants/colors';
import {
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';
import { fetchAlerts } from '@/src/api/alerts';
import { fetchSightings } from '@/src/api/sightings';
import AlertCard from '@/src/components/alerts/AlertCard';
import { Alert } from '@/src/types/alert';
import Spinner from '@/src/components/UI/Spinner';

type TabType = 'alertas' | 'avistamientos';

const ManagementScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('alertas');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sightings, setSightings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos según tab activo
  const loadData = async () => {
    try {
      setError(null);
      if (activeTab === 'alertas') {
        const alertsData = await fetchAlerts();
        setAlerts(alertsData);
      } else {
        const sightingsData = await fetchSightings();
        setSightings(sightingsData);
      }
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderTabButton = (tab: TabType, label: string, icon: string) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.tabButtonActive]}
        onPress={() => setActiveTab(tab)}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={isActive ? Colors.primary : Colors.secondary}
        />
        <AppText style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
          {label}
        </AppText>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return <Spinner />;
  }

  const data = activeTab === 'alertas' ? alerts : sightings;

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Gestión"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              style={{ width: 24, height: 24, tintColor: '#fff' }}
            />
          </TouchableOpacity>
        }
      />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {renderTabButton('alertas', 'Alertas', 'notifications-outline')}
        {renderTabButton('avistamientos', 'Avistamientos', 'eye-outline')}
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {error ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="cloud-offline-outline"
              size={56}
              color={Colors.primary}
            />
            <AppText style={styles.emptyTitle}>Error al cargar</AppText>
            <AppText style={styles.emptySubtitle}>{error}</AppText>
            <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
              <Ionicons name="refresh" size={18} color="#fff" />
              <AppText style={styles.retryText}>Reintentar</AppText>
            </TouchableOpacity>
          </View>
        ) : data.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name={
                activeTab === 'alertas'
                  ? 'notifications-off-outline'
                  : 'eye-off-outline'
              }
              size={56}
              color={Colors.primary}
            />
            <AppText style={styles.emptyTitle}>
              No hay {activeTab === 'alertas' ? 'alertas' : 'avistamientos'}
            </AppText>
            <AppText style={styles.emptySubtitle}>
              {activeTab === 'alertas'
                ? 'No se encontraron alertas para gestionar'
                : 'No se encontraron avistamientos para gestionar'}
            </AppText>
          </View>
        ) : (
          <FlatList
            data={data}
            renderItem={({ item }) => {
              if (activeTab === 'alertas') {
                return <AlertCard alert={item} />;
              } else {
                // Por ahora muestra info básica de avistamiento
                return (
                  <View style={styles.sightingCard}>
                    <AppText style={styles.sightingTitle}>
                      {item.especie || 'Avistamiento'}
                    </AppText>
                    <AppText style={styles.sightingDate}>
                      {new Date(item.fecha_avistamiento).toLocaleDateString()}
                    </AppText>
                  </View>
                );
              }
            }}
            keyExtractor={(item, index) =>
              activeTab === 'alertas'
                ? `alert-${item.id_alerta}`
                : `sighting-${item.id_avistamiento || index}`
            }
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
      </View>
    </View>
  );
};

export default ManagementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: Colors.background,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: `rgba(251, 191, 36, 0.1)`,
    borderColor: Colors.primary,
  },
  tabLabel: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: fontWeightMedium,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: fontWeightSemiBold,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 8,
    color: Colors.secondary,
  },
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
    color: Colors.text,
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
  retryText: {
    color: '#fff',
    fontWeight: fontWeightMedium,
  },
  sightingCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sightingTitle: {
    fontSize: 16,
    fontWeight: fontWeightSemiBold,
    color: Colors.text,
    marginBottom: 4,
  },
  sightingDate: {
    fontSize: 13,
    color: Colors.secondary,
  },
});
