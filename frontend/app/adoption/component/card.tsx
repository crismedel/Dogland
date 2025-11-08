import React from 'react';
import {
  TouchableOpacity,
  Image,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

interface Animal {
  id: string;
  name: string;
  breed: string;
  age: number | string;
  imageUrl: string;
  size?: 'Pequeño' | 'Mediano' | 'Grande';
  health?: 'Sano' | 'En tratamiento' | 'Discapacitado' | 'Recuperado';
  estadoMedico?: number; // 1: sano, 2: tratamiento, 3: recuperado
  descripcionMedica?: string;
  species?: string;
}

interface Props {
  animal: Animal;
}

const healthColor = (estado?: number, health?: Animal['health']) => {
  if (estado === 1 || health === 'Sano') return '#2e7d32';
  if (estado === 2 || health === 'En tratamiento') return '#ef6c00';
  if (estado === 3 || health === 'Recuperado') return '#0288d1';
  if (health === 'Discapacitado') return '#6a1b9a';
  return '#455a64';
};

const fallbackImage =
  'https://placehold.co/600x400?text=Animal&font=montserrat';

const AnimalCard: React.FC<Props> = ({ animal }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/adoption/perfilCan',
      params: {
        id: animal.id,
        name: animal.name,
        breed: animal.breed,
        age: String(animal.age),
        imageUrl: animal.imageUrl,
        estadoMedico: animal.estadoMedico, // 👈 agregar este campo
        descripcionMedica: animal.descripcionMedica, // 👈 y este también
        size: animal.size,
        species: animal.species,
        health: animal.health,
      },
    });
  };

  const primaryColor = healthColor(animal.estadoMedico, animal.health);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: animal.imageUrl || fallbackImage }}
          style={styles.image}
          resizeMode="cover"
          onError={(e) => {
            // Fallback simplificado
            (e?.currentTarget as any)?.setNativeProps?.({
              src: [{ uri: fallbackImage }],
            });
          }}
        />
        <LinearGradient
          colors={['#00000000', '#00000099']}
          style={styles.gradient}
        />

        {(animal.health || animal.estadoMedico) && (
          <View style={[styles.healthBadge, { backgroundColor: primaryColor }]}>
            <AppText style={styles.healthText}>
              {animal.health
                ? animal.health
                : animal.estadoMedico === 1
                ? 'Sano'
                : animal.estadoMedico === 2
                ? 'En tratamiento'
                : animal.estadoMedico === 3
                ? 'Recuperado'
                : 'Sin datos'}
            </AppText>
          </View>
        )}

        <View style={styles.titleOnImage}>
          <AppText
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.nameOnImage}
          >
            {animal.name}
          </AppText>
        </View>
      </View>

      <View style={styles.infoContainer}>
        {/* Fila de chips: Raza (truncada) + Edad (fijo) */}
        <View style={styles.rowChips}>
          <View style={styles.breedChip}>
            <AppText
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.breedChipText}
            >
              {animal.breed}
            </AppText>
          </View>
          <View style={styles.ageChip}>
            <AppText style={styles.ageChipText}>
              {typeof animal.age === 'number'
                ? `${animal.age} meses`
                : animal.age}
            </AppText>
          </View>
        </View>

        {/* Línea secundaria: Tamaño • Especie (en una sola línea) */}
        <AppText numberOfLines={1} ellipsizeMode="tail" style={styles.metaLine}>
          {animal.size ? `Tamaño: ${animal.size}` : ''}
          {animal.size && animal.species ? '  •  ' : ''}
          {animal.species ?? ''}
        </AppText>

        {/* Nota médica breve si existe */}
        {animal.descripcionMedica ? (
          <AppText
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.medicalNote}
          >
            {animal.descripcionMedica}
          </AppText>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#f4ecde',
    borderRadius: 14,
    margin: 8,
    elevation: 4, // sombra Android
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
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
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
    fontSize: 18,
    fontWeight: fontWeightBold,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowRadius: 6,
  },

  infoContainer: {
    padding: 10,
    gap: 6,
  },

  // Distribuye chips sin que raza empuje a edad
  rowChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // La raza puede ser larga: limitamos ancho y permitimos encogerse
  breedChip: {
    flexShrink: 1,
    maxWidth: '68%', // evita que invada el espacio de edad
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  breedChipText: {
    fontSize: 12,
    color: '#1565c0',
    fontWeight: fontWeightMedium,
  },

  // La edad mantiene ancho mínimo estable y queda a la derecha
  ageChip: {
    marginLeft: 'auto',
    backgroundColor: '#eceff1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    minWidth: 78, // bloquea movimientos y saltos
    alignItems: 'center',
  },
  ageChipText: {
    fontSize: 12,
    color: '#455a64',
    fontWeight: fontWeightMedium,
  },

  // Meta en una sola línea con truncamiento
  metaLine: {
    fontSize: 12,
    color: '#607d8b',
  },

  medicalNote: {
    fontSize: 12,
    color: '#546e7a',
    lineHeight: 16,
  },
});

export default AnimalCard;
