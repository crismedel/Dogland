// src/components/ReporteDetails.tsx
import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import {
  obtenerColorMarcador,
  obtenerNombreEspecie,
  obtenerNombreEstadoSalud,
} from '../../types/report';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

export const ReporteDetails = ({ reporte, onClose, onDelete }: any) => {
  return (
    <View style={styles.floatingDetailsContainer}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <AppText style={styles.closeButtonText}>✕</AppText>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollableContent}>
        <AppText style={styles.detailTitle}>{reporte.descripcion}</AppText>

        <View style={styles.detailCard}>
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
  },
  closeButton: { position: 'absolute', top: 10, right: 10 },
  closeButtonText: { fontSize: 18 },
  scrollableContent: { paddingTop: 20 },
  detailTitle: {
    fontSize: 18,
    fontWeight: fontWeightSemiBold,
    marginBottom: 10,
  },
  detailCard: { padding: 10, backgroundColor: '#f5f5f5', borderRadius: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailIcon: { marginRight: 8 },
  detailValue: { fontSize: 14 },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: fontWeightBold,
    textAlign: 'center',
  },
});
