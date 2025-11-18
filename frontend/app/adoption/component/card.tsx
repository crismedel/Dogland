import React, { memo, useCallback } from 'react';
import {
  TouchableOpacity,
  Image,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  fontWeightBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';
// 1. Quitar la importación estática de Colors
// import { Colors } from '@/src/constants/colors';

// 2. Importar el hook y el tipo de 'theme'
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

import {
  getHealthLabel,
  getBreedLabel,
  getAgeInYearsDisplay,
  FALLBACK_IMAGE,
} from '@/src/utils/animalUtils';
import { Animal } from '@/src/types/animals';

interface Props {
  animal: Animal;
  currentPage: number;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
}

const AnimalCard: React.FC<Props> = memo(
  ({ animal, currentPage, isFavorited, onToggleFavorite }) => {
    // 3. Llamar al hook y generar los estilos DENTRO del componente
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const router = useRouter();
    const healthLabel = getHealthLabel(animal);
    const breedLabel = getBreedLabel(animal.breed);
    const AgeInYearsDisplay = getAgeInYearsDisplay(animal.age);

    const handlePress = useCallback(() => {
      router.push({
        pathname: '/adoption/perfilCan',
        params: {
          id: animal.id,
          currentPage: currentPage.toString(),
        },
      });
    }, [animal.id, router, currentPage]);

    const handleToggleFavoritePress = useCallback(
      (ev: any) => {
        ev?.stopPropagation?.();
        onToggleFavorite?.();
      },
      [onToggleFavorite],
    );

    // Esta lógica de color semántico está bien dejarla aquí,
    // ya que no depende del tema (claro/oscuro) sino del estado del animal.
    const primaryColor = (() => {
      if (animal.estadoMedico === 1 || healthLabel === 'Sano') return '#2e7d32'; // Verde (Sano)
      if (animal.estadoMedico === 2 || healthLabel === 'En tratamiento')
        return '#ef6c00'; // Naranja (Tratamiento)
      if (animal.estadoMedico === 3 || healthLabel === 'Recuperado')
        return '#0288d1'; // Azul (Recuperado)
      if (healthLabel === 'Discapacitado') return '#6a1b9a'; // Morado
      return '#455a64'; // Gris (Otro)
    })();

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: String(animal.imageUrl || FALLBACK_IMAGE) }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['#00000000', '#00000099']}
            style={styles.gradient}
          />

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavoritePress}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={20}
              // 4. Usar colores del hook para el ícono de favorito
              color={isFavorited ? colors.danger : colors.lightText}
            />
          </TouchableOpacity>

          {(healthLabel || animal.estadoMedico) && (
            <View
              style={[styles.healthBadge, { backgroundColor: primaryColor }]}
            >
              <AppText style={styles.healthText}>
                {healthLabel ??
                  (animal.estadoMedico === 1
                    ? 'Sano'
                    : animal.estadoMedico === 2
                    ? 'En tratamiento'
                    : animal.estadoMedico === 3
                    ? 'Recuperado'
                    : 'Sin datos')}
              </AppText>
            </View>
          )}

          <View style={styles.titleOnImage}>
            <AppText numberOfLines={1} style={styles.nameOnImage}>
              {animal.name}
            </AppText>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.rowChips}>
            {/* SIZE */}
            {animal.size ? (
              <View style={styles.tagChip}>
                <AppText style={styles.tagChipText}>{animal.size}</AppText>
              </View>
            ) : null}

            <View style={styles.ageChip}>
              <AppText style={styles.ageChipText}>
                {typeof AgeInYearsDisplay === 'number'
                  ? `${AgeInYearsDisplay}`
                  : String(AgeInYearsDisplay)}
              </AppText>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.breedChip}>
              <AppText numberOfLines={1} style={styles.breedChipText}>
                {breedLabel}
              </AppText>
            </View>
          </View>

          {animal.descripcionMedica ? (
            <AppText numberOfLines={2} style={styles.medicalNote}>
              {animal.descripcionMedica}
            </AppText>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  },
);

AnimalCard.displayName = 'AnimalCard';

// 5. Convertir el StyleSheet en una función que acepte los colores
const getStyles = (colors: ColorsType) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.cardBackground, // Dinámico
      borderRadius: 14,
      margin: 2,
      borderColor: colors.secondary, // Dinámico
      borderWidth: 1,
      elevation: 4,
      overflow: 'hidden',
      ...Platform.select({
        android: { elevation: 3 },
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        },
      }),
    },

    imageWrapper: {
      width: '100%',
      aspectRatio: 4 / 3,
      backgroundColor: colors.gray, // Dinámico
    },

    image: { width: '100%', height: '100%' },

    gradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '45%',
    },

    favoriteButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.35)',
      padding: 6,
      borderRadius: 20,
      zIndex: 10,
    },

    healthBadge: {
      position: 'absolute',
      top: 10,
      left: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },

    healthText: {
      color: colors.lightText, // Dinámico
      fontSize: 11,
      fontWeight: fontWeightMedium,
      letterSpacing: 0.2,
    },

    titleOnImage: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      right: 10,
    },

    nameOnImage: {
      color: colors.lightText, // Dinámico
      fontSize: 20,
      fontWeight: fontWeightBold,
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowRadius: 8,
      textShadowOffset: { width: 0, height: 2 },
    },

    infoContainer: {
      padding: 12,
      gap: 8,
    },

    rowChips: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },

    breedChip: {
      flexShrink: 1,
      maxWidth: '100%',
      backgroundColor: colors.backgroundSecon, // Dinámico
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderColor: colors.info, // Dinámico
      borderWidth: 1,
    },

    breedChipText: {
      fontSize: 13,
      color: colors.info, // Dinámico
      fontWeight: fontWeightMedium,
    },

    ageChip: {
      marginLeft: 'auto',
      backgroundColor: colors.backgroundSecon, // Dinámico
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
      minWidth: 80,
      alignItems: 'center',
    },

    ageChipText: {
      fontSize: 13,
      color: colors.text, // Dinámico
      fontWeight: fontWeightMedium,
    },

    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginLeft: 0,
    },

    tagChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background, // Dinámico
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.primary, // Dinámico
    },

    tagChipText: {
      fontSize: 10,
      color: colors.secondary, // Dinámico
      fontWeight: fontWeightMedium,
    },

    medicalNote: {
      fontSize: 13,
      color: colors.darkGray, // Dinámico
      lineHeight: 18,
      marginTop: 4,
    },
  });

export default AnimalCard;