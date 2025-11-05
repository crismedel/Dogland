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
import { fontWeightSemiBold, AppText } from '@/src/components/AppText';

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
const PRIMARY_RGB = '251,191,36'; // #fbbf24
const SECONDARY_RGB = '217,119,6'; // #d97706

export default function BottomNavBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 10);

  // ✅ Colores fijos (solo modo claro)
  const containerBg = Colors.backgroundSecon;
  const containerBorder = 'rgba(0,0,0,0.04)';
  const inactiveColor = Colors.darkGray;
  const activeIconColor = Colors.primary;
  const activeLabelColor = Colors.secondary;
  const pillBg = `rgba(${PRIMARY_RGB}, 0.18)`;
  const pillBorder = `rgba(${PRIMARY_RGB}, 0.28)`;
  const indicatorGlow = `rgba(${SECONDARY_RGB}, 0.16)`;
  const indicatorColor = Colors.secondary;

  return (
    <View style={styles.root} pointerEvents="box-none">
      <View
        style={[
          styles.container,
          {
            backgroundColor: containerBg,
            borderTopColor: containerBorder,
            paddingBottom: bottomInset,
            height: TAB_HEIGHT + bottomInset,
          },
        ]}
      >
        <View pointerEvents="none" style={styles.topBevelHighlight} />
        <View pointerEvents="none" style={styles.topBevelShadow} />
        <View pointerEvents="none" style={styles.containerSheen} />

        {navItems.map((item) => {
          const isActive = !!pathname?.includes(`/${item.name}`);
          const iconName: IoniconName = isActive ? item.icon : item.iconOutline;

          const animatedIcon = useAnimatedStyle(() => ({
            transform: [
              { translateY: withTiming(isActive ? -4 : 0, { duration: 170 }) },
              {
                scale: isActive
                  ? withSpring(1.08, { damping: 14, stiffness: 220 })
                  : withTiming(1, { duration: 140 }),
              },
            ],
            opacity: withTiming(isActive ? 1 : 0.72, { duration: 150 }),
          }));

          const activePill = useAnimatedStyle(() => ({
            opacity: withTiming(isActive ? 1 : 0, { duration: 160 }),
            transform: [
              { scale: withTiming(isActive ? 1 : 0.995, { duration: 160 }) },
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
                {isActive && (
                  <>
                    <Animated.View
                      style={[
                        styles.topIndicatorGlow,
                        { backgroundColor: indicatorGlow },
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.topIndicator,
                        { backgroundColor: indicatorColor },
                      ]}
                    />
                  </>
                )}

                <Animated.View
                  style={[
                    styles.activePill,
                    activePill,
                    { backgroundColor: pillBg, borderColor: pillBorder },
                  ]}
                >
                  <View style={styles.pillShadowBottom} />
                  <View style={styles.pillHighlightTop} />
                </Animated.View>

                <Animated.View style={[styles.content, animatedIcon]}>
                  <View style={styles.icon3DWrap}>
                    {isActive && <View style={styles.iconHighlight} />}
                    {isActive && <View style={styles.iconShadow} />}
                    <Ionicons
                      name={iconName}
                      size={isActive ? 22 : 20}
                      color={isActive ? activeIconColor : inactiveColor}
                    />
                  </View>

                  <View style={styles.labelBox}>
                    <AppText
                      style={[
                        styles.label,
                        { color: inactiveColor },
                        isActive && { color: activeLabelColor },
                        isActive && styles.labelActive,
                      ]}
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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: { elevation: 10 },
    }),
    overflow: 'hidden',
  },
  containerSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: TAB_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  topBevelHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  topBevelShadow: {
    position: 'absolute',
    top: 3,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'transparent',
    borderTopColor: 'rgba(0,0,0,0.06)',
    borderTopWidth: 1,
  },
  navItem: {
    flex: 1,
    height: TAB_HEIGHT,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 14,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    zIndex: 1,
    minWidth: 64,
  },
  activePill: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderRadius: 18,
    borderWidth: 1,
    zIndex: 0,
    overflow: 'hidden',
  },
  pillShadowBottom: {
    position: 'absolute',
    bottom: 6,
    left: 14,
    right: 14,
    height: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  pillHighlightTop: {
    position: 'absolute',
    top: 6,
    left: 10,
    right: 10,
    height: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  topIndicatorGlow: {
    position: 'absolute',
    top: 2,
    height: 8,
    width: 40,
    borderRadius: 10,
    alignSelf: 'center',
    zIndex: 3,
  },
  topIndicator: {
    position: 'absolute',
    top: 5,
    height: 5,
    width: 28,
    borderRadius: 6,
    alignSelf: 'center',
    zIndex: 4,
  },
  icon3DWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHighlight: {
    position: 'absolute',
    top: -2,
    width: 18,
    height: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.36)',
  },
  iconShadow: {
    position: 'absolute',
    bottom: -2,
    width: 20,
    height: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  labelBox: {
    height: 18,
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: Platform.OS === 'android' ? '500' : '400',
    letterSpacing: 0.2,
  },
  labelActive: {
    opacity: 1,
    fontWeight: fontWeightSemiBold,
  },
});
