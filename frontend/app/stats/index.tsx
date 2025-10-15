import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { BarChart, PieChart } from 'react-native-chart-kit';
import apiClient from '../../src/api/client';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { Colors } from '@/src/constants/colors';

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

const StatsScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [healthStates, setHealthStates] = useState<HealthStateStats[]>([]);
  const [species, setSpecies] = useState<SpeciesStats[]>([]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, healthRes, speciesRes] = await Promise.all([
        apiClient.get('/stats/summary'),
        apiClient.get('/stats/health-states'),
        apiClient.get('/stats/species'),
      ]);

      setSummary(summaryRes.data.data);
      setHealthStates(healthRes.data.data);
      setSpecies(speciesRes.data.data);

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
    labels: species.map(s => s.nombre),
    datasets: [{
      data: species.map(s => parseInt(s.total) || 0),
      colors: species.map((_, i) => (opacity = 1) => `rgba(0, 100, 255, ${(i + 1) / species.length * opacity})`),
    }]
  };

  const healthStatesPieData = healthStates.map((item, index) => {
    const total = parseInt(item.total) || 0;
    const color = index === 0 ? Colors.danger : index === 1 ? Colors.warning : Colors.accent;
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
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
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

        <Text style={styles.sectionTitle}>Resumen General</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary?.totalReports || 0}</Text>
            <Text style={styles.summaryLabel}>Total de Reportes</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: Colors.danger }]}>
            <Text style={[styles.summaryValue, { color: Colors.danger }]}>{summary?.criticalReports || 0}</Text>
            <Text style={styles.summaryLabel}>Reportes Críticos</Text>
          </View>
          {/* ✅ Se utiliza el valor de `activeReports` desde el objeto de resumen */}
          <View style={[styles.summaryCard, { borderColor: Colors.success }]}>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>{summary?.activeReports || 0}</Text>
            <Text style={styles.summaryLabel}>Reportes Activos</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Avistamientos por Especie</Text>
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
            <Text style={styles.noDataText}>No hay datos de especies para mostrar.</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Avistamientos por Estado de Salud</Text>
        <View style={styles.chartContainer}>
          {healthStatesPieData.length > 0 ? (
            <PieChart
              data={healthStatesPieData}
              width={width - 40}
              height={220}
              yAxisSuffix=""
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
            <Text style={styles.noDataText}>No hay datos de estado de salud para mostrar.</Text>
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
  scrollContent: { padding: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
    marginTop: 20,
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
  summaryValue: { fontSize: 32, fontWeight: 'bold', color: Colors.text },
  summaryLabel: { fontSize: 14, color: Colors.gray, textAlign: 'center', marginTop: 5 },
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