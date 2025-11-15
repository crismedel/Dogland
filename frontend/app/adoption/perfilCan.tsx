import React, { useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Share,
  Animated,
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
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

const PerfilCan = () => {
  const {
    id,
    name,
    breed,
    age,
    imageUrl,
    estadoMedico,
    descripcionMedica,
    health,
    size,
    species,
  } = useLocalSearchParams();
  const router = useRouter();

  const handleSolicitarAdopcion = () => {
    router.push({
      pathname: '/adoption/solicitudAdopcion',
      params: { idAnimal: id, nombreAnimal: name, breed, age, imageUrl },
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `Conoce a ${name}`,
        message: `Conoce a ${name} (${breed}), ${age} meses. ¡Busca familia!`,
      });
    } catch {}
  };

  const estadoTexto =
    (health as string) ||
    (Number(estadoMedico) === 1
      ? 'Sano'
      : Number(estadoMedico) === 2
      ? 'En tratamiento'
      : Number(estadoMedico) === 3
      ? 'Recuperado'
      : 'Disponible para adopción');

  const estadoColor =
    estadoTexto === 'Sano'
      ? '#2e7d32'
      : estadoTexto === 'En tratamiento'
      ? '#ef6c00'
      : estadoTexto === 'Recuperado'
      ? '#0288d1'
      : '#455a64';

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
        {/* Contenedor 3D tipo card para la imagen */}
        <View style={styles.neuImageWrapper}>
          <View style={styles.imageWrap}>
            <Image source={{ uri: imageUrl as string }} style={styles.image} />

            {/* Badge de estado */}
            <View
              style={[
                styles.estadoBadge,
                { backgroundColor: estadoColor + 'dd' },
              ]}
            >
              <AppText style={styles.estadoText}>{estadoTexto}</AppText>
            </View>

            {/* Sombra interna inferior para profundidad */}
            <View style={styles.innerShadowBottom} />
          </View>
        </View>

        {/* Identidad */}
        <AppText numberOfLines={1} style={styles.name}>
          {String(name)}
        </AppText>
        <AppText numberOfLines={1} style={styles.subtle}>
          {String(breed)}
        </AppText>
        <AppText style={styles.subtle}>{age} meses</AppText>

        {/* Chips */}
        <View style={styles.pillsRow}>
          {species ? (
            <View style={styles.pill}>
              <Ionicons name="paw-outline" size={14} color="#1565c0" />
              <AppText numberOfLines={1} style={styles.pillText}>
                {String(species)}
              </AppText>
            </View>
          ) : null}
          {size ? (
            <View style={styles.pillLight}>
              <Ionicons name="resize-outline" size={14} color={Colors.text} />
              <AppText numberOfLines={1} style={styles.pillTextDark}>
                {String(size)}
              </AppText>
            </View>
          ) : null}
        </View>

        {/* Cards 3D: neumorfismo sutil */}
        <NeumorphCard title="Información del Animal">
          <Row label="Edad" value={`${age} meses`} />
          <Divider />
          <Row label="Raza" value={String(breed)} truncate />
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
            estadoMedico={Number(estadoMedico)}
            descripcion={
              (descripcionMedica as string) || 'Sin detalles adicionales'
            }
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

// ---------- Subcomponentes UI ----------

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
  const scale = useRef(new Animated.Value(1)).current;
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
    paddingBottom: 0,
    alignItems: 'center',
  },

  // Contenedor 3D de la imagen (neumórfico como las cards)
  neuImageWrapper: {
    width: '100%',
    borderRadius: PERF_RADIUS,
    backgroundColor: Colors.background,
    padding: 6, // borde suave alrededor de la imagen
    marginBottom: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        shadowOffset: { width: 10, height: 10 }, // sombra oscura
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
        shadowOffset: { width: -6, height: -6 }, // contrasombra (realce)
      },
      android: { elevation: 2 },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  // Sombra interna inferior para dar profundidad
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

  // Identidad
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

  // Pills/chips
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 6,
  },
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

  // Card estilo neumórfico (3D suave)
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
        shadowOffset: { width: 12, height: 12 }, // sombra oscura
      },
      android: { elevation: 4 },
    }),
  },
  cardNeu: {
    borderRadius: PERF_RADIUS,
    backgroundColor: '#fff',
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e6ebf0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 14,
        shadowOffset: { width: -6, height: -6 }, // contrasombra
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

  // Filas de información
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

  // Bullets
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
  bulletText: {
    flex: 1,
    color: '#455a64',
    fontSize: 14,
    lineHeight: 20,
  },

  // CTA sticky
  ctaWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    margin: 10,
  },
});

export default PerfilCan;
