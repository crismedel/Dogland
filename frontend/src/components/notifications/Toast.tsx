import React from 'react';
import {
  Animated,
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { AppText, fontWeightSemiBold } from '@/src/components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ToastType, ToastPosition } from './types';
import type { AnimValue } from './types';

type Props = {
  anim: AnimValue;
  type: ToastType;
  title: string;
  message?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  onHide: () => void;
  position: ToastPosition;
  underHeader: boolean;
  tabBarHeight: number;
  dismissible: boolean;
};

const { width, height } = Dimensions.get('window');

const Toast: React.FC<Props> = ({
  anim,
  type,
  title,
  message,
  actionLabel,
  onActionPress,
  onHide,
  position,
  underHeader,
  tabBarHeight,
  dismissible,
}) => {
  const insets = useSafeAreaInsets();
  const typeColor = {
    success: colors.success,
    error: colors.error,
    info: colors.info,
    warning: colors.warning,
  }[type];

  const translate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: position === 'top' ? [40, 0] : [40, 0],
  }) as any;
  const opacity = anim as any;

  const H_MARGIN = 16;
  const V_MARGIN = 12;
  const HEADER_HEIGHT = 56;
  const MAX_WIDTH = 440;
  const containerStyle =
    position === 'top'
      ? {
          top: insets.top + (underHeader ? HEADER_HEIGHT : 0) + V_MARGIN,
          bottom: undefined,
        }
      : { bottom: insets.bottom + tabBarHeight + V_MARGIN, top: undefined };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        {
          position: 'absolute',
          left: H_MARGIN,
          right: H_MARGIN,
          alignItems: 'center',
          zIndex: 999,
          transform: [{ translateY: translate }],
          opacity,
        },
        containerStyle,
      ]}
    >
      <View
        style={[
          styles.toastCard,
          {
            borderLeftColor: typeColor,
            maxWidth: MAX_WIDTH,
            alignSelf: 'center',
          },
        ]}
        accessibilityLiveRegion={type === 'error' ? 'assertive' : 'polite'}
        accessibilityRole="alert"
      >
        <View style={styles.toastContent}>
          <AppText style={styles.toastTitle}>{title}</AppText>
          {!!message && (
            <AppText style={styles.toastMessage}>{message}</AppText>
          )}
        </View>
        <View style={styles.toastActions}>
          {actionLabel ? (
            <TouchableOpacity
              onPress={onActionPress}
              style={styles.toastActionBtn}
            >
              <AppText style={[styles.toastActionText, { color: typeColor }]}>
                {actionLabel}
              </AppText>
            </TouchableOpacity>
          ) : null}
          {dismissible && (
            <TouchableOpacity onPress={onHide} style={styles.toastCloseBtn}>
              <AppText style={styles.toastCloseText}>✕</AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const colors = {
  surface: '#FAF7EF', // Fondo beige claro
  text: '#2c3e50', // Texto oscuro
  border: '#F2D8A7', // Borde beige
  success: '#28a745', // Verde para éxito
  error: '#dc3545', // Rojo para error
  info: '#17a2b8', // Azul para información
  warning: '#ffc107', // Amarillo para advertencia
};

const styles = StyleSheet.create({
  toastCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 6 },
    }),
  },
  toastContent: { flex: 1 },
  toastTitle: {
    color: colors.text,
    fontWeight: fontWeightSemiBold,
    fontSize: 15,
  },
  toastMessage: { color: '#6B7280', marginTop: 2, fontSize: 13 },
  toastActions: { flexDirection: 'row', alignItems: 'center' },
  toastActionBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  toastActionText: { fontWeight: '700' },
  toastCloseBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  toastCloseText: { color: '#666666', fontSize: 16 },
});

export default Toast;
