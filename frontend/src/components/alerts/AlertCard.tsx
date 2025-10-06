import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert as RNAlert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Alert, alertStyles, riskStyles } from '../../types/alert';
import { deleteAlert } from '../../api/alerts';
import { useNotification } from '@/src/components/notifications/NotificationContext';
import { Ionicons } from '@expo/vector-icons';

interface AlertCardProps {
  alert: Alert;
  onDeleteSuccess?: (id: number) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onDeleteSuccess }) => {
  const router = useRouter();
  const { confirm, showSuccess, showError } = useNotification();
  const { card, badge } = alertStyles[alert.tipo];
  const riskStyle = riskStyles[alert.nivel_riesgo];

  const daysUntilExpiration = alert.fecha_expiracion
    ? Math.ceil(
        (new Date(alert.fecha_expiracion).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  const handlePressAlert = (alertId: number) => {
    router.push({
      pathname: '/alerts/detail-alert',
      params: { id: alertId.toString() },
    });
  };

  const handleEdit = () => {
    router.push({
      pathname: '/alerts/edit-alert',
      params: { id: alert.id_alerta.toString() },
    });
  };

  const handleDelete = () => {
    confirm({
      title: 'Confirmar eliminación',
      message: '¿Estás seguro de eliminar esta alerta?',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      destructive: true,
      onConfirm: async () => {
        try {
          console.log('Eliminando alerta ID:', alert.id_alerta);
          await deleteAlert(alert.id_alerta);
          showSuccess('Éxito', 'Alerta eliminada correctamente');
          if (onDeleteSuccess) onDeleteSuccess(alert.id_alerta);
        } catch (e: any) {
          console.error('Error al eliminar alerta:', e);
          const message =
            e?.response?.data?.error ||
            e?.message ||
            e?.error ||
            'No se pudo eliminar la alerta';
          showError('Error', message);
        }
      },
    });
  };

  return (
    <TouchableOpacity
      onPress={() => handlePressAlert(alert.id_alerta)}
      style={[styles.card, card, !alert.activa && styles.archivedCard]}
      activeOpacity={0.8}
    >
      {/* Header con título y acciones */}
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{alert.titulo}</Text>
        <View style={styles.actions}>
          {alert.activa && (
            <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
              <Ionicons name="create-outline" size={20} color="#007bff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Ionicons name="trash-outline" size={20} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Badges de tipo y riesgo */}
      <View style={styles.badgeContainer}>
        <View style={[styles.typeBadge, badge]}>
          <Text style={styles.badgeText}>{alert.tipo.toUpperCase()}</Text>
        </View>
        <View
          style={[
            styles.riskBadge,
            { backgroundColor: riskStyle.backgroundColor },
          ]}
        >
          <Text style={[styles.riskText, { color: riskStyle.color }]}>
            {alert.nivel_riesgo.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Descripción */}
      <Text style={styles.description}>{alert.descripcion}</Text>

      {/* Info */}
      <View style={styles.alertInfo}>
        <Text style={styles.location}>
          📍 {alert.direccion || 'No disponible'}
        </Text>
        <Text style={styles.reportCount}>📊 {alert.reportes} reportes</Text>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.date}>
          📅 {new Date(alert.fecha_creacion).toLocaleDateString()}
        </Text>
        {alert.activa && daysUntilExpiration !== null ? (
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
    </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    flex: 1,
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
