// app/adoption/component/tarjetasMedicas.tsx
import React from 'react';
// --- 1. Importaciones añadidas ---
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';
// --- 2. Importaciones para iconos y navegación ---
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// --- 3. Interfaz de props actualizada ---
interface TarjetaMedicaProps {
  nombre?: string;
  condicion?: string; // formato antiguo
  estadoMedico?: number | string; // 1,2,3 (nuevo)
  descripcion?: string; // texto descriptivo (nuevo)
  // Props para roles
  userRole?: string | null;
  historialId?: string; // ID necesario para editar/eliminar
}

const getEstadoTexto = (valor?: number | string) => {
  const v = Number(valor);
  switch (v) {
    case 1:
      return { texto: 'Perrito sano', color: '#4CAF50' };
    case 2:
      return { texto: 'En tratamiento', color: '#FFC107' };
    case 3:
      return { texto: 'Recuperado de enfermedad', color: '#2196F3' };
    default:
      return { texto: 'Sin información médica', color: '#9E9E9E' };
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
  const estado = getEstadoTexto(estadoMedico);
  const detalle = descripcion ?? condicion ?? 'No hay detalles del historial.';

  // --- 5. Lógica de roles y navegación ---
  const router = useRouter();
  const canManage = userRole === 'Admin' || userRole === 'Trabajador';

  const handleEdit = () => {
    // Navega a la pantalla de edición (asegúrate que la ruta sea correcta)
    console.log(`/adoption/historial/edit/${historialId}`);
  };

  const handleDelete = () => {
    // Muestra una alerta nativa para confirmar
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que quieres eliminar el historial de ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            // Aquí iría tu lógica para llamar a la API y eliminar
            console.log(`Eliminar historial con ID: ${historialId}`);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.card}>
      {/* Contenido existente de la tarjeta */}
      {nombre ? <AppText style={styles.title}>{nombre}</AppText> : null}
      <AppText style={[styles.estado, { color: estado.color }]}>
        {estado.texto}
      </AppText>
      <AppText style={styles.descripcion}>{detalle}</AppText>

      {/* --- 6. Botones condicionales para Admin/Trabajador --- */}
      {canManage && (
        <View style={styles.adminContainer}>
          <TouchableOpacity onPress={handleEdit} style={styles.adminButton}>
            <Ionicons name="pencil-outline" size={18} color="#1976d2" />
            <AppText style={styles.adminButtonText}>Editar</AppText>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDelete} style={styles.adminButton}>
            <Ionicons name="trash-outline" size={18} color="#d32f2f" />
            <AppText style={[styles.adminButtonText, styles.deleteButtonText]}>
              Eliminar
            </AppText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// --- 7. Estilos actualizados ---
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    marginHorizontal: 16,
    width: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: fontWeightBold,
    color: '#333',
    marginBottom: 6,
  },
  estado: {
    fontSize: 14,
    fontWeight: fontWeightSemiBold,
    marginBottom: 6,
  },
  descripcion: { fontSize: 13, color: '#555' },

  // --- Nuevos estilos para los botones ---
  adminContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20, // Espacio entre botones
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0', // Separador ligero
    marginTop: 12,
    paddingTop: 12,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // Espacio entre icono y texto
  },
  adminButtonText: {
    fontSize: 14,
    color: '#1976d2', // Azul para editar
    fontWeight: fontWeightSemiBold,
  },
  deleteButtonText: {
    color: '#d32f2f', // Rojo para eliminar
  },
});

export default TarjetaMedica;