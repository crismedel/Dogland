import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Animated, Easing } from 'react-native';

type ToastType = 'success' | 'error' | 'info' | 'warning';
type ToastOptions = {
  type?: ToastType;
  title: string;
  message?: string;
  durationMs?: number; // por defecto 3000
  actionLabel?: string;
  onActionPress?: () => void;
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
  showToast: (opts: ToastOptions) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  confirm: (opts: ConfirmOptions) => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

type ProviderProps = { children: React.ReactNode };

export const NotificationProvider: React.FC<ProviderProps> = ({ children }) => {
  // Toast state
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(
    null,
  );
  const [toastAnim] = useState(new Animated.Value(0));
  const [toastTimer, setToastTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [toastId, setToastId] = useState(0);

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<
    (ConfirmOptions & { visible: boolean }) | null
  >(null);

  const hideToast = useCallback(() => {
    Animated.timing(toastAnim, {
      toValue: 0,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => setToast(null));
  }, [toastAnim]);

  const showToast = useCallback(
    (opts: ToastOptions) => {
      // limpiar timer previo
      if (toastTimer) clearTimeout(toastTimer);

      const nextId = toastId + 1;
      setToastId(nextId);
      setToast({ ...opts, id: nextId, type: opts.type ?? 'info' });

      // animación in
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      const timeout = setTimeout(hideToast, opts.durationMs ?? 3000);
      setToastTimer(timeout);
    },
    [toastAnim, toastTimer, toastId, hideToast],
  );

  const confirm = useCallback((opts: ConfirmOptions) => {
    setConfirmState({ ...opts, visible: true });
  }, []);

  const value = useMemo<NotificationContextType>(
    () => ({
      showToast,
      showSuccess: (title, message) =>
        showToast({ type: 'success', title, message }),
      showError: (title, message) =>
        showToast({ type: 'error', title, message }),
      showInfo: (title, message) => showToast({ type: 'info', title, message }),
      showWarning: (title, message) =>
        showToast({ type: 'warning', title, message }),
      confirm,
    }),
    [showToast, confirm],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Toast UI */}
      <Toast
        visible={!!toast}
        anim={toastAnim}
        type={toast?.type ?? 'info'}
        title={toast?.title ?? ''}
        message={toast?.message}
        actionLabel={toast?.actionLabel}
        onActionPress={toast?.onActionPress}
        onHide={hideToast}
      />

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

// Toast & ConfirmDialog se implementan abajo
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';

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
  visible: boolean;
  anim: Animated.Value;
  type: ToastType;
  title: string;
  message?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  onHide: () => void;
};

const Toast: React.FC<ToastInnerProps> = ({
  visible,
  anim,
  type,
  title,
  message,
  actionLabel,
  onActionPress,
  onHide,
}) => {
  if (!visible) return null;

  const typeColor = {
    success: colors.success,
    error: colors.error,
    info: colors.info,
    warning: colors.warning,
  }[type];

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });
  const opacity = anim;

  return (
    <Animated.View
      style={[styles.toastContainer, { transform: [{ translateY }], opacity }]}
    >
      <View style={[styles.toastCard, { borderLeftColor: typeColor }]}>
        <View style={styles.toastContent}>
          <Text style={styles.toastTitle}>{title}</Text>
          {!!message && <Text style={styles.toastMessage}>{message}</Text>}
        </View>
        <View style={styles.toastActions}>
          {actionLabel && (
            <TouchableOpacity
              onPress={onActionPress}
              style={styles.toastActionBtn}
            >
              <Text style={[styles.toastActionText, { color: typeColor }]}>
                {actionLabel}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onHide} style={styles.toastCloseBtn}>
            <Text style={styles.toastCloseText}>✕</Text>
          </TouchableOpacity>
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
  if (!visible) return null;

  return (
    <View
      style={styles.dialogOverlay}
      accessibilityViewIsModal
      accessibilityLabel="Cuadro de confirmación"
    >
      <View style={styles.dialogCard}>
        <Text style={styles.dialogTitle}>{title}</Text>
        {!!message && <Text style={styles.dialogMessage}>{message}</Text>}
        <View style={styles.dialogActions}>
          <TouchableOpacity
            onPress={onCancel}
            style={[styles.btn, styles.btnGhost]}
          >
            <Text style={styles.btnGhostText}>{cancelLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onConfirm}
            style={[
              styles.btn,
              destructive ? styles.btnDanger : styles.btnPrimary,
            ]}
          >
            <Text style={styles.btnText}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 999,
  },
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
  toastTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  toastMessage: { color: '#D1D5DB', marginTop: 2, fontSize: 13 },
  toastActions: { flexDirection: 'row', alignItems: 'center' },
  toastActionBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  toastActionText: { fontWeight: '700' },
  toastCloseBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  toastCloseText: { color: '#9CA3AF', fontSize: 16 },

  dialogOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 1000,
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
  dialogTitle: { color: colors.text, fontWeight: '800', fontSize: 18 },
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
  btnText: { color: 'white', fontWeight: '700' },
  btnGhost: { backgroundColor: 'transparent' },
  btnGhostText: { color: '#D1D5DB', fontWeight: '700' },
});
