import {
  AppText,
  fontWeightBold,
} from '@/src/components/AppText';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { Colors } from '@/src/constants/colors';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import apiClient from '../../src/api/client';

const { width } = Dimensions.get('window');

interface SummaryStats {
  totalReports: number;
  criticalReports: number;
  activeReports: number;
}

interface HealthStateStats {
  nombre: string;
  total: string;
}

interface SpeciesStats {
  nombre: string;
  total: string;
}

interface UserImpactStats {
  myReports: number;
  myResolved: number;
  contributionPercentage: string;
}

interface TrendStats {
  labels: string[];
  data: number[];
}

const StatsScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [healthStates, setHealthStates] = useState<HealthStateStats[]>([]);
  const [species, setSpecies] = useState<SpeciesStats[]>([]);
  const [userImpact, setUserImpact] = useState<UserImpactStats | null>(null);
  const [trend, setTrend] = useState<TrendStats | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, healthRes, speciesRes, userImpactRes, trendRes] = await Promise.all([
        apiClient.get('/stats/summary'),
        apiClient.get('/stats/health-states'),
        apiClient.get('/stats/species'),
        apiClient.get('/stats/user-impact'), // Ya no enviamos userId por parámetro
        apiClient.get('/stats/trend'),
      ]);

      setSummary(summaryRes.data.data);
      setHealthStates(healthRes.data.data);
      setSpecies(speciesRes.data.data);
      setUserImpact(userImpactRes.data.data);
      setTrend(trendRes.data.data);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const speciesChartData = {
    labels: species.map((s) => s.nombre),
    datasets: [
      {
        data: species.map((s) => parseInt(s.total) || 0),
        colors: species.map(
          (_, i) =>
            (opacity = 1) =>
              `rgba(0, 100, 255, ${((i + 1) / species.length) * opacity})`,
        ),
      },
    ],
  };

  const healthStatesPieData = healthStates.map((item, index) => {
    const total = parseInt(item.total) || 0;
    const color =
      index === 0
        ? Colors.danger
        : index === 1
        ? Colors.warning
        : Colors.accent;
    return {
      name: item.nombre,
      population: total,
      color: color,
      legendFontColor: Colors.text,
      legendFontSize: 12,
    };
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <AppText style={styles.loadingText}>Cargando estadísticas...</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Estadísticas de Reportes"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              style={{ width: 24, height: 24, tintColor: '#fff' }}
            />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* --- RESUMEN GENERAL --- */}
        <AppText style={styles.sectionTitle}>Resumen General</AppText>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <AppText style={styles.summaryValue}>
              {summary?.totalReports || 0}
            </AppText>
            <AppText style={styles.summaryLabel}>Total de Reportes</AppText>
          </View>
          <View style={[styles.summaryCard, { borderColor: Colors.danger }]}>
            <AppText style={[styles.summaryValue, { color: Colors.danger }]}>
              {summary?.criticalReports || 0}
            </AppText>
            <AppText style={styles.summaryLabel}>Reportes Críticos</AppText>
          </View>
          <View style={[styles.summaryCard, { borderColor: Colors.success }]}>
            <AppText style={[styles.summaryValue, { color: Colors.success }]}>
              {summary?.activeReports || 0}
            </AppText>
            <AppText style={styles.summaryLabel}>Reportes Activos</AppText>
          </View>
        </View>

        {/* --- MI IMPACTO --- */}
        <AppText style={styles.sectionTitle}>Mi Impacto en la Comunidad</AppText>
        <View style={styles.impactContainer}>
          <View style={styles.impactCard}>
            <AppText style={styles.impactValue}>{userImpact?.myReports || 0}</AppText>
            <AppText style={styles.impactLabel}>Mis Reportes</AppText>
          </View>
          <View style={styles.impactCard}>
            <AppText style={[styles.impactValue, { color: Colors.primary }]}>
              {userImpact?.contributionPercentage || 0}%
            </AppText>
            <AppText style={styles.impactLabel}>Contribución Total</AppText>
          </View>
          <View style={styles.impactCard}>
            <AppText style={[styles.impactValue, { color: Colors.success }]}>
              {userImpact?.myResolved || 0}
            </AppText>
            <AppText style={styles.impactLabel}>Casos Resueltos</AppText>
          </View>
        </View>

        {/* --- TENDENCIA SEMANAL --- */}
        <AppText style={styles.sectionTitle}>Tendencia (Últimos 7 días)</AppText>
        <View style={styles.chartContainer}>
          {trend && trend.labels.length > 0 ? (
            <LineChart
              data={{
                labels: trend.labels,
                datasets: [{ data: trend.data }],
              }}
              width={width - 40}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: Colors.lightText,
                backgroundGradientFrom: Colors.lightText,
                backgroundGradientTo: Colors.lightText,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 99, 71, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: Colors.primary,
                },
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <AppText style={styles.noDataText}>
              No hay suficientes datos de tendencia.
            </AppText>
          )}
        </View>

        {/* --- CHART ESPECIES --- */}
        <AppText style={styles.sectionTitle}>Avistamientos por Especie</AppText>
        <View style={styles.chartContainer}>
          {speciesChartData.labels.length > 0 ? (
            <BarChart
              data={speciesChartData}
              width={width - 40}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: Colors.lightText,
                backgroundGradientFrom: Colors.lightText,
                backgroundGradientTo: Colors.lightText,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
                barPercentage: 0.8,
              }}
              style={styles.chart}
            />
          ) : (
            <AppText style={styles.noDataText}>
              No hay datos de especies para mostrar.
            </AppText>
          )}
        </View>

        {/* --- CHART ESTADO SALUD --- */}
        <AppText style={styles.sectionTitle}>
          Avistamientos por Estado de Salud
        </AppText>
        <View style={styles.chartContainer}>
          {healthStatesPieData.length > 0 ? (
            <PieChart
              data={healthStatesPieData}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: Colors.lightText,
                backgroundGradientFrom: Colors.lightText,
                backgroundGradientTo: Colors.lightText,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <AppText style={styles.noDataText}>
              No hay datos de estado de salud para mostrar.
            </AppText>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background || '#F0F4F7' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: Colors.primary },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: fontWeightBold,
    color: Colors.text,
    marginBottom: 15,
    marginTop: 25,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.lightText,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: fontWeightBold,
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 5,
  },
  impactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  impactCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 5,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  impactValue: {
    fontSize: 24,
    fontWeight: fontWeightBold,
    color: Colors.text,
  },
  impactLabel: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: Colors.lightText,
    borderRadius: 16,
    padding: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chart: { marginVertical: 8, borderRadius: 16 },
  noDataText: { textAlign: 'center', padding: 20, color: Colors.gray },
});

export default StatsScreen;