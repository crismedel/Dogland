import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react';
import {
  Modal,
  Animated,
  Easing,
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  AppState,
  AccessibilityInfo,
} from 'react-native';
import {
  AppText,
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
} from '@/src/components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { router } from 'expo-router';

// Ajusta estos imports locales a tus rutas reales:
import { useAuth } from '@/src/contexts/AuthContext';
import { buildAndRegisterPushToken } from '@/src/api/notifications';

// ---------- Types ----------
type ToastType = 'success' | 'error' | 'info' | 'warning';
type ToastPosition = 'top' | 'bottom';

type ToastOptions = {
  id?: string;
  type?: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
  actionLabel?: string;
  onActionPress?: () => void;
  position?: ToastPosition;
  underHeader?: boolean;
  tabBarHeight?: number;
  dismissible?: boolean;
};

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

type NotificationContextType = {
  showToast: (opts: ToastOptions) => string;
  showSuccess: (
    title: string,
    message?: string,
    opts?: Partial<ToastOptions>,
  ) => string;
  showError: (
    title: string,
    message?: string,
    opts?: Partial<ToastOptions>,
  ) => string;
  showInfo: (
    title: string,
    message?: string,
    opts?: Partial<ToastOptions>,
  ) => string;
  showWarning: (
    title: string,
    message?: string,
    opts?: Partial<ToastOptions>,
  ) => string;
  dismissToast: (id?: string) => void;
  updateToast: (id: string, opts: Partial<ToastOptions>) => void;
  confirm: (opts: ConfirmOptions) => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

// ---------- Provider ----------
type ProviderProps = { children: React.ReactNode };

export const NotificationProvider: React.FC<ProviderProps> = ({ children }) => {
  // Toast state
  const [toasts, setToasts] = useState<Required<ToastOptions>[]>([]);
  const toastTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const toastAnimMap = useRef<Record<string, Animated.Value>>({});

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<
    (ConfirmOptions & { visible: boolean }) | null
  >(null);

  const { isAuthenticated, user } = useAuth();
  const insets = useSafeAreaInsets();

  // -----------------------
  // Handlers: dismissToast & showToast
  // -----------------------
  const dismissToast = useCallback((id?: string) => {
    if (!id) {
      // dismiss all
      setToasts([]);
      Object.values(toastTimers.current).forEach(clearTimeout);
      toastTimers.current = {};
      toastAnimMap.current = {};
      return;
    }

    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (!toast) return prev;

      const anim = toastAnimMap.current[id];
      if (anim) {
        Animated.timing(anim, {
          toValue: 0,
          duration: 160,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start(() => {
          setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
          delete toastAnimMap.current[id];
        });
      } else {
        // sin animación, eliminar inmediatamente
        return prev.filter((t) => t.id !== id);
      }

      if (toastTimers.current[id]) {
        clearTimeout(toastTimers.current[id]);
        delete toastTimers.current[id];
      }

      return prev;
    });
  }, []);

  const showToast = useCallback(
    (opts: ToastOptions) => {
      const id = opts.id || Math.random().toString(36).substring(2, 9);
      const toast: Required<ToastOptions> = {
        id,
        type: opts.type ?? 'info',
        title: opts.title,
        message: opts.message ?? '',
        durationMs: opts.durationMs ?? 3000,
        actionLabel: opts.actionLabel ?? '',
        onActionPress: opts.onActionPress ?? (() => {}),
        position: opts.position ?? 'top',
        underHeader: opts.underHeader ?? true,
        tabBarHeight: opts.tabBarHeight ?? 0,
        dismissible: opts.dismissible ?? true,
      };

      setToasts((prev) => [...prev, toast]);

      // Initialize animation value
      if (!toastAnimMap.current[id]) {
        toastAnimMap.current[id] = new Animated.Value(0);
      }

      const anim = toastAnimMap.current[id];
      Animated.timing(anim, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      // Accessibility announcement
      const message = `${toast.title}${
        toast.message ? '. ' + toast.message : ''
      }`;
      // announceForAccessibility available en ambos platforms; sin branch redundante
      AccessibilityInfo.announceForAccessibility(message);

      // Auto-dismiss
      if (toast.durationMs > 0) {
        const timer = setTimeout(() => {
          dismissToast(id);
          delete toastTimers.current[id];
        }, toast.durationMs);
        toastTimers.current[id] = timer;
      }

      return id;
    },
    [dismissToast],
  );

  const updateToast = useCallback((id: string, opts: Partial<ToastOptions>) => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, ...opts } : toast)),
    );
  }, []);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setConfirmState({ ...opts, visible: true });
  }, []);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => {
        return {
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: false,
          shouldShowList: false,
        };
      },
    });
  }, []);

  // Registrar el token cuando el usuario se autentica y al iniciar la app cuando la autenticación está presente
  useEffect(() => {
    let mounted = true;
    let appStateListener: { remove?: () => void } | null = null;

    // reintento exponencial simple
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    async function attemptRegister(tokenResult: {
      token?: string | null;
      platform?: string | null;
      appVersion?: string | null;
    }) {
      if (!tokenResult || !tokenResult.token) return;

      const lastRegistered = await SecureStore.getItemAsync(
        'last_registered_push_token',
      );
      if (tokenResult.token === lastRegistered) {
        // ya registrado localmente: actualizar llave por si cambió formato u otros metadatos
        await SecureStore.setItemAsync(
          'last_registered_push_token',
          tokenResult.token,
        );
        return;
      }

      // Intentos con backoff exponencial
      const maxAttempts = 3;
      let attempt = 0;
      let registered = false;

      while (attempt < maxAttempts && !registered) {
        try {
          // <-- USO DEL HELPER -->
          await buildAndRegisterPushToken(tokenResult.token);

          // Si se llegó aquí, registro OK
          await SecureStore.setItemAsync(
            'last_registered_push_token',
            tokenResult.token,
          );
          registered = true;
          console.log(
            '✅ Push token registrado (backend) en intento',
            attempt + 1,
          );
        } catch (err: any) {
          attempt += 1;
          // Si el backend devuelve 400 indicando token inválido, no reintentar: eliminar local y salir
          const status = err?.response?.status ?? null;
          const backendMsg = err?.response?.data ?? err?.message ?? null;

          if (status === 400) {
            console.warn(
              'Backend rechazó push token (400). Eliminando localmente y sin reintentos.',
              backendMsg,
            );
            await SecureStore.deleteItemAsync('last_registered_push_token');
            registered = true; // detener el loop
            break;
          }

          console.warn(
            `Error registrando push token, intento ${attempt}/${maxAttempts}`,
            err?.message ?? err,
          );

          // esperar backoff antes de reintentar (exponencial)
          const backoffMs = 500 * Math.pow(2, attempt - 1); // 500, 1000, 2000
          await wait(backoffMs);
        }
      }

      if (!registered) {
        console.warn(
          'No se pudo registrar push token tras varios intentos. Se intentará de nuevo en próxima reanudación.',
        );
      }
    }

    const registerToken = async () => {
      try {
        const projectId =
          (Constants as any)?.expoConfig?.extra?.eas?.projectId ||
          (Constants as any)?.easConfig?.projectId ||
          undefined;

        // obtén token desde expo-notifications
        const tokenResult = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : {},
        );

        if (!tokenResult || !(tokenResult as any).data) {
          // en algunas versiones token está en .data
          const token = (tokenResult as any).data ?? (tokenResult as any).token;
          if (!token) {
            console.debug('No se obtuvo Expo push token al registrar.');
            return;
          }
          await attemptRegister({ token });
          return;
        }

        // En versiones donde la respuesta viene en .data
        const token =
          (tokenResult as any).data ?? (tokenResult as any).token ?? null;

        if (!token) {
          console.debug('No se obtuvo Expo push token al registrar.');
          return;
        }

        await attemptRegister({ token });
      } catch (err) {
        console.warn('Error en registro automático de push token:', err);
      }
    };

    if (isAuthenticated && mounted) {
      // Registrar en cold start / login
      registerToken();

      // Re-registrar cuando la app vuelve a primer plano (posible que el token haya cambiado)
      appStateListener = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active' && isAuthenticated) {
          registerToken();
        }
      });
    }

    return () => {
      mounted = false;
      if (appStateListener && typeof appStateListener.remove === 'function') {
        appStateListener.remove();
      }
    };
  }, [isAuthenticated, user?.id]);

  // Listeners: received & response
  useEffect(() => {
    const notificationReceivedListener =
      Notifications.addNotificationReceivedListener((notification) => {
        const { title, body } = notification.request.content;
        showToast({
          type: 'info',
          title: (title as string) ?? 'Notificación',
          message: (body as string) ?? '',
          position: 'top',
        });
      });

    const notificationResponseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { notification } = response;
        const rawData = (notification.request.content as any).data ?? {};

        // Normalizar keys posibles (compatibilidad con backend)
        const type =
          rawData.type || rawData.eventType || rawData.notificationType || null;

        const id =
          rawData.alert_id ??
          rawData.alertId ??
          rawData.id ??
          rawData.resource_id ??
          null;

        try {
          if ((type === 'alerta' || type === 'alert') && id != null) {
            router.push({
              pathname: '/alerts/detail-alert',
              params: { id: String(id) },
            });
          } else if (type === 'avistamiento' && id) {
            router.push(`/sightings/${String(id)}`);
          } else if (type === 'solicitud' && id) {
            // ejemplo si quieres navegar a adopciones
            // router.push(`/adoption/requests/${String(id)}`);
            router.push('/settings/notifications');
          } else {
            // Fallback: ir al listado de notificaciones
            router.push('/settings/notifications');
          }
        } catch (err) {
          console.warn('Error navegando desde notificación:', err);
          router.push('/settings/notifications');
        }
      });

    return () => {
      notificationReceivedListener.remove();
      notificationResponseListener.remove();
    };
  }, [showToast]);

  const value = useMemo<NotificationContextType>(
    () => ({
      showToast,
      showSuccess: (title, message, opts) =>
        showToast({ type: 'success', title, message, ...(opts ?? {}) }),
      showError: (title, message, opts) =>
        showToast({ type: 'error', title, message, ...(opts ?? {}) }),
      showInfo: (title, message, opts) =>
        showToast({ type: 'info', title, message, ...(opts ?? {}) }),
      showWarning: (title, message, opts) =>
        showToast({ type: 'warning', title, message, ...(opts ?? {}) }),
      dismissToast,
      updateToast,
      confirm,
    }),
    [showToast, dismissToast, updateToast, confirm],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Toast UI */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          anim={toastAnimMap.current[toast.id]}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          actionLabel={toast.actionLabel}
          onActionPress={toast.onActionPress}
          onHide={() => dismissToast(toast.id)}
          position={toast.position}
          underHeader={toast.underHeader}
          tabBarHeight={toast.tabBarHeight}
          dismissible={toast.dismissible}
        />
      ))}

      {/* Confirm Dialog */}
      <ConfirmDialog
        visible={!!confirmState?.visible}
        title={confirmState?.title ?? ''}
        message={confirmState?.message}
        confirmLabel={confirmState?.confirmLabel ?? 'Confirmar'}
        cancelLabel={confirmState?.cancelLabel ?? 'Cancelar'}
        destructive={!!confirmState?.destructive}
        onConfirm={() => {
          confirmState?.onConfirm?.();
          setConfirmState(null);
        }}
        onCancel={() => {
          confirmState?.onCancel?.();
          setConfirmState(null);
        }}
      />
    </NotificationContext.Provider>
  );
};

/* ---------- Toast y Confirm UI (sin cambios funcionales) ---------- */
const colors = {
  bg: '#111827',
  text: '#F9FAFB',
  success: '#10B981',
  error: '#EF4444',
  info: '#3B82F6',
  warning: '#F59E0B',
  surface: '#1F2937',
  border: '#374151',
};

type ToastInnerProps = {
  anim: Animated.Value;
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

const Toast: React.FC<ToastInnerProps> = ({
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
  });
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
      : {
          bottom: insets.bottom + tabBarHeight + V_MARGIN,
          top: undefined,
        };

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

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View
        style={styles.dialogOverlayModal}
        accessibilityViewIsModal
        accessibilityLabel="Cuadro de confirmación"
        pointerEvents="auto"
      >
        <View style={styles.dialogCard}>
          <AppText style={styles.dialogTitle}>{title}</AppText>
          {!!message && (
            <AppText style={styles.dialogMessage}>{message}</AppText>
          )}
          <View style={styles.dialogActions}>
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.btn, styles.btnGhost]}
            >
              <AppText style={styles.btnGhostText}>{cancelLabel}</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={[
                styles.btn,
                destructive ? styles.btnDanger : styles.btnPrimary,
              ]}
            >
              <AppText style={styles.btnText}>{confirmLabel}</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
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
  toastMessage: { color: '#D1D5DB', marginTop: 2, fontSize: 13 },
  toastActions: { flexDirection: 'row', alignItems: 'center' },
  toastActionBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  toastActionText: { fontWeight: '700' },
  toastCloseBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  toastCloseText: { color: '#9CA3AF', fontSize: 16 },

  dialogOverlayModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 10000,
    ...Platform.select({
      android: { elevation: 10000 },
      ios: {},
    }),
  },

  dialogCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 14,
    backgroundColor: colors.surface,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dialogTitle: {
    color: colors.text,
    fontWeight: fontWeightBold,
    fontSize: 18,
  },
  dialogMessage: { color: '#D1D5DB', marginTop: 8, fontSize: 14 },
  dialogActions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  btnPrimary: { backgroundColor: colors.info },
  btnDanger: { backgroundColor: colors.error },
  btnText: {
    color: 'white',
    fontWeight: fontWeightSemiBold,
  },
  btnGhost: { backgroundColor: 'transparent' },
  btnGhostText: { color: '#D1D5DB', fontWeight: '700' },
});

export default NotificationProvider;
