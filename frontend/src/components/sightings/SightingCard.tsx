import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Sighting } from '../../types/sighting';
import { Ionicons } from '@expo/vector-icons';
// 1. Quitar la importación estática
// import { Colors } from '../../constants/colors';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

interface SightingCardProps {
  sighting: Sighting;
  onDeleteSuccess?: (id: number) => void;
}

const SightingCard: React.FC<SightingCardProps> = ({
  sighting,
  onDeleteSuccess,
}) => {
  // 3. Llamar al hook y generar los estilos
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const router = useRouter();

  const riskLabel = 'Desconocido'; // Lógica de riesgo si la tienes

  const handlePressSighting = (sightingId: number) => {
    router.push({
      pathname: '/sightings/[id]',
      params: { id: sightingId.toString() },
    });
  };

  const handleDelete = () => {
    console.log('Eliminando avistamiento ID:', sighting.id_avistamiento);
    // Aquí iría la lógica de confirmación y API
    if (onDeleteSuccess) onDeleteSuccess(sighting.id_avistamiento);
  };

  const renderImage = () => {
    if (sighting.fotos_url && sighting.fotos_url.length > 0) {
      const imageUrl = sighting.fotos_url[0];
      // Lógica para mostrar la imagen (no implementada en el original)
      return (
        <View style={styles.imageContainer}>
          <AppText style={styles.imageText}>Imagen cargada</AppText>
        </View>
      );
    } else {
      return (
        <View style={styles.imageContainer}>
          <AppText style={styles.noImageText}>Sin imagen disponible</AppText>
        </View>
      );
    }
  };

  return (
    <TouchableOpacity
      onPress={() => handlePressSighting(sighting.id_avistamiento)}
      style={[styles.card, !sighting.activa && styles.archivedCard]}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <AppText style={styles.title}>{sighting.descripcion}</AppText>
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            {/* 4. Usar colores del tema */}
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.badgeContainer}>
        <AppText style={styles.riskText}>{riskLabel}</AppText>
      </View>

      <AppText style={styles.description}>{sighting.descripcion}</AppText>

      <View style={styles.alertInfo}>
        <AppText style={styles.date}>
          📅 {new Date(sighting.fecha_creacion).toLocaleDateString()}
        </AppText>

        {renderImage()}
      </View>
    </TouchableOpacity>
  );
};

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground, // Dinámico
      padding: 15,
      marginBottom: 12,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      borderLeftWidth: 5,
      borderLeftColor: colors.primary, // Dinámico
    },
    archivedCard: {
      opacity: 0.7,
      backgroundColor: colors.backgroundSecon, // Dinámico
      borderLeftColor: colors.gray, // Dinámico
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    title: {
      fontSize: 18,
      fontWeight: fontWeightMedium,
      color: colors.text, // Dinámico
      flex: 1,
      marginRight: 8,
    },
    actions: {
      flexDirection: 'row',
    },
    iconButton: {
      marginLeft: 8,
    },
    badgeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    riskText: {
      fontSize: 14,
      color: colors.darkGray, // Dinámico
      fontStyle: 'italic',
      marginBottom: 10,
    },
    description: {
      fontSize: 14,
      marginVertical: 8,
      color: colors.text, // Dinámico
      lineHeight: 20,
    },
    alertInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 8,
    },
    date: {
      fontSize: 12,
      color: colors.darkGray, // Dinámico
    },
    imageContainer: {
      width: 100,
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.gray, // Dinámico
      borderRadius: 8,
      marginTop: 8,
    },
    imageText: {
      fontSize: 14,
      color: colors.text, // Dinámico
    },
    noImageText: {
      fontSize: 14,
      color: colors.darkGray, // Dinámico
      textAlign: 'center',
    },
  });

export default SightingCard;