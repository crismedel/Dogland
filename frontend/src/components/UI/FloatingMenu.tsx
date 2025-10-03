import { Colors } from '@/src/constants/colors';
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';

interface FloatingMenuProps {
  visible: boolean;
  onToggle: () => void;
  onNavigateToReports: () => void;
  onNavigateToCreateAlert: () => void;
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({
  visible,
  onToggle,
  onNavigateToReports,
  onNavigateToCreateAlert,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          speed: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <>
      {visible && (
        <Animated.View
          style={[
            styles.fabMenuContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={onNavigateToReports}
          >
            <Text style={styles.fabMenuItemText}>Ir a Reportes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fabMenuItem, { marginTop: 10 }]}
            onPress={onNavigateToCreateAlert}
          >
            <Text style={styles.fabMenuItemText}>Crear Nueva Alerta</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={onToggle}
      >
        <Text style={styles.fabText}>{visible ? '×' : '+'}</Text>
      </TouchableOpacity>
    </>
  );
};

export default FloatingMenu;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 1000,
  },
  fabText: {
    color: Colors.lightText,
    fontSize: 24,
    fontWeight: 'bold',
  },
  fabMenuContainer: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    backgroundColor: Colors.lightText,
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
  },
  fabMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: Colors.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  fabMenuItemText: {
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: '600',
  },
});
