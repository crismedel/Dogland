import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  fontWeightBold,
  fontWeightSemiBold,
  AppText,
} from '@/src/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import { useNotification } from '@/src/components/notifications';

// 2. Importar el hook y el tipo de 'theme'
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

interface TarjetaMedicaProps {
  nombre?: string;
  condicion?: string; // formato antiguo
  estadoMedico?: number | string; // 1,2,3 (nuevo)
  descripcion?: string; // texto descriptivo (nuevo)
  // Props para roles
  userRole?: string | null;
  historialId?: string; // ID necesario para editar/eliminar
}

// 3. Modificar 'getEstado' para que reciba y use los colores del tema
const getEstado = (valor: number | string | undefined, colors: ColorsType) => {
  const v = Number(valor);
  switch (v) {
    case 1: // Sano
      return {
        label: 'Perrito sano',
        bg: `${colors.success}20`, // '20' es ~12% alpha en hex
        color: colors.success,
        icon: 'heart-outline',
      };
    case 2: // En tratamiento
      return {
        label: 'En tratamiento',
        bg: `${colors.warning}25`, // '25' es ~15% alpha en hex
        color: colors.secondary, // Usamos 'secondary' por ser naranja oscuro
        icon: 'medkit-outline',
      };
    case 3: // Recuperado
      return {
        label: 'Recuperado',
        bg: `${colors.info}25`,
        color: colors.info,
        icon: 'refresh-circle-outline',
      };
    default: // Sin información
      return {
        label: 'Sin información médica',
        bg: `${colors.gray}25`,
        color: colors.darkGray,
        icon: 'help-circle-outline',
      };
  }
};

const TarjetaMedica: React.FC<TarjetaMedicaProps> = ({
  nombre,
  condicion,
  estadoMedico,
  descripcion,
  userRole,
  historialId,
}) => {
  // 4. Llamar al hook y generar los estilos
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // 5. Pasar 'colors' a la función 'getEstado'
  const estado = getEstado(estadoMedico, colors);
  const detalle = descripcion ?? condicion ?? 'No hay detalles del historial.';

  const router = useRouter();
  const canManage = userRole === 'Admin' || userRole === 'Trabajador';
  const { showError, showSuccess, confirm } = useNotification();

  const handleEdit = () => {
    console.log(`/adoption/historial/edit/${historialId}`);
    // Navega a la pantalla de edición
    // router.push(`/adoption/historial/edit/${historialId}`);
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
        // Aquí iría tu lógica de API para eliminar
        // ...
        showSuccess('Eliminado', 'El historial fue eliminado correctamente');
      },
      onCancel: () => {
        // No es necesario mostrar error al cancelar
        // showError('Cancelado', 'La operación fue cancelada');
      },
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AppText style={styles.title}>{nombre ?? 'Sin nombre'}</AppText>
        {/* 6. Usar colores del hook */}
        <Ionicons name="paw-outline" size={20} color={colors.darkGray} />
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
            {/* 6. Usar colores del hook */}
            <Ionicons name="pencil" size={16} color={colors.info} />
            <AppText style={[styles.footerText, { color: colors.info }]}>
              Editar
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerBtn, styles.deleteBtn]}
            onPress={handleDelete}
          >
            {/* 6. Usar colores del hook */}
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
            <AppText style={[styles.footerText, { color: colors.danger }]}>
              Eliminar
            </AppText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// 7. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground, // Dinámico
      padding: 16,
      borderRadius: 14,
      marginBottom: 14,
      marginHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.secondary, // Dinámico
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
    title: {
      fontSize: 17,
      fontWeight: fontWeightBold,
      color: colors.text, // Dinámico
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 20,
      marginBottom: 10,
      gap: 6,
      // backgroundColor es dinámico desde 'estado.bg'
    },
    badgeText: {
      fontSize: 13,
      fontWeight: fontWeightSemiBold,
      // color es dinámico desde 'estado.color'
    },
    descripcion: {
      fontSize: 14,
      color: colors.darkGray, // Dinámico
      lineHeight: 19,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 20,
      borderTopWidth: 1,
      borderTopColor: colors.gray, // Dinámico
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
    },
    editBtn: {
      backgroundColor: `${colors.info}20`, // Dinámico
    },
    deleteBtn: {
      backgroundColor: `${colors.danger}20`, // Dinámico
    },
    footerText: {
      fontSize: 14,
      fontWeight: fontWeightSemiBold,
      // color es dinámico
    },
  });

export default TarjetaMedica;