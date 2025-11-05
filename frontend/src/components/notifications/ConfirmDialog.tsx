import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  AppText,
  fontWeightBold,
  fontWeightSemiBold,
} from '@/src/components/AppText';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const { width, height } = Dimensions.get('window');

const ConfirmDialog: React.FC<Props> = ({
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

const colors = {
  surface: '#1F2937',
  text: '#F9FAFB',
  border: '#374151',
  info: '#3B82F6',
  error: '#EF4444',
};

const styles = StyleSheet.create({
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
  btnText: { color: 'white', fontWeight: fontWeightSemiBold },
  btnGhost: { backgroundColor: 'transparent' },
  btnGhostText: { color: '#D1D5DB', fontWeight: '700' },
});

export default ConfirmDialog;
