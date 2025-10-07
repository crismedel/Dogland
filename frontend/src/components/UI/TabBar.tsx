import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Text,
} from 'react-native';
import { Link, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Colors } from '@/src/constants/colors';

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

export default function BottomNavBar() {
  const pathname = usePathname();

  return (
    <View style={styles.root} pointerEvents="box-none">
      <View style={styles.container}>
        {navItems.map((item) => {
          const isActive = pathname?.includes(`/${item.name}`);
          const iconName: IoniconName = isActive ? item.icon : item.iconOutline;

          return (
            <Link key={item.name} href={`/${item.name}`} asChild>
              <TouchableOpacity style={styles.navItem} activeOpacity={0.9}>
                <Ionicons
                  name={iconName}
                  size={22}
                  color={isActive ? Colors.primary : Colors.secondary}
                />
                <Text style={[styles.label, isActive && styles.labelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

const TAB_HEIGHT = 64;

const styles = StyleSheet.create({
  root: {
    // position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.background, // tu crema
    height: TAB_HEIGHT,
    paddingBottom: Platform.select({ ios: 6, android: 10 }), // safe-ish
    borderTopWidth: 1,
    borderTopColor: '#E6E0D3',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 6 },
    }),
  },
  navItem: {
    flex: 1,
    height: TAB_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    color: Colors.secondary,
    opacity: 0.75,
  },
  labelActive: {
    color: Colors.primary,
    opacity: 1,
    fontWeight: '600',
  },
});
