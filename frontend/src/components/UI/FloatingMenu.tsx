import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Colors } from '@/src/constants/colors';

type FloatingAction = {
  key: string;
  label: string; // Tooltip persistente
  onPress: () => void;
  icon?: React.ReactNode; // Opcional: puedes pasar un <Icon />
  disabled?: boolean;
};

interface FloatingSpeedDialProps {
  visible: boolean;
  onToggle: () => void;
  actions: FloatingAction[];
  // Opcionales para personalizar
  placement?: 'right' | 'left'; // lado del tooltip respecto al FAB de acción
  direction?: 'up' | 'down'; // dirección en la que se expanden las acciones
  gap?: number; // separación entre acciones
  persistentTooltips?: boolean; // por si quieres condicionar por dispositivo
  labelMaxWidth?: number; // controla corte de texto del tooltip
}

const FloatingSpeedDial: React.FC<FloatingSpeedDialProps> = ({
  visible,
  onToggle,
  actions,
  placement = 'left',
  direction = 'up',
  gap = 14,
  persistentTooltips = true,
  labelMaxWidth = 220,
}) => {
  // Animaciones del contenedor
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  // Animaciones por-acción (stagger)
  const itemTrans = useMemo(
    () => actions.map(() => new Animated.Value(0)), // 0=oculto, 1=visible
    [actions.length],
  );

  useEffect(() => {
    if (visible) {
      // contenedor
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          speed: 12,
          bounciness: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // acciones (stagger)
      Animated.stagger(
        45,
        itemTrans.map((v) =>
          Animated.timing(v, {
            toValue: 1,
            duration: 160,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ),
      ).start();
    } else {
      // acciones (stagger inverso)
      Animated.stagger(
        35,
        [...itemTrans].reverse().map((v) =>
          Animated.timing(v, {
            toValue: 0,
            duration: 120,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ),
      ).start();

      // contenedor
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.96,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Posición del menú relativo al FAB principal
  const menuVerticalStart = 90; // separación base del FAB principal

  return (
    <>
      {visible && (
        <Animated.View
          pointerEvents={visible ? 'auto' : 'none'}
          style={[
            styles.menuContainer,
            {
              bottom: menuVerticalStart,
              right: 24,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Pila de acciones */}
          <View
            style={[
              styles.stack,
              {
                flexDirection: 'column',
                // Si direction=down, invertimos el orden visual
                transform: [{ scaleY: direction === 'down' ? -1 : 1 }],
                gap,
              },
            ]}
          >
            {actions.map((action, index) => {
              // Para direction=down, hay que invertir cada hijo para que no quede cabeza abajo
              const childTransformFix =
                direction === 'down' ? [{ scaleY: -1 as any }] : [];
              const t = itemTrans[index];
              const translateY = t.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0], // pequeñísimo slide
              });
              const translateX = t.interpolate({
                inputRange: [0, 1],
                outputRange: [placement === 'left' ? 8 : -8, 0],
              });
              const itemOpacity = t;

              return (
                <Animated.View
                  key={action.key}
                  style={[
                    {
                      opacity: itemOpacity,
                      transform: [{ translateY }, { translateX }],
                    },
                    childTransformFix,
                  ]}
                >
                  <View style={styles.row}>
                    {/* Tooltip persistente */}
                    {persistentTooltips && placement === 'left' && (
                      <View
                        style={[
                          styles.tooltip,
                          { marginRight: 10, maxWidth: labelMaxWidth },
                        ]}
                        accessible
                        accessibilityRole="text"
                      >
                        <Text numberOfLines={2} style={styles.tooltipText}>
                          {action.label}
                        </Text>
                      </View>
                    )}

                    {/* Botón de acción circular */}
                    <TouchableOpacity
                      style={[
                        styles.actionFab,
                        action.disabled && { opacity: 0.5 },
                      ]}
                      onPress={action.onPress}
                      disabled={action.disabled}
                      accessibilityRole="button"
                      accessibilityLabel={action.label}
                      activeOpacity={0.8}
                    >
                      {action.icon ? (
                        action.icon
                      ) : (
                        <Text style={styles.actionIcon}>•</Text>
                      )}
                    </TouchableOpacity>

                    {persistentTooltips && placement === 'right' && (
                      <View
                        style={[
                          styles.tooltip,
                          { marginLeft: 10, maxWidth: labelMaxWidth },
                        ]}
                      >
                        <Text numberOfLines={2} style={styles.tooltipText}>
                          {action.label}
                        </Text>
                      </View>
                    )}
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>
      )}

      {/* FAB principal */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Cerrar menú' : 'Abrir menú'}
      >
        <Text style={styles.fabText}>{visible ? '×' : '+'}</Text>
      </TouchableOpacity>
    </>
  );
};

export default FloatingSpeedDial;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: Colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 1000,
  },
  fabText: {
    color: Colors.lightText,
    fontSize: 26,
    fontWeight: '700',
    marginTop: Platform.OS === 'ios' ? -2 : 0,
  },

  menuContainer: {
    position: 'absolute',
    // El contenedor ya no es una “card”; las acciones se apilan como en SpeedDial
    zIndex: 999,
  },
  stack: {
    alignItems: 'flex-end', // alinea acciones a la derecha para que el tooltip quede a la izquierda
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.lightText,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  actionIcon: {
    color: Colors.secondary,
    fontSize: 20,
    fontWeight: '700',
  },

  tooltip: {
    backgroundColor: '#222',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    // sutil sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
