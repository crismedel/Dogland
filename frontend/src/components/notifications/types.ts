import { Animated } from 'react-native';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastPosition = 'top' | 'bottom';

export type ToastOptions = {
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

export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

export type RequiredToast = Required<ToastOptions>;

export type NotificationContextType = {
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

export type AnimValue = Animated.Value;
