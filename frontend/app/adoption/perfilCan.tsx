import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Share,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '@/src/components/UI/CustomHeader';
import TarjetaMedica from './component/terjetasMedicas';
import { Colors } from '@/src/constants/colors';
import CustomButton from '@/src/components/UI/CustomButton';
import {
  fontWeightBold,
  fontWeightSemiBold,
  AppText,
} from '@/src/components/AppText';
import {
  getHealthLabel,
  getBreedLabel,
  getAgeDisplay,
  getAgeInYearsDisplay,
  normalizeAnimal,
} from '@/src/utils/animalUtils';
import { Animal } from '@/src/types/animals';
import { useNotification } from '@/src/components/notifications/NotificationProvider';
import { fetchAnimalById } from '@/src/api/animals';
import { RoleGuard } from '@/src/components/auth'; // Importa RoleGuard
import Spinner from '@/src/components/UI/Spinner';

const PerfilCan = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { showError } = useNotification();

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);

  const id = String(params.id ?? '');

  useEffect(() => {
    if (!id) {
      showError('Error', 'ID de animal inválido');
      router.back();
      return;
    }
    setLoading(true);
    fetchAnimalById(Number(id))
      .then((data) => setAnimal(normalizeAnimal(data)))
      .catch(() => {
        showError('Error', 'No se pudo cargar el perfil del animal');
        router.back();
      })
      .finally(() => setLoading(false));
  }, [id, router, showError]);

  if (loading) {
    return <Spinner />;
  }

  if (!animal) return null;

  const healthLabel = getHealthLabel(animal);
  const breedLabel = getBreedLabel(animal.breed);
  const ageDisplay = getAgeDisplay(animal);
  const AgeInYearsDisplay = getAgeInYearsDisplay(animal.age);

  const handleSolicitarAdopcion = () => {
    router.push({
      pathname: '/adoption/solicitudAdopcion',
      params: {
        idAnimal: animal.id,
        nombreAnimal: animal.name,
        breed: breedLabel,
        age: String(animal.age),
        imageUrl: animal.imageUrl,
      },
    });
  };

  const handleEditPerfil = () => {
    router.push({
      pathname: '/adoption/editPerfilCan',
      params: { id: animal.id },
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `Conoce a ${animal.name}`,
        message: `Conoce a ${animal.name} (${breedLabel}), ${ageDisplay}. ¡Busca familia!`,
      });
    } catch (e) {
      console.warn('Share cancelled or failed', e);
    }
  };

  const estadoColor = (() => {
    if (animal.estadoMedico === 1 || healthLabel === 'Sano') return '#2e7d32';
    if (animal.estadoMedico === 2 || healthLabel === 'En tratamiento')
      return '#ef6c00';
    if (animal.estadoMedico === 3 || healthLabel === 'Recuperado')
      return '#0288d1';
    if (healthLabel === 'Discapacitado') return '#6a1b9a';
    return '#455a64';
  })();

  const estadoTexto = healthLabel || 'Disponible para adopción';

  return (
    <View style={styles.screen}>
      <CustomHeader
        title="Perfil del Animal"
        leftComponent={
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity
            onPress={handleShare}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="share-social-outline" size={20} color="#fff" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.neuImageWrapper}>
          <View style={styles.imageWrap}>
            <Image source={{ uri: animal.imageUrl }} style={styles.image} />

            <View
              style={[
                styles.estadoBadge,
                { backgroundColor: estadoColor + 'dd' },
              ]}
            >
              <AppText style={styles.estadoText}>{estadoTexto}</AppText>
            </View>

            <View style={styles.innerShadowBottom} />
          </View>
        </View>

        <AppText numberOfLines={1} style={styles.name}>
          {animal.name}
        </AppText>
        <AppText numberOfLines={1} style={styles.subtle}>
          {breedLabel}
        </AppText>
        <AppText style={styles.subtle}>{ageDisplay}</AppText>

        <View style={styles.pillsRow}>
          {animal.species && (
            <View style={styles.pill}>
              <Ionicons name="paw-outline" size={14} color="#1565c0" />
              <AppText numberOfLines={1} style={styles.pillText}>
                {animal.species}
              </AppText>
            </View>
          )}
          {animal.size && (
            <View style={styles.pillLight}>
              <Ionicons name="resize-outline" size={14} color={Colors.text} />
              <AppText numberOfLines={1} style={styles.pillTextDark}>
                {animal.size}
              </AppText>
            </View>
          )}
        </View>

        <RoleGuard allowedRoles={['Admin']}>
          <CustomButton
            title="Editar"
            onPress={handleEditPerfil}
            variant="primary"
            icon="heart"
          />
        </RoleGuard>

        <NeumorphCard title="Información del Animal">
          <Row label="Edad aproximada" value={AgeInYearsDisplay} />
          <Divider />
          <Row label="Edad real" value={ageDisplay} />
          <Divider />
          <Row label="Raza" value={breedLabel} truncate />
          <Divider />
          <Row label="Tamaño" value={animal.size || 'Desconocido'} />
          <Divider />
          <Row label="Estado" value={estadoTexto} valueColor={estadoColor} />
        </NeumorphCard>

        <NeumorphCard title="Requisitos de Adopción">
          {[
            'Compromiso de cuidado responsable',
            'Vivienda adecuada',
            'Tiempo para dedicarle',
            'Compromiso de esterilización',
          ].map((txt, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <AppText style={styles.bulletText}>{txt}</AppText>
            </View>
          ))}
        </NeumorphCard>

        <NeumorphCard title="Estado de Salud">
          <TarjetaMedica
            estadoMedico={Number(animal.estadoMedico)}
            descripcion={animal.descripcionMedica || 'Sin detalles adicionales'}
          />
        </NeumorphCard>

        <View style={{ height: 92 }} />
      </ScrollView>

      <View style={styles.ctaWrap}>
        <CustomButton
          title="Solicitar Adopción"
          onPress={handleSolicitarAdopcion}
          variant="primary"
          icon="heart"
        />
      </View>
    </View>
  );
};

// ---------- Subcomponentes ----------

const Row = ({
  label,
  value,
  truncate,
  valueColor,
}: {
  label: string;
  value: string;
  truncate?: boolean;
  valueColor?: string;
}) => (
  <View style={styles.row}>
    <AppText style={styles.rowLabel}>{label}</AppText>
    <AppText
      numberOfLines={truncate ? 1 : undefined}
      ellipsizeMode={truncate ? 'tail' : undefined}
      style={[styles.rowValue, valueColor ? { color: valueColor } : null]}
    >
      {value}
    </AppText>
  </View>
);

const Divider = () => <View style={styles.separator} />;

const NeumorphCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  const scale = new Animated.Value(1);

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.995,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();

  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();

  return (
    <Animated.View style={[styles.neuWrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={0.98}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <View style={styles.cardNeu}>
          <AppText style={styles.cardTitle}>{title}</AppText>
          {children}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ---------- Estilos ----------

const PERF_RADIUS = 18;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: 'center',
  },
  neuImageWrapper: {
    width: '100%',
    borderRadius: PERF_RADIUS,
    backgroundColor: Colors.background,
    padding: 6,
    marginBottom: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        shadowOffset: { width: 10, height: 10 },
      },
      android: { elevation: 6 },
    }),
  },
  imageWrap: {
    width: '100%',
    height: 260,
    borderRadius: PERF_RADIUS,
    overflow: 'hidden',
    backgroundColor: '#e0e6eb',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 14,
        shadowOffset: { width: -6, height: -6 },
      },
      android: { elevation: 2 },
    }),
  },
  image: { width: '100%', height: '100%' },
  innerShadowBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  estadoBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  estadoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: fontWeightSemiBold,
    letterSpacing: 0.2,
  },
  name: {
    marginTop: 16,
    fontSize: 26,
    fontWeight: fontWeightBold,
    color: Colors.text,
    textAlign: 'center',
  },
  subtle: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 2,
  },
  pillsRow: { flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 6 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  pillLight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eceff1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  pillText: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: fontWeightSemiBold,
  },
  pillTextDark: {
    fontSize: 12,
    color: '#546e7a',
    fontWeight: fontWeightSemiBold,
  },
  neuWrapper: {
    width: '100%',
    marginTop: 16,
    borderRadius: PERF_RADIUS,
    backgroundColor: Colors.background,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 20,
        shadowOffset: { width: 12, height: 12 },
      },
      android: { elevation: 4 },
    }),
  },
  cardNeu: {
    borderRadius: PERF_RADIUS,
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.secondary,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 14,
        shadowOffset: { width: -6, height: -6 },
      },
      android: { elevation: 2 },
    }),
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: fontWeightBold,
    color: Colors.secondary,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLabel: {
    fontSize: 13,
    color: '#607d8b',
    fontWeight: fontWeightSemiBold,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  rowValue: {
    fontSize: 14,
    color: Colors.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#eef2f6',
    marginVertical: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 4,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#90a4ae',
    marginTop: 6,
  },
  bulletText: { flex: 1, color: '#455a64', fontSize: 14, lineHeight: 20 },
  ctaWrap: { position: 'absolute', left: 0, right: 0, bottom: 10, margin: 10 },
  center: { justifyContent: 'center', alignItems: 'center' },
});

export default PerfilCan;
