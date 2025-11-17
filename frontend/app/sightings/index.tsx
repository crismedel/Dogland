import { AppText } from '@/src/components/AppText';
import { useNotification } from '@/src/components/notifications';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { Colors } from '@/src/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import apiClient from '../../src/api/client';
import {
  obtenerNombreEspecie,
  obtenerNombreEstadoSalud,
} from '../../src/types/report';
import Spinner from '@/src/components/UI/Spinner';

// --- Interfaz (Asegúrate que tu API en '/sightings' devuelva estos campos) ---
interface ApiSighting {
  id_avistamiento: number;
  descripcion: string;
  id_especie: number;
  id_estado_salud: number;
  fecha_creacion: string;
  fotos_url: string[];
  nivel_riesgo: string;
  id_estado_avistamiento: number;
  latitude?: number;
  longitude?: number;
  id_usuario: number;
  titulo: string;
  motivo_cierre?: string;
}

interface Sighting extends ApiSighting {
  activa: boolean;
}

// --- Helpers de Estado ---
const getSightingStatusName = (id: number) => {
  if (id === 1) return 'Activo';
  if (id === 2) return 'Desaparecido';
  if (id === 3) return 'Observado';
  if (id === 4) return 'Recuperado';
  if (id === 5) return 'Cerrado';
  return 'Desconocido';
};
const CERRADO_STATUS_ID = 5;

const AvistamientosScreen: React.FC = () => {
  const router = useRouter();
  const { showSuccess } = useNotification();

  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [criticalSightings, setCriticalSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // (Se quitó la lógica de modales de este archivo)

  const normalizeSighting = (item: ApiSighting): Sighting => ({
    ...item,
    activa: item.id_estado_avistamiento === 1,
  });

  const fetchSightings = useCallback(async () => {
    try {
      const res = await apiClient.get('/sightings');
      const rawData: ApiSighting[] = res.data.data || [];
      const normalized = rawData.map(normalizeSighting);
      setSightings(normalized);
    } catch (err) {
      console.error('Error al obtener los avistamientos:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchCriticalSightings = useCallback(async () => {
    try {
      const res = await apiClient.get('/sightings/filter', {
        params: { id_estado_salud: 3 },
      });
      const rawData: ApiSighting[] = res.data.data || [];
      const normalized = rawData.map(normalizeSighting);
      setCriticalSightings(normalized);
    } catch (err) {
      console.error('Error al obtener avistamientos críticos:', err);
    }
  }, []);

  useEffect(() => {
    fetchSightings();
    fetchCriticalSightings();
  }, [fetchSightings, fetchCriticalSightings]);

  // Verificar nuevos críticos cada 30 segundos
  useEffect(() => {
    const interval = setInterval(async () => {
      const prev = criticalSightings.length;
      await fetchCriticalSightings();
      const next = criticalSightings.length;
      if (next > prev) {
        showSuccess(
          '¡Alerta!',
          `Hay ${next - prev} nuevos avistamientos críticos.`,
        );
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [criticalSightings, fetchCriticalSightings, showSuccess]);

  const totalCount = sightings.length;
  const criticalCount = criticalSightings.length;
  const activeCount = sightings.filter((s) => s.activa).length;

  const combinedSightings = [
    ...criticalSightings,
    ...sightings.filter(
      (s) =>
        !criticalSightings.find((c) => c.id_avistamiento === s.id_avistamiento),
    ),
  ];

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Fecha inválida';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Fecha inválida';
    }
  };

  // 🎨 Paleta según estado
  const getStatePalette = (id_estado_salud: number) => {
    if (id_estado_salud === 3) {
      return {
        start: Colors.danger,
        end: '#ff7676',
        accent: Colors.danger,
        chipBg: 'rgba(220,53,69,0.12)',
      };
    }
    if (id_estado_salud === 2) {
      return {
        start: Colors.warning,
        end: Colors.secondary,
        accent: Colors.secondary,
        chipBg: 'rgba(249,203,106,0.15)',
      };
    }
    return {
      start: Colors.success,
      end: '#8be58b',
      accent: Colors.success,
      chipBg: 'rgba(40,167,69,0.12)',
    };
  };

  // --- HANDLER RESTAURADO (para navegar) ---
  const handlePressSighting = (id: number) => {
    router.push({ pathname: '/sightings/[id]', params: { id: id.toString() } });
  };

  // Header personalizado
  const renderHeader = () => (
    <CustomHeader
      title="Avistamientos"
      leftComponent={
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require('../../assets/images/volver.png')}
            style={{ width: 24, height: 24, tintColor: Colors.lightText }}
          />
        </TouchableOpacity>
      }
    />
  );

  const renderDashboard = () => (
    <View style={styles.dashboardWrap}>
      <View style={styles.dashboard}>
        <View style={styles.metricItem}>
          <View
            style={[styles.metricIconBg, { backgroundColor: Colors.accent }]}
          >
            <Ionicons name="list" size={20} color={Colors.lightText} />
          </View>
          <AppText style={styles.metricValue}>{totalCount}</AppText>
          <AppText style={styles.metricLabel}>Total</AppText>
        </View>

        <View style={styles.metricItem}>
          <View
            style={[styles.metricIconBg, { backgroundColor: Colors.danger }]}
          >
            <Ionicons name="alert-circle" size={20} color={Colors.lightText} />
          </View>
          <AppText style={styles.metricValue}>{criticalCount}</AppText>
          <AppText style={styles.metricLabel}>Críticos</AppText>
        </View>

        <View style={styles.metricItem}>
          <View
            style={[styles.metricIconBg, { backgroundColor: Colors.success }]}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={Colors.lightText}
            />
          </View>
          <AppText style={styles.metricValue}>{activeCount}</AppText>
          <AppText style={styles.metricLabel}>Activos</AppText>
        </View>
      </View>
    </View>
  );

  // --- RENDER ITEM (Modificado para mostrar motivo) ---
  const renderItem = ({ item }: { item: Sighting }) => {
    const palette = getStatePalette(item.id_estado_salud);
    const stateName =
      obtenerNombreEstadoSalud(item.id_estado_salud) || 'Desconocido';
    const speciesName =
      obtenerNombreEspecie(item.id_especie) || 'Especie desconocida';

    // Nueva lógica de estado
    const sightingStatusName = getSightingStatusName(
      item.id_estado_avistamiento,
    );
    const isClosed = item.id_estado_avistamiento === CERRADO_STATUS_ID;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handlePressSighting(item.id_avistamiento)} // <-- LLAMA A NAVEGACIÓN
        style={[styles.card, isClosed && styles.closedCard]}
      >
        <View style={styles.gradientBackground}>
          <View style={styles.cardLeft}>
            <View
              style={[styles.stateBadge, { backgroundColor: palette.start }]}
            >
              <Ionicons
                name={item.id_estado_salud === 3 ? 'warning' : 'leaf'}
                size={20}
                color="#fff"
              />
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.cardTitleRow}>
              <AppText style={styles.cardTitle} numberOfLines={2}>
                {item.titulo || item.descripcion || 'Sin descripción.'}
              </AppText>
              <AppText style={styles.smallDate}>
                {formatDate(item.fecha_creacion)}
              </AppText>
            </View>

            {/* --- MUESTRA MOTIVO DE CIERRE SI EXISTE --- */}
            {isClosed && item.motivo_cierre && (
              <View style={styles.reasonContainer}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={Colors.gray}
                  style={{ marginRight: 6 }}
                />
                <AppText
                  style={[styles.chipText, { color: Colors.gray }]}
                  numberOfLines={1}
                >
                  Motivo: {item.motivo_cierre}
                </AppText>
              </View>
            )}

            <View style={styles.chipsRow}>
              <View style={[styles.chip, { backgroundColor: palette.chipBg }]}>
                <Ionicons
                  name="paw"
                  size={14}
                  color={palette.accent}
                  style={{ marginRight: 6 }}
                />
                <AppText style={[styles.chipText, { color: palette.accent }]}>
                  {speciesName}
                </AppText>
              </View>

              <View style={[styles.chip, { backgroundColor: palette.chipBg }]}>
                <Ionicons
                  name="heart"
                  size={14}
                  color={palette.accent}
                  style={{ marginRight: 6 }}
                />
                <AppText style={[styles.chipText, { color: palette.accent }]}>
                  {stateName}
                </AppText>
              </View>

              <View
                style={[
                  styles.chip,
                  isClosed ? styles.chipClosed : styles.chipActive,
                ]}
              >
                <Ionicons
                  name={isClosed ? 'lock-closed' : 'eye'}
                  size={14}
                  color={isClosed ? Colors.darkGray : Colors.success}
                  style={{ marginRight: 6 }}
                />
                <AppText
                  style={[
                    styles.chipText,
                    isClosed
                      ? { color: Colors.darkGray }
                      : { color: Colors.success },
                  ]}
                >
                  {sightingStatusName}
                </AppText>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && sightings.length === 0) {
    return <Spinner />;
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderDashboard()}
      <FlatList
        data={combinedSightings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id_avistamiento.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchSightings();
              fetchCriticalSightings();
            }}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            <Ionicons name="eye-off" size={44} color={Colors.darkGray} />
            <AppText style={styles.emptyText}>
              No hay avistamientos registrados.
            </AppText>
          </View>
        )}
      />

      {/* --- MODALES ELIMINADOS DE ESTE ARCHIVO --- */}
    </View>
  );
};

export default AvistamientosScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: Colors.darkGray,
    fontSize: 15,
  },
  dashboardWrap: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 2,
  },
  dashboard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecon,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    opacity: 0.95,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricIconBg: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    opacity: 0.9,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.darkGray,
    marginTop: 0,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 30,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.secondary,
    backgroundColor: Colors.cardBackground || '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  closedCard: {
    opacity: 0.7,
  },
  gradientBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'transparent',
  },
  cardLeft: {
    width: 62,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 8,
  },
  stateBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  cardBody: {
    flex: 1,
    paddingLeft: 6,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  smallDate: {
    fontSize: 12,
    color: Colors.darkGray,
    marginLeft: 8,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  reasonText: {
    fontSize: 13,
    color: Colors.darkGray,
    marginLeft: 8,
    fontStyle: 'italic',
    flex: 1,
  },
  chipsRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
  },
  chipActive: {
    backgroundColor: 'rgba(40,167,69,0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipClosed: {
    backgroundColor: Colors.gray,
    opacity: 0.5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyWrap: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.darkGray,
  },

  // --- (Estilos de Modal eliminados) ---
});
