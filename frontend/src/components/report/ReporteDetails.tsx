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
  distance: string | null;
  onCloseSighting: () => void; // <-- Prop para abrir el modal de cierre
  canModify: boolean; // <-- Prop de permisos
}

export const ReporteDetails = ({
  reporte,
  onClose,
  onDelete,
  distance,
  onCloseSighting, // <-- Recibimos la prop
  canModify, // <-- Recibimos la prop
}: ReporteDetailsProps) => {
  // Un reporte se considera 'cerrado' si su estado no es 'Activo' (ID 1)
  const isClosed = reporte.id_estado_avistamiento !== 1;

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
                color={Colors.secondary}
                style={styles.detailIcon}
              />
              <AppText style={styles.distanceText}>Estás a {distance}</AppText>
            </View>
          )}
          {/* ---------------------------------- */}

          <View style={styles.detailRow}>
            <Ionicons
              name="location-sharp"
              size={16}
              color={Colors.secondary}
              style={styles.detailIcon}
            />
            <AppText style={[styles.detailValue, { color: Colors.text }]}>
              {reporte.direccion}
            </AppText>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="paw-outline"
              size={16}
              color={Colors.secondary}
              style={styles.detailIcon}
            />
            <AppText style={[styles.detailValue, { color: Colors.text }]}>
              {obtenerNombreEspecie(reporte.id_especie)}
            </AppText>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="medkit-outline"
              size={16}
              color={Colors.secondary}
              style={styles.detailIcon}
            />
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
            <Ionicons
              name="calendar-outline"
              size={16}
              color={Colors.secondary}
              style={styles.detailIcon}
            />
            <AppText style={[styles.detailValue, { color: Colors.text }]}>
              {new Date(reporte.fecha_creacion).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </AppText>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="pricetag-outline"
              size={16}
              color={Colors.secondary}
              style={styles.detailIcon}
            />
            <AppText style={[styles.detailValue, { color: Colors.text }]}>
              reporte numero {reporte.id_avistamiento}
            </AppText>
          </View>
        </View>
      </ScrollView>

      {/* --- BOTONES CONDICIONALES POR PERMISO --- */}
      {canModify && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={onDelete}
            style={[styles.actionButton, styles.deleteButton]}
          >
            <Ionicons name="trash-outline" size={16} color={Colors.lightText} />
            <AppText style={styles.actionButtonText}>Eliminar</AppText>
          </TouchableOpacity>

          {/* El botón de CERRAR solo aparece si el reporte está ACTIVO */}
          {!isClosed && (
            <TouchableOpacity
              onPress={onCloseSighting}
              style={[styles.actionButton, styles.closeReportButton]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color={Colors.lightText}
              />
              <AppText style={styles.actionButtonText}>Cerrar Reporte</AppText>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  floatingDetailsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: Colors.background,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.secondary,
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
  closeButtonText: { fontSize: 18, color: Colors.darkGray },
  scrollableContent: { paddingTop: 20 },
  detailTitle: {
    fontSize: 18,
    fontWeight: fontWeightSemiBold,
    marginBottom: 10,
    paddingRight: 20, // Espacio para el botón de cerrar
    color: Colors.text,
  },
  detailCard: {
    padding: 10,
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 2, // Espaciado
  },
  detailIcon: { marginRight: 8, width: 20, textAlign: 'center' },
  detailValue: { fontSize: 14, flexShrink: 1 }, // flexShrink para que el texto no se desborde

  // --- ESTILOS MODIFICADOS/NUEVOS PARA BOTONES ---
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10, // Espacio entre botones
  },
  actionButton: {
    flex: 1, // Para que ocupen el espacio
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: Colors.lightText,
    fontWeight: fontWeightBold,
    textAlign: 'center',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: Colors.danger,
  },
  closeReportButton: {
    backgroundColor: Colors.success,
  },

  // --- ESTILOS AÑADIDOS PARA LA DISTANCIA ---
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: fontWeightBold,
    color: Colors.secondary,
    marginLeft: 4, // Pequeño ajuste
  },
});
