// BottomSheetModal.tsx
import React from 'react';
import {
  Modal,
  Animated,
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '@/src/constants/colors';
import { fontWeightBold, AppText } from '@/src/components/AppText';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function BottomSheetModal({
  visible,
  onClose,
  title,
  children,
}: BottomSheetModalProps) {
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.bottomSheetContainer,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              <View style={styles.handleBar} />

              <View style={styles.bottomSheetHeader}>
                <AppText style={styles.bottomSheetTitle}>{title}</AppText>
                <Pressable onPress={onClose} style={styles.closeButton}>
                  <AppText style={styles.closeButtonText}>✕</AppText>
                </Pressable>
              </View>

              <ScrollView
                style={styles.bottomSheetContent}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#FFFDF4',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.75,
    paddingBottom: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(107,114,128,0.18)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  bottomSheetTitle: {
    fontSize: 16,
    fontWeight: fontWeightBold,
    color: Colors.secondary,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.darkGray,
    fontWeight: fontWeightBold,
  },
  bottomSheetContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
});
