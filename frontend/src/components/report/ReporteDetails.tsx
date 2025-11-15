import {
  AppText,
  fontWeightBold,
  fontWeightMedium,
  fontWeightSemiBold,
} from '@/src/components/AppText';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  obtenerColorMarcador,
  obtenerNombreEspecie,
  obtenerNombreEstadoSalud,
} from '../../types/report';
// --- AÑADIMOS IMPORTS ---
import { Colors } from '@/src/constants/colors';
import { Ionicons } from '@expo/vector-icons';

// --- DEFINIMOS LAS PROPS CON TYPESCRIPT ---
interface ReporteDetailsProps {
  reporte: any; // Puedes cambiar 'any' por tu tipo 'Reporte' si lo tienes
  onClose: () => void;
  onDelete: () => void;
  distance: string | null; // <-- ¡AQUÍ ESTÁ LA NUEVA PROP!
}

export const ReporteDetails = ({
  reporte,
  onClose,
  onDelete,
  distance, // <-- Recibimos la prop
}: ReporteDetailsProps) => {
  return (
    <View style={styles.floatingDetailsContainer}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <AppText style={styles.closeButtonText}>✕</AppText>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollableContent}>
        <AppText style={styles.detailTitle}>{reporte.descripcion}</AppText>

        <View style={styles.detailCard}>
          {/* --- BLOQUE DE DISTANCIA AÑADIDO --- */}
          {distance && (
            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={16} // Ajustamos tamaño
                color={Colors.primary}
                style={styles.detailIcon}
              />
              <AppText style={styles.distanceText}>Estás a {distance}</AppText>
            </View>
          )}
          {/* ---------------------------------- */}

          <View style={styles.detailRow}>
            <AppText style={styles.detailIcon}>📍</AppText>
            <AppText style={styles.detailValue}>{reporte.direccion}</AppText>
          </View>
          <View style={styles.detailRow}>
            <AppText style={styles.detailIcon}>🐾</AppText>
            <AppText style={styles.detailValue}>
              {obtenerNombreEspecie(reporte.id_especie)}
            </AppText>
          </View>
          <View style={styles.detailRow}>
            <AppText style={styles.detailIcon}>🏥</AppText>
            <AppText
              style={[
                styles.detailValue,
                {
                  color: obtenerColorMarcador(reporte.id_estado_salud),
                  fontWeight: fontWeightMedium,
                },
              ]}
            >
              {obtenerNombreEstadoSalud(reporte.id_estado_salud)}
            </AppText>
          </View>
          <View style={styles.detailRow}>
            <AppText style={styles.detailIcon}>📅</AppText>
            <AppText style={styles.detailValue}>
              {new Date(reporte.fecha_creacion).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </AppText>
          </View>
          <View style={styles.detailRow}>
            <AppText style={styles.detailIcon}>#️⃣</AppText>
            <AppText style={styles.detailValue}>
              {reporte.id_avistamiento}
            </AppText>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <AppText style={styles.deleteButtonText}>🗑️ Eliminar Reporte</AppText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingDetailsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5, // Añadido para Android
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10, // Asegura que esté por encima
  },
  closeButtonText: { fontSize: 18, color: '#999' },
  scrollableContent: { paddingTop: 20 },
  detailTitle: {
    fontSize: 18,
    fontWeight: fontWeightSemiBold,
    marginBottom: 10,
    paddingRight: 20, // Espacio para el botón de cerrar
  },
  detailCard: { padding: 10, backgroundColor: '#f5f5f5', borderRadius: 8 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 2, // Espaciado
  },
  detailIcon: { marginRight: 8, width: 20, textAlign: 'center' }, // Ancho fijo para alinear
  detailValue: { fontSize: 14, flexShrink: 1 }, // flexShrink para que el texto no se desborde
  deleteButton: {
    backgroundColor: Colors.danger || '#f44336', // Fallback
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: fontWeightBold,
    textAlign: 'center',
  },

  // --- ESTILOS AÑADIDOS PARA LA DISTANCIA ---
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#E6F0FF', // Un fondo suave azul
    borderRadius: 8,
    padding: 10,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: fontWeightBold,
    color: Colors.primary || '#007AFF', // Fallback
    marginLeft: 4, // Pequeño ajuste
  },
});