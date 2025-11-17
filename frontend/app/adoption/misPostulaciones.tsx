import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  fontWeightBold,
  fontWeightSemiBold,
  AppText,
} from '@/src/components/AppText';

import CustomHeader from '@/src/components/UI/CustomHeader';
import { Colors } from '@/src/constants/colors';
import { useNotification } from '@/src/components/notifications';
import Spinner from '@/src/components/UI/Spinner';

// 🟦 Mock con los 4 estados
const mockPostulaciones = [
  { id: '1', animal: 'Luna', estado: 'pendiente', fecha: '2025-09-20' },
  { id: '2', animal: 'Thor', estado: 'aprobada', fecha: '2025-09-18' },
  { id: '3', animal: 'Milo', estado: 'rechazada', fecha: '2025-09-15' },
  { id: '4', animal: 'Nala', estado: 'cancelada', fecha: '2025-09-10' },
];

const MisPostulaciones = () => {
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

  if (loading) {
    return <Spinner />;
  }

  // Badge dinámico estados: pendiente, aprobada, rechazada, cancelada
  const getEstadoBadge = (estado: string) => {
    const e = estado.toLowerCase();

    const estilos: any = {
      pendiente: {
        bg: 'rgba(255,193,7,0.18)',
        color: '#b28704',
        icon: 'time-outline',
        label: 'Pendiente',
      },
      aprobada: {
        bg: 'rgba(76,175,80,0.18)',
        color: '#2e7d32',
        icon: 'checkmark-circle-outline',
        label: 'Aprobada',
      },
      rechazada: {
        bg: 'rgba(244,67,54,0.18)',
        color: '#d32f2f',
        icon: 'close-circle-outline',
        label: 'Rechazada',
      },
      cancelada: {
        bg: 'rgba(97,97,97,0.18)',
        color: '#616161',
        icon: 'ban-outline',
        label: 'Cancelada',
      },
    };

    return estilos[e] ?? estilos.pendiente;
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title={`Mis Postulaciones (${postulaciones.length})`}
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
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
                    color="#d32f2f"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Tarjeta
  card: {
    backgroundColor: Colors.cardBackground,
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: fontWeightBold,
    color: '#2c2c2c',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardFecha: {
    marginTop: 6,
    fontSize: 14,
    color: '#555',
  },

  // Badge de estado
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  estadoText: {
    fontSize: 13,
    fontWeight: fontWeightSemiBold,
  },

  // Cancelar
  cancelBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(211,47,47,0.12)',
    borderRadius: 20,
  },
  cancelText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: fontWeightSemiBold,
  },
});
