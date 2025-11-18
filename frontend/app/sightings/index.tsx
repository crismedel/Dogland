import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import apiClient from '../../src/api/client';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import { useNotification } from '@/src/components/notifications';
import {
  obtenerNombreEspecie,
  obtenerNombreEstadoSalud,
} from '../../src/types/report';
import { AppText } from '@/src/components/AppText';
import CustomHeader from '@/src/components/UI/CustomHeader';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

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
}

interface Sighting extends ApiSighting {
  activa: boolean;
}

const AvistamientosScreen: React.FC = () => {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const router = useRouter();
  const { showSuccess } = useNotification();

  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [criticalSightings, setCriticalSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // 4. Mover 'getStatePalette' adentro y usar 'colors'
  const getStatePalette = useCallback(
    (id_estado_salud: number) => {
      if (id_estado_salud === 3) {
        return {
          start: colors.danger,
          end: '#ff7676',
          accent: colors.danger,
          chipBg: `${colors.danger}1F`, // ~12% alpha
        };
      }
      if (id_estado_salud === 2) {
        return {
          start: colors.warning,
          end: colors.secondary,
          accent: colors.secondary,
          chipBg: `${colors.warning}26`, // ~15% alpha
        };
      }
      return {
        start: colors.success,
        end: '#8be58b',
        accent: colors.success,
        chipBg: `${colors.success}1F`, // ~12% alpha
      };
    },
    [colors],
  ); // Depende de 'colors'

  const handlePressSighting = (id: number) => {
    router.push({ pathname: '/sightings/[id]', params: { id: id.toString() } });
  };

  // 5. Actualizar renderHeader para usar 'colors'
  const renderHeader = () => (
    <CustomHeader
      title="Avistamientos"
      leftComponent={
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require('../../assets/images/volver.png')}
            style={{
              width: 24,
              height: 24,
              // El texto/ícono del header debe ser oscuro sobre fondo amarillo
              tintColor: isDark ? colors.lightText : colors.text,
            }}
          />
        </TouchableOpacity>
      }
    />
  );

  // 5. Actualizar renderDashboard para usar 'colors'
  const renderDashboard = () => (
    <View style={styles.dashboardWrap}>
      <LinearGradient
        colors={[colors.background, colors.backgroundSecon]}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.dashboard}
      >
        <View style={styles.metricItem}>
          <LinearGradient
            colors={[colors.accent, colors.primary]}
            style={styles.metricIconBg}
          >
            <Ionicons name="list" size={20} color={colors.lightText} />
          </LinearGradient>
          <AppText style={styles.metricValue}>{totalCount}</AppText>
          <AppText style={styles.metricLabel}>Total</AppText>
        </View>

        <View style={styles.metricItem}>
          <LinearGradient
            colors={[colors.danger, '#ffb3b3']}
            style={styles.metricIconBg}
          >
            <Ionicons name="alert-circle" size={20} color={colors.lightText} />
          </LinearGradient>
          <AppText style={styles.metricValue}>{criticalCount}</AppText>
          <AppText style={styles.metricLabel}>Críticos</AppText>
        </View>

        <View style={styles.metricItem}>
          <LinearGradient
            colors={[colors.success, '#b8f5b8']}
            style={styles.metricIconBg}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.lightText}
            />
          </LinearGradient>
          <AppText style={styles.metricValue}>{activeCount}</AppText>
          <AppText style={styles.metricLabel}>Activos</AppText>
        </View>
      </LinearGradient>
    </View>
  );

  // 5. Actualizar renderItem para usar 'colors'
  const renderItem = ({ item }: { item: Sighting }) => {
    const palette = getStatePalette(item.id_estado_salud);
    const stateName =
      obtenerNombreEstadoSalud(item.id_estado_salud) || 'Desconocido';
    const speciesName =
      obtenerNombreEspecie(item.id_especie) || 'Especie desconocida';

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handlePressSighting(item.id_avistamiento)}
      >
        <LinearGradient
          colors={[`${palette.start}10`, `${palette.end}05`]}
          start={[0, 0]}
          end={[1, 1]}
          style={[styles.card, { borderColor: palette.accent + '100' }]}
        >
          <View style={styles.cardLeft}>
            <LinearGradient
              colors={[palette.start, palette.end]}
              style={styles.stateBadge}
              start={[0, 0]}
              end={[1, 1]}
            >
              <Ionicons
                name={item.id_estado_salud === 3 ? 'warning' : 'leaf'}
                size={20}
                color={colors.lightText} // Usar color de tema
              />
            </LinearGradient>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.cardTitleRow}>
              <AppText style={styles.cardTitle} numberOfLines={2}>
                {item.descripcion || 'Sin descripción.'}
              </AppText>
              <AppText style={styles.smallDate}>
                {formatDate(item.fecha_creacion)}
              </AppText>
            </View>

            <View style={styles.chipsRow}>
              <LinearGradient
                colors={[`${palette.start}33`, `${palette.end}55`]}
                start={[0, 0]}
                end={[1, 1]}
                style={styles.chipGradient}
              >
                <View style={styles.chipInner}>
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
              </LinearGradient>

              <LinearGradient
                colors={[`${palette.start}33`, `${palette.end}55`]}
                start={[0, 0]}
                end={[1, 1]}
                style={styles.chipGradient}
              >
                <View style={styles.chipInner}>
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
              </LinearGradient>

              {item.nivel_riesgo ? (
                <View
                  style={[styles.chip, { backgroundColor: palette.chipBg }]}
                >
                  <Ionicons
                    name="flame"
                    size={14}
                    color={palette.accent}
                    style={{ marginRight: 6 }}
                  />
                  <AppText style={[styles.chipText, { color: palette.accent }]}>
                    {item.nivel_riesgo}
                  </AppText>
                </View>
              ) : null}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading && sightings.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingWrap}>
          {/* 6. Usar colores del tema */}
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={styles.loadingText}>
            Cargando avistamientos...
          </AppText>
        </View>
      </View>
    );
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
            colors={[colors.primary]} // 6. Usar colores del tema
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            {/* 6. Usar colores del tema */}
            <Ionicons name="eye-off" size={44} color={colors.darkGray} />
            <AppText style={styles.emptyText}>
              No hay avistamientos registrados.
            </AppText>
          </View>
        )}
      />
    </View>
  );
};

export default AvistamientosScreen;

// 7. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background, // Dinámico
    },
    loadingWrap: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      color: colors.darkGray, // Dinámico
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
      backgroundColor: colors.backgroundSecon, // Dinámico
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
      color: colors.text, // Dinámico
    },
    metricLabel: {
      fontSize: 10,
      color: colors.darkGray, // Dinámico
      marginTop: 0,
    },

    listContent: {
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 30,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundSecon, // Dinámico
      borderRadius: 16,
      borderWidth: 1,
      padding: 10,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
      marginBottom: 20,
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
      color: colors.text, // Dinámico
    },
    smallDate: {
      fontSize: 12,
      color: colors.darkGray, // Dinámico
      marginLeft: 8,
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

    chipGradient: {
      borderRadius: 999,
      padding: 1.5,
      marginRight: 8,
      marginBottom: 6,
    },
    chipInner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: colors.background, // Dinámico
    },
    emptyWrap: {
      paddingTop: 40,
      alignItems: 'center',
    },
    emptyText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.darkGray, // Dinámico
    },
  });