import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/src/constants/colors';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type NavItem = {
  name: 'home' | 'alerts' | 'adoption' | 'community_maps' | 'profile';
  icon: IoniconName;
  iconOutline: IoniconName;
  label: string;
};

const navItems: NavItem[] = [
  { name: 'home', icon: 'home', iconOutline: 'home-outline', label: 'Inicio' },
  {
    name: 'alerts',
    icon: 'notifications',
    iconOutline: 'notifications-outline',
    label: 'Alertas',
  },
  {
    name: 'adoption',
    icon: 'heart',
    iconOutline: 'heart-outline',
    label: 'Adopción',
  },
  {
    name: 'community_maps',
    icon: 'map',
    iconOutline: 'map-outline',
    label: 'Mapa',
  },
  {
    name: 'profile',
    icon: 'person',
    iconOutline: 'person-outline',
    label: 'Perfil',
  },
];

const TAB_HEIGHT = 64;

export default function BottomNavBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 10);

  return (
    <View style={styles.root} pointerEvents="box-none">
      <View
        style={[
          styles.container,
          {
            paddingBottom: bottomInset,
            height: TAB_HEIGHT + bottomInset,
          },
        ]}
      >
        <View pointerEvents="none" style={styles.topBevelHighlight} />
        <View pointerEvents="none" style={styles.topBevelShadow} />
        {/* Gradiente sutil para profundidad (capa detrás) */}
        <View pointerEvents="none" style={styles.containerSheen} />

        {navItems.map((item) => {
          const isActive = !!pathname?.includes(`/${item.name}`);
          const iconName: IoniconName = isActive ? item.icon : item.iconOutline;

          const animatedIcon = useAnimatedStyle(() => ({
            transform: [
              { translateY: withTiming(isActive ? -2 : 0, { duration: 160 }) },
              {
                scale: isActive
                  ? withSpring(1.1, { damping: 16, stiffness: 200 })
                  : withTiming(1, { duration: 140 }),
              },
              // leve “tilt” 3D opcional
              {
                rotateZ: withTiming(isActive ? '0deg' : '0deg', {
                  duration: 160,
                }),
              },
            ],
            opacity: withTiming(isActive ? 1 : 0.65, { duration: 160 }),
          }));

          const activePill = useAnimatedStyle(() => ({
            opacity: withTiming(isActive ? 1 : 0, { duration: 160 }),
            transform: [
              { scale: withTiming(isActive ? 1 : 0.99, { duration: 160 }) },
            ],
          }));

          return (
            <Link key={item.name} href={`/${item.name}`} asChild>
              <TouchableOpacity
                style={styles.navItem}
                activeOpacity={0.9}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="tab"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: isActive }}
              >
                {/* Indicador superior con glow */}
                {isActive && (
                  <>
                    <Animated.View style={styles.topIndicatorGlow} />
                    <Animated.View style={styles.topIndicator} />
                  </>
                )}

                {/* Pill activo con efecto neumórfico (capas) */}
                <Animated.View style={[styles.activePill, activePill]}>
                  {/* Sombra inferior suave (drop shadow) */}
                  <View style={styles.pillShadowBottom} />
                  {/* Highlight superior (simula inner shadow invertida) */}
                  <View style={styles.pillHighlightTop} />
                </Animated.View>

                {/* Contenido (icono + label) con bevel del icono */}
                <Animated.View style={[styles.content, animatedIcon]}>
                  <View style={styles.icon3DWrap}>
                    {/* highlight arriba del icono */}
                    {isActive && <View style={styles.iconHighlight} />}
                    {/* sombra abajo del icono */}
                    {isActive && <View style={styles.iconShadow} />}
                    <Ionicons
                      name={iconName}
                      size={isActive ? 24 : 22}
                      color={isActive ? Colors.primary : Colors.secondary}
                    />
                  </View>
                  <View style={styles.labelBox}>
                    <AppText
                      style={[styles.label, isActive && styles.labelActive]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {item.label}
                    </AppText>
                  </View>
                </Animated.View>
              </TouchableOpacity>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { left: 0, right: 0, bottom: 0 },

  // En styles.container
  container: {
    backgroundColor:
      Platform.OS === 'ios' ? 'rgba(242, 226, 196, 0.96)' : Colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    // SOLO arriba redondeado
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    // Remueve borderRadius: 18
    // borderRadius: 18,

    borderTopWidth: 1,
    borderTopColor: '#D8C8A8',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.14,
        shadowRadius: 16,
      },
      android: { elevation: 14 },
    }),
    overflow: 'hidden',
  },

  // capa de “sheen”/gradiente vertical sutil
  containerSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.10)', // un pelín más suave
  },

  // Línea highlight pegada al borde superior
  topBevelHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.65)', // luz
    opacity: 1,
  },

  // “Sombra interior” justo debajo del borde superior
  topBevelShadow: {
    position: 'absolute',
    top: 3,
    left: 0,
    right: 0,
    height: 6,
    // degrada de sombra a transparente para simular profundidad
    backgroundColor: 'transparent',
    // truco de gradiente con sombras: dos capas superpuestas
    // como RN no soporta gradient puro aquí sin librería, usamos
    // una sombra difusa simulada con un color semitransparente:
    borderTopColor: 'rgba(0,0,0,0.08)',
    borderTopWidth: 1, // no dibuja línea, solo dejamos como referencia
  },

  navItem: {
    flex: 1,
    height: TAB_HEIGHT,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },

  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    zIndex: 1,
    minWidth: 64,
  },

  // PILL ACTIVO 3D (neumorphism)
  activePill: {
    position: 'absolute',
    top: 10,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 16,
    backgroundColor: Colors.primary + '29', // ~16% alpha
    borderWidth: 1,
    borderColor: Colors.primary + '4D', // ~30% alpha
    zIndex: 0,
    overflow: 'hidden',
  },
  pillShadowBottom: {
    position: 'absolute',
    bottom: 0,
    left: 6,
    right: 6,
    height: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  pillHighlightTop: {
    position: 'absolute',
    top: 0,
    left: 6,
    right: 6,
    height: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  // Indicador superior con glow
  topIndicatorGlow: {
    position: 'absolute',
    top: 4,
    height: 10,
    width: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary + '40',
    alignSelf: 'center',
    zIndex: 3,
  },
  topIndicator: {
    position: 'absolute',
    top: 6,
    height: 4,
    width: 24,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    alignSelf: 'center',
    zIndex: 4,
  },

  // Icono con “bevel” simulado
  icon3DWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHighlight: {
    position: 'absolute',
    top: -2,
    width: 20,
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  iconShadow: {
    position: 'absolute',
    bottom: -2,
    width: 22,
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.10)',
  },

  labelBox: {
    height: 16,
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: Colors.secondary,
    opacity: 0.85,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: Platform.OS === 'android' ? '500' : '400',
    letterSpacing: 0.2,
  },
  labelActive: {
    color: Colors.primary,
    opacity: 1,
    fontWeight: fontWeightSemiBold,
  },
});
