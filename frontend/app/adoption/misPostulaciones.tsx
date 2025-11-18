import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView, // Importar ScrollView (aunque no se usa, estaba en el original)
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl, // Importar RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import CustomHeader from '@/src/components/UI/CustomHeader';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import { useNotification } from '@/src/components/notifications';
import {
  AppText,
  fontWeightBold,
  fontWeightMedium, // Importar fontWeightMedium
  fontWeightSemiBold,
} from '@/src/components/AppText';
import Spinner from '@/src/components/UI/Spinner';
import { Ionicons } from '@expo/vector-icons';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

// 🟦 Mock con los 4 estados
const mockPostulaciones = [
  { id: '1', animal: 'Luna', estado: 'pendiente', fecha: '2025-09-20' },
  { id: '2', animal: 'Thor', estado: 'aprobada', fecha: '2025-09-18' },
  { id: '3', animal: 'Milo', estado: 'rechazada', fecha: '2025-09-15' },
  { id: '4', animal: 'Nala', estado: 'cancelada', fecha: '2025-09-10' },
];

const MisPostulaciones = () => {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [postulaciones, setPostulaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { confirm, showSuccess } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Aquí luego reemplazar por fetch("http://localhost:3001/api/adoption-requests?userId=XX")
        setPostulaciones(mockPostulaciones);
      } catch (error) {
        console.error('Error cargando postulaciones:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔹 Cancelar postulación
  const handleCancelar = (id: string) => {
    confirm({
      title: 'Cancelar solicitud',
      message: '¿Estás seguro de que deseas cancelar esta solicitud?',
      confirmLabel: 'Sí, cancelar',
      cancelLabel: 'No',
      destructive: true,
      onConfirm: () => {
        // Llamada real (cuando tengas el backend listo):
        // await fetch(`http://localhost:3001/api/adoption-requests/${id}`, { method: 'DELETE' });

        // Simulación en mock: quitar de la lista
        setPostulaciones((prev) =>
          prev.map((p) => (p.id === id ? { ...p, estado: 'cancelada' } : p)),
        );

        showSuccess(
          'Solicitud cancelada',
          'La postulación fue cancelada correctamente.',
        );
      },
    });
  };

  // 4. Mover la función aquí para que acceda a 'colors'
  const getEstadoBadge = (estado: string) => {
    const e = estado.toLowerCase();

    const estilos: any = {
      pendiente: {
        bg: `${colors.warning}30`, // Dinámico
        color: colors.secondary, // Dinámico
        icon: 'time-outline',
        label: 'Pendiente',
      },
      aprobada: {
        bg: `${colors.success}30`, // Dinámico
        color: colors.success, // Dinámico
        icon: 'checkmark-circle-outline',
        label: 'Aprobada',
      },
      rechazada: {
        bg: `${colors.danger}30`, // Dinámico
        color: colors.danger, // Dinámico
        icon: 'close-circle-outline',
        label: 'Rechazada',
      },
      cancelada: {
        bg: `${colors.gray}30`, // Dinámico
        color: colors.darkGray, // Dinámico
        icon: 'ban-outline',
        label: 'Cancelada',
      },
    };

    return estilos[e] ?? estilos.pendiente;
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <View style={styles.container}>
      <CustomHeader
        title={`Mis Postulaciones (${postulaciones.length})`}
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            {/* 5. Usar colores del tema */}
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? colors.lightText : colors.text}
            />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={postulaciones}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const estado = getEstadoBadge(item.estado);

          return (
            <View style={styles.card}>
              {/* Nombre + Estado Badge */}
              <View style={styles.rowBetween}>
                <AppText style={styles.cardTitle}>{item.animal}</AppText>

                <View
                  style={[styles.estadoBadge, { backgroundColor: estado.bg }]}
                >
                  <Ionicons name={estado.icon} size={16} color={estado.color} />
                  <AppText style={[styles.estadoText, { color: estado.color }]}>
                    {estado.label}
                  </AppText>
                </View>
              </View>

              {/* Fecha */}
              <AppText style={styles.cardFecha}>📅 {item.fecha}</AppText>

              {/* Botón Cancelar → solo si está pendiente */}
              {item.estado.toLowerCase() === 'pendiente' && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => handleCancelar(item.id)}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={18}
                    color={colors.danger} // 5. Usar colores del tema
                  />
                  <AppText style={styles.cancelText}>Cancelar</AppText>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

export default MisPostulaciones;

// 6. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background, // Dinámico
    },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Tarjeta
    card: {
      backgroundColor: colors.cardBackground, // Dinámico
      padding: 18,
      borderRadius: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.secondary, // Dinámico
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.1, // Dinámico
      shadowRadius: 4,
      elevation: 3,
    },

    cardTitle: {
      fontSize: 17,
      fontWeight: fontWeightBold,
      color: colors.text, // Dinámico
    },

    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    cardFecha: {
      marginTop: 6,
      fontSize: 14,
      color: colors.darkGray, // Dinámico
    },

    // Badge de estado
    estadoBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      gap: 6,
      // backgroundColor es dinámico
    },
    estadoText: {
      fontSize: 13,
      fontWeight: fontWeightSemiBold,
      // color es dinámico
    },

    // Cancelar
    cancelBtn: {
      marginTop: 14,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 14,
      backgroundColor: `${colors.danger}20`, // Dinámico
      borderRadius: 20,
    },
    cancelText: {
      color: colors.danger, // Dinámico
      fontSize: 14,
      fontWeight: fontWeightSemiBold,
    },
  });