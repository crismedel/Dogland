import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Alert, alertStyles, riskStyles } from '../../types/alert';
import { deleteAlert } from '../../api/alerts';
import { useNotification } from '@/src/components/notifications';
import { useRefresh } from '@/src/contexts/RefreshContext';
import { REFRESH_KEYS } from '@/src/constants/refreshKeys';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

interface AlertCardProps {
  alert: Alert;
  onDeleteSuccess?: (id: number) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onDeleteSuccess }) => {
  const router = useRouter();
  const { confirm, showSuccess, showError } = useNotification();
  const { triggerRefresh } = useRefresh();
  const { card, badge } = alertStyles[alert.tipo];
  const riskStyle = riskStyles[alert.nivel_riesgo];

  const daysUntilExpiration = alert.fecha_expiracion
    ? Math.ceil(
        (new Date(alert.fecha_expiracion).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  const handlePressAlert = () =>
    router.push({
      pathname: '/alerts/detail-alert',
      params: { id: String(alert.id_alerta) },
    });

  const handleEdit = () =>
    router.push({
      pathname: '/alerts/edit-alert',
      params: { id: String(alert.id_alerta) },
    });

  const handleDelete = () => {
    confirm({
      title: 'Confirmar eliminación',
      message: '¿Estás seguro de eliminar esta alerta?',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      destructive: true,
      onConfirm: async () => {
        try {
          await deleteAlert(alert.id_alerta);
          showSuccess('Éxito', 'Alerta eliminada correctamente');
          triggerRefresh(REFRESH_KEYS.ALERTS);
          onDeleteSuccess?.(alert.id_alerta);
        } catch (e: any) {
          const message =
            e?.response?.data?.error ||
            e?.message ||
            'No se pudo eliminar la alerta';
          showError('Error', message);
        }
      },
    });
  };

  return (
    <TouchableOpacity
      onPress={handlePressAlert}
      activeOpacity={0.9}
      style={[styles.card, card, !alert.activa && styles.archivedCard]}
    >
      {/* Top row: title + actions */}
      <View style={styles.headerRow}>
        <AppText numberOfLines={1} style={styles.title}>
          {alert.titulo}
        </AppText>

        <View style={styles.actionsPill}>
          {alert.activa && (
            <TouchableOpacity
              onPress={handleEdit}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.actionIcon}
            >
              <Ionicons name="create-outline" size={18} color="#1D4ED8" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.actionIcon}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Badges */}
      <View style={styles.badgesRow}>
        <View style={[styles.typePill, badge]}>
          <AppText style={styles.typePillText}>
            {alert.tipo.toUpperCase()}
          </AppText>
        </View>

        <View
          style={[
            styles.riskPill,
            {
              backgroundColor: riskStyle.backgroundColor,
              borderColor: riskStyle.color,
            },
          ]}
        >
          <Ionicons
            name="warning-outline"
            size={12}
            color={riskStyle.color}
            style={{ marginRight: 6 }}
          />
          <AppText style={[styles.riskPillText, { color: riskStyle.color }]}>
            {alert.nivel_riesgo}
          </AppText>
        </View>
      </View>

      {/* Description */}
      {!!alert.descripcion && (
        <AppText numberOfLines={2} style={styles.description}>
          {alert.descripcion}
        </AppText>
      )}

      {/* Meta info */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <AppText numberOfLines={1} style={styles.metaText}>
            {alert.direccion || 'Sin dirección'}
          </AppText>
        </View>

        <View style={styles.metaItem}>
          <Ionicons name="stats-chart-outline" size={14} color="#6B7280" />
          <AppText style={styles.metaText}>
            {alert.reportes || 0} reportes
          </AppText>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Footer */}
      <View style={styles.footerRow}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <AppText style={styles.footerText}>
            {new Date(alert.fecha_creacion).toLocaleDateString()}
          </AppText>
        </View>

        {alert.activa && daysUntilExpiration !== null ? (
          <View style={styles.expireChip}>
            <Ionicons
              name="time-outline"
              size={12}
              color={daysUntilExpiration <= 3 ? '#DC2626' : '#EF4444'}
              style={{ marginRight: 6 }}
            />
            <AppText
              style={[
                styles.expireText,
                daysUntilExpiration <= 3 && styles.expireTextWarning,
              ]}
            >
              Expira en {daysUntilExpiration} días
            </AppText>
          </View>
        ) : (
          <View style={styles.archivedChip}>
            <Ionicons
              name="archive-outline"
              size={12}
              color="#6B7280"
              style={{ marginRight: 6 }}
            />
            <AppText style={styles.archivedText}>Archivada</AppText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default AlertCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    padding: 14,
    marginBottom: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.secondary,
    // Sombra sutil
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    // Línea de acento a la izquierda (color lo trae alertStyles[alert.tipo].card)
    borderLeftWidth: 5,
  },
  archivedCard: {
    opacity: 0.8,
    backgroundColor: '#FAFAFA',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: fontWeightSemiBold,
  },
  actionsPill: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginLeft: 8,
  },
  actionIcon: {
    paddingHorizontal: 6,
  },

  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'center',
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  typePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: fontWeightBold,
    letterSpacing: 0.4,
  },
  riskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
  },
  riskPillText: {
    fontSize: 11,
    fontWeight: fontWeightBold,
    textTransform: 'uppercase',
  },

  description: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 10,
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  metaText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
  },

  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
  expireChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  expireText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: fontWeightMedium,
  },
  expireTextWarning: {
    color: '#DC2626',
    fontWeight: fontWeightBold,
  },
  archivedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  archivedText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: fontWeightMedium,
  },
});
