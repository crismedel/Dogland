import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Alert,
  alertStyles,
  riskStyles,
  tipoAlertas,
  nivelesRiesgo,
} from '../../features/types';

interface AlertCardProps {
  alert: Alert;
}

// Componente actualizado para card de alerta
const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  // transformar FK en nombre legible para estilos
  const typeName = tipoAlertas[alert.id_tipo_alerta];
  const riskName = nivelesRiesgo[alert.id_nivel_riesgo];

  const { card, badge } = alertStyles[typeName];
  const riskStyle = riskStyles[riskName];

  const daysUntilExpiration = Math.ceil(
    (new Date(alert.fecha_expiracion).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <View style={[styles.card, card, !alert.activa && styles.archivedCard]}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{alert.titulo}</Text>
        <View style={styles.badgeContainer}>
          <View style={[styles.typeBadge, badge]}>
            <Text style={styles.badgeText}>{typeName.toUpperCase()}</Text>
          </View>
          <View
            style={[
              styles.riskBadge,
              { backgroundColor: riskStyle.backgroundColor },
            ]}
          >
            <Text style={[styles.riskText, { color: riskStyle.color }]}>
              {riskName.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.description}>{alert.descripcion}</Text>

      <View style={styles.alertInfo}>
        <Text style={styles.location}>📍 {alert.ubicacion}</Text>
        <Text style={styles.reportCount}>📊 {alert.reportes} reportes</Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.date}>📅 {alert.fecha_creacion}</Text>
        {alert.activa ? (
          <Text
            style={[
              styles.expiration,
              daysUntilExpiration <= 3 && styles.expirationWarning,
            ]}
          >
            ⏰ Expira en {daysUntilExpiration} días
          </Text>
        ) : (
          <Text style={styles.archivedText}>📁 ARCHIVADA</Text>
        )}
      </View>
    </View>
  );
};

export default AlertCard;

const styles = StyleSheet.create({
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
  archivedCard: {
    opacity: 0.7,
    backgroundColor: '#f8f9fa',
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
  badgeContainer: {
    alignItems: 'flex-end',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  riskText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginVertical: 8,
    color: '#555',
    lineHeight: 20,
  },
  alertInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  location: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  reportCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  expiration: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  expirationWarning: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  archivedText: {
    fontSize: 11,
    color: '#999',
    fontWeight: 'bold',
  },
});
