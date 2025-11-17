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
import { Colors } from '@/src/constants/colors';
import {
  getAgeInYearsDisplay,
  FALLBACK_IMAGE,
} from '@/src/utils/animalUtils';
// Asegúrate de que tu interfaz Animal en src/types/animals tenga las propiedades nuevas (healthStatus, breed string, etc)
// Si no, usa 'any' temporalmente en la prop abajo.

interface Props {
  animal: any; 
  currentPage: number;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
}

const AnimalCard: React.FC<Props> = memo(
  ({ animal, currentPage, isFavorited, onToggleFavorite }) => {
    const router = useRouter();
    
    // Datos directos del mapeo
    const healthLabel = animal.healthStatus || ''; 
    const breedLabel = animal.breed || '';
    
    // Edad: numérica o texto aproximado
    const ageDisplay = (animal.age !== null && animal.age !== undefined)
      ? getAgeInYearsDisplay(animal.age)
      : (animal.ageText || '');

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

    // Colores según el texto del estado
    const primaryColor = (() => {
      const status = healthLabel.toLowerCase();
      if (status.includes('sano') || status.includes('saludable')) return '#2e7d32';
      if (status.includes('tratamiento') || status.includes('enfermo')) return '#ef6c00';
      if (status.includes('recuperado')) return '#0288d1';
      if (status.includes('herido') || status.includes('crítico')) return '#c62828';
      return '#455a64';
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
              color={isFavorited ? '#e91e63' : '#fff'}
            />
          </TouchableOpacity>

          {/* Solo mostramos el badge si hay texto de salud */}
          {healthLabel ? (
            <View style={[styles.healthBadge, { backgroundColor: primaryColor }]}>
              <AppText style={styles.healthText}>{healthLabel}</AppText>
            </View>
          ) : null}

          <View style={styles.titleOnImage}>
            <AppText numberOfLines={1} style={styles.nameOnImage}>
              {animal.name}
            </AppText>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.rowChips}>
            {animal.size ? (
              <View style={styles.tagChip}>
                <AppText style={styles.tagChipText}>{animal.size}</AppText>
              </View>
            ) : null}

            {ageDisplay ? (
              <View style={styles.ageChip}>
                <AppText style={styles.ageChipText}>{ageDisplay}</AppText>
              </View>
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.breedChip}>
              <AppText numberOfLines={1} style={styles.breedChipText}>
                {breedLabel}
              </AppText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

AnimalCard.displayName = 'AnimalCard';

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    margin: 2,
    borderColor: Colors.secondary,
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
    backgroundColor: '#eceff1',
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
    color: '#fff',
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
    color: '#fff',
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
    backgroundColor: '#d0e8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  breedChipText: {
    fontSize: 13,
    color: '#0d47a1',
    fontWeight: fontWeightMedium,
  },
  ageChip: {
    marginLeft: 'auto',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  ageChipText: {
    fontSize: 13,
    color: '#37474f',
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
    backgroundColor: '#fff3e0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ffcc80',
  },
  tagChipText: {
    fontSize: 10,
    color: '#ff8f00',
    fontWeight: fontWeightMedium,
  },
  medicalNote: {
    fontSize: 13,
    color: '#455a64',
    lineHeight: 18,
    marginTop: 4,
  },
});

export default AnimalCard;