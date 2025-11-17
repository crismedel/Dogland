import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import {
  fontWeightBold,
  fontWeightSemiBold,
  AppText,
} from '@/src/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { useNotification } from '@/src/components/notifications';

interface TarjetaMedicaProps {
  nombre?: string;
  condicion?: string; // formato antiguo
  estadoMedico?: number | string; // 1,2,3 (nuevo)
  descripcion?: string; // texto descriptivo (nuevo)
  // Props para roles
  userRole?: string | null;
  historialId?: string; // ID necesario para editar/eliminar
}

const getEstado = (valor?: number | string) => {
  const v = Number(valor);
  switch (v) {
    case 1:
      return {
        label: 'Perrito sano',
        bg: 'rgba(76, 175, 80, 0.12)',
        color: '#2e7d32',
        icon: 'heart-outline',
      };
    case 2:
      return {
        label: 'En tratamiento',
        bg: 'rgba(255, 193, 7, 0.15)',
        color: '#b28704',
        icon: 'medkit-outline',
      };
    case 3:
      return {
        label: 'Recuperado',
        bg: 'rgba(33, 150, 243, 0.15)',
        color: '#1565c0',
        icon: 'refresh-circle-outline',
      };
    default:
      return {
        label: 'Sin información médica',
        bg: 'rgba(158, 158, 158, 0.15)',
        color: '#616161',
        icon: 'help-circle-outline',
      };
  }
};

const TarjetaMedica: React.FC<TarjetaMedicaProps> = ({
  nombre,
  condicion,
  estadoMedico,
  descripcion,
  // --- 4. Destructurar nuevos props ---
  userRole,
  historialId,
}) => {
  const estado = getEstado(estadoMedico);
  const detalle = descripcion ?? condicion ?? 'No hay detalles del historial.';
  // --- 5. Lógica de roles y navegación ---
  const router = useRouter();
  const canManage = userRole === 'Admin' || userRole === 'Trabajador';
  const { showError, showSuccess, confirm } = useNotification();

  const handleEdit = () => {
    // Navega a la pantalla de edición (asegúrate que la ruta sea correcta)
    console.log(`/adoption/historial/edit/${historialId}`);
  };

  const handleDelete = () => {
    confirm({
      title: 'Confirmar Eliminación',
      message: `¿Eliminar historial de ${nombre}?`,
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      destructive: true,
      onConfirm: () => {
        console.log('Eliminar: ', historialId);

        // Puedes mostrar un toast si quieres
        showSuccess('Eliminado', 'El historial fue eliminado correctamente');
      },
      onCancel: () => {
        showError('Cancelado', 'La operación fue cancelada');
      },
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AppText style={styles.title}>{nombre ?? 'Sin nombre'}</AppText>
        <Ionicons name="paw-outline" size={20} color="#757575" />
      </View>

      <View style={[styles.badge, { backgroundColor: estado.bg }]}>
        <Ionicons name={estado.icon as any} size={16} color={estado.color} />
        <AppText style={[styles.badgeText, { color: estado.color }]}>
          {estado.label}
        </AppText>
      </View>

      <AppText style={styles.descripcion}>{detalle}</AppText>

      {canManage && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerBtn, styles.editBtn]}
            onPress={handleEdit}
          >
            <Ionicons name="pencil" size={16} color="#1976d2" />
            <AppText style={[styles.footerText, { color: '#1976d2' }]}>
              Editar
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerBtn, styles.deleteBtn]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={16} color="#d32f2f" />
            <AppText style={[styles.footerText, { color: '#d32f2f' }]}>
              Eliminar
            </AppText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: { fontSize: 17, fontWeight: fontWeightBold, color: '#2c2c2c' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginBottom: 10,
    gap: 6,
  },
  badgeText: { fontSize: 13, fontWeight: fontWeightSemiBold },
  descripcion: { fontSize: 14, color: '#4e4e4e', lineHeight: 19 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    marginTop: 14,
    paddingTop: 12,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  editBtn: { backgroundColor: 'rgba(25,118,210,0.12)' },
  deleteBtn: { backgroundColor: 'rgba(211,47,47,0.12)' },
  footerText: { fontSize: 14, fontWeight: fontWeightSemiBold },
});

export default TarjetaMedica;
