import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { mockAlerts } from '../../data/alertsData';

export interface Alert {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'sanitario' | 'seguridad' | 'vacunacion' | 'adopcion' | 'perdida';
}

// 🔹 Diccionario centralizado para estilos de tipos de alerta
const alertStyles: Record<Alert['type'], { card: object; badge: object }> = {
  sanitario: {
    card: { borderLeftColor: '#FF6B6B', backgroundColor: '#FFF5F5' },
    badge: { backgroundColor: '#FF6B6B' },
  },
  seguridad: {
    card: { borderLeftColor: '#FFB347', backgroundColor: '#FFF8F0' },
    badge: { backgroundColor: '#FFB347' },
  },
  vacunacion: {
    card: { borderLeftColor: '#4ECDC4', backgroundColor: '#F0FFFE' },
    badge: { backgroundColor: '#4ECDC4' },
  },
  adopcion: {
    card: { borderLeftColor: '#45B7D1', backgroundColor: '#F0F8FF' },
    badge: { backgroundColor: '#45B7D1' },
  },
  perdida: {
    card: { borderLeftColor: '#96CEB4', backgroundColor: '#F8FFF8' },
    badge: { backgroundColor: '#96CEB4' },
  },
};

// 🔹 Componente reutilizable para una card de alerta
const AlertCard = ({ alert }: { alert: Alert }) => {
  const { card, badge } = alertStyles[alert.type];

  return (
    <View style={[styles.card, card]}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{alert.title}</Text>
        <View style={[styles.typeBadge, badge]}>
          <Text style={styles.badgeText}>{alert.type.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.description}>{alert.description}</Text>
      <Text style={styles.date}>📅 {alert.date}</Text>
    </View>
  );
};

const CommunityAlertsScreen = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulación de llamadas al backend
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setAlerts(mockAlerts); // ✅ Ahora viene de archivo externo
      } catch (error) {
        console.error('Error cargando alertas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Cargando alertas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={alerts}
        renderItem={({ item }) => <AlertCard alert={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default CommunityAlertsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginVertical: 8,
    color: '#555',
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginTop: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
