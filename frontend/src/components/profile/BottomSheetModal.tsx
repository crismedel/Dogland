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
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import { fontWeightBold, AppText } from '@/src/components/AppText';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

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
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

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

// 4. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    bottomSheetContainer: {
      backgroundColor: colors.cardBackground, // Dinámico
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: SCREEN_HEIGHT * 0.75,
      paddingBottom: 20,
    },
    handleBar: {
      width: 40,
      height: 4,
      backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', // Dinámico
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
      borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', // Dinámico
    },
    bottomSheetTitle: {
      fontSize: 16,
      fontWeight: fontWeightBold,
      color: colors.secondary, // Dinámico
    },
    closeButton: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 20,
      color: colors.darkGray, // Dinámico
      fontWeight: fontWeightBold,
    },
    bottomSheetContent: {
      paddingHorizontal: 20,
      paddingTop: 18,
    },
  });