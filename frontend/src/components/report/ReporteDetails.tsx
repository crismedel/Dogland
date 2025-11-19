import {
  AppText,
  fontWeightBold,
  fontWeightMedium
} from '@/src/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  obtenerColorMarcador,
  obtenerNombreEspecie,
  obtenerNombreEstadoSalud,
} from '../../types/report';

// 2. Importar el hook y los tipos de tema
import { ColorsType } from '@/src/constants/colors';
import { useTheme } from '@/src/contexts/ThemeContext';

// --- DEFINIMOS LAS PROPS ---
interface ReporteDetailsProps {
  reporte: any; 
  onClose: () => void;
  onDelete: () => void;
  distance: string | null;
  onCloseSighting: () => void;
  canModify: boolean;
}

export const ReporteDetails = ({
  reporte,
  onClose,
  onDelete,
  distance,
  onCloseSighting,
  canModify,
}: ReporteDetailsProps) => {
  const isClosed = reporte.id_estado_avistamiento !== 1;

  // 1. Extraer la imagen (Base64)
  const primaryImage =
    reporte.fotos_url && reporte.fotos_url.length > 0
      ? reporte.fotos_url[0]
      : null;

  // 3. Llamar al hook de temas
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <View style={styles.floatingDetailsContainer}>
      {/* Botón Cerrar (X) */}
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <View style={styles.closeButtonBg}>
           <AppText style={styles.closeButtonText}>✕</AppText>
        </View>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollableContent} showsVerticalScrollIndicator={false}>
        
        {/* --- 2. SECCIÓN DE IMAGEN --- */}
        <View style={styles.imageContainer}>
          {primaryImage ? (
            <Image 
              source={{ uri: primaryImage }} 
              style={styles.sightingImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={40} color={colors.gray} />
              <AppText style={styles.placeholderText}>Sin foto</AppText>
            </View>
          )}
          
          {/* Badge de estado sobre la imagen */}
          <View style={[styles.statusBadgeOverlay, isClosed ? {backgroundColor: colors.gray} : {backgroundColor: colors.success}]}>
             <AppText style={styles.statusTextOverlay}>
                {isClosed ? "Cerrado" : "Activo"}
             </AppText>
          </View>
        </View>
        {/* --------------------------- */}

        <AppText style={styles.detailTitle}>{reporte.titulo || "Reporte"}</AppText>
        <AppText style={styles.detailDescription}>{reporte.descripcion}</AppText>

        <View style={styles.detailCard}>
          {/* Distancia */}
          {distance && (
            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={colors.primary}
                style={styles.detailIcon}
              />
              <AppText style={styles.distanceText}>Estás a {distance}</AppText>
            </View>
          )}

          {/* Motivo de Cierre (si existe) */}
          {isClosed && reporte.motivo_cierre && (
             <View style={[styles.infoRow, { backgroundColor: isDark ? '#444' : '#F5F5F5' }]}>
               <Ionicons name="information-circle-outline" size={16} color={colors.darkGray} style={styles.detailIcon} />
               <AppText style={[styles.detailValue, { fontStyle: 'italic', color: colors.darkGray }]}>
                 Motivo: {reporte.motivo_cierre}
               </AppText>
             </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons
              name="location-sharp"
              size={16}
              color={colors.secondary}
              style={styles.detailIcon}
            />
            <AppText style={[styles.detailValue, { color: colors.text }]}>
              {reporte.direccion || "Ubicación en mapa"}
            </AppText>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="paw-outline"
              size={16}
              color={colors.secondary}
              style={styles.detailIcon}
            />
            <AppText style={[styles.detailValue, { color: colors.text }]}>
              {obtenerNombreEspecie(reporte.id_especie)}
            </AppText>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="medkit-outline"
              size={16}
              color={colors.secondary}
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
              color={colors.secondary}
              style={styles.detailIcon}
            />
            <AppText style={[styles.detailValue, { color: colors.text }]}>
              {new Date(reporte.fecha_creacion).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </AppText>
          </View>
        </View>
      </ScrollView>

      {/* --- BOTONES DE ACCIÓN --- */}
      {canModify && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={onDelete}
            style={[styles.actionButton, styles.deleteButton]}
          >
            <Ionicons name="trash-outline" size={16} color={colors.lightText} />
            <AppText style={styles.actionButtonText}>Eliminar</AppText>
          </TouchableOpacity>

          {!isClosed && (
            <TouchableOpacity
              onPress={onCloseSighting}
              style={[styles.actionButton, styles.closeReportButton]}
            >
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.lightText} />
              <AppText style={styles.actionButtonText}>Cerrar</AppText>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const getStyles = (colors: ColorsType, isDark: boolean) => StyleSheet.create({
  floatingDetailsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '75%', 
    overflow: 'hidden', 
  },
  scrollableContent: { 
    paddingBottom: 20 
  },
  
  // --- ESTILOS IMAGEN ---
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: isDark ? '#333' : '#f0f0f0',
    position: 'relative',
  },
  sightingImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? '#333' : '#E1E1E1',
  },
  placeholderText: {
    color: colors.gray,
    marginTop: 5,
    fontSize: 12,
  },
  statusBadgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    opacity: 0.9,
  },
  statusTextOverlay: {
    color: colors.lightText,
    fontSize: 12,
    fontWeight: fontWeightBold,
  },

  // --- BOTÓN CERRAR MODAL (X) ---
  closeButton: {
    position: 'absolute', 
    top: 10, 
    right: 10,
    zIndex: 10,
  },
  closeButtonBg: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: { 
    fontSize: 14, 
    color: 'white', 
    fontWeight: 'bold' 
  },

  // --- CONTENIDO ---
  detailTitle: {
    fontSize: 20,
    fontWeight: fontWeightBold,
    marginTop: 15,
    marginBottom: 5,
    paddingHorizontal: 16,
    color: colors.text,
  },
  detailDescription: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 15,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  detailCard: { 
    backgroundColor: colors.backgroundSecon, 
    borderRadius: 12, 
    marginHorizontal: 16,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: { marginRight: 8, width: 20, textAlign: 'center' },
  detailValue: { fontSize: 14, flexShrink: 1, color: colors.text },

  // --- BOTONES ACCIÓN ---
  buttonContainer: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 0,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
  },
  actionButtonText: {
    color: colors.lightText,
    fontWeight: fontWeightBold,
    textAlign: 'center',
    marginLeft: 8,
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  closeReportButton: {
    backgroundColor: colors.success,
  },

  // --- DISTANCIA ---
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: `${colors.info}20`,
    borderRadius: 8,
    padding: 10,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: fontWeightBold,
    color: colors.primary,
    marginLeft: 4,
  },
});