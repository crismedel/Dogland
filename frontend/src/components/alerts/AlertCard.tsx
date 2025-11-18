import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
// 1. Importar las FUNCIONES de estilos y el TIPO
import { Alert, getAlertStyles, getRiskStyles } from '@/src/types/alert'; // Ajustado al path que refactorizamos
import { deleteAlert } from '../../api/alerts';
import { useNotification } from '@/src/components/notifications';
import { useRefresh } from '@/src/contexts/RefreshContext';
import { REFRESH_KEYS } from '@/src/constants/refreshKeys';
import { Ionicons } from '@expo/vector-icons';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

interface AlertCardProps {
  alert: Alert;
  onDeleteSuccess?: (id: number) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onDeleteSuccess }) => {
  // 3. Llamar al hook y generar TODOS los estilos
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // 4. Generar los estilos de alerta y riesgo dinámicamente
  const alertStyles = getAlertStyles(colors);
  const riskStyles = getRiskStyles(colors);

  const { card, badge } = alertStyles[alert.tipo];
  const riskStyle = riskStyles[alert.nivel_riesgo];

  const router = useRouter();
  const { confirm, showSuccess, showError } = useNotification();
  const { triggerRefresh } = useRefresh();

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
              {/* 5. Usar colores del tema */}
              <Ionicons name="create-outline" size={18} color={colors.info} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.actionIcon}
          >
            {/* 5. Usar colores del tema */}
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
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
          {/* 5. Usar colores del tema */}
          <Ionicons name="location-outline" size={14} color={colors.darkGray} />
          <AppText numberOfLines={1} style={styles.metaText}>
            {alert.direccion || 'Sin dirección'}
          </AppText>
        </View>

        <View style={styles.metaItem}>
          {/* 5. Usar colores del tema */}
          <Ionicons
            name="stats-chart-outline"
            size={14}
            color={colors.darkGray}
          />
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
          {/* 5. Usar colores del tema */}
          <Ionicons name="calendar-outline" size={14} color={colors.darkGray} />
          <AppText style={styles.footerText}>
            {new Date(alert.fecha_creacion).toLocaleDateString()}
          </AppText>
        </View>

        {alert.activa && daysUntilExpiration !== null ? (
          <View style={styles.expireChip}>
            <Ionicons
              name="time-outline"
              size={12}
              color={colors.danger} // 5. Usar colores del tema
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
              color={colors.darkGray} // 5. Usar colores del tema
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

// 6. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground, // Dinámico
      padding: 10,
      marginBottom: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.secondary, // Dinámico
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
      borderLeftWidth: 5,
    },
    archivedCard: {
      opacity: 0.8,
      backgroundColor: colors.backgroundSecon, // Dinámico
    },

    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    title: {
      flex: 1,
      fontSize: 16,
      color: colors.text, // Dinámico
      fontWeight: fontWeightSemiBold,
    },
    actionsPill: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundSecon, // Dinámico
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
      color: colors.lightText, // Dinámico
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
      borderWidth: 1,
      // backgroundColor y borderColor son dinámicos desde riskStyle
    },
    riskPillText: {
      fontSize: 11,
      fontWeight: fontWeightBold,
      textTransform: 'uppercase',
      // color es dinámico desde riskStyle
    },

    description: {
      fontSize: 13,
      color: colors.darkGray, // Dinámico
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
      color: colors.darkGray, // Dinámico
    },

    divider: {
      height: 1,
      backgroundColor: colors.gray, // Dinámico
      marginVertical: 4,
    },

    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    footerText: {
      fontSize: 12,
      color: colors.darkGray, // Dinámico
    },
    expireChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${colors.danger}15`, // Dinámico (light red)
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    expireText: {
      fontSize: 12,
      color: colors.danger, // Dinámico
      fontWeight: fontWeightMedium,
    },
    expireTextWarning: {
      color: colors.danger, // Dinámico
      fontWeight: fontWeightBold,
    },
    archivedChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundSecon, // Dinámico
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    archivedText: {
      fontSize: 12,
      color: colors.darkGray, // Dinámico
      fontWeight: fontWeightMedium,
    },
  });
