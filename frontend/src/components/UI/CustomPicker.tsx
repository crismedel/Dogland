import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import {
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

interface PickerOption {
  label: string;
  value: any;
}

interface CustomPickerProps {
  options: PickerOption[];
  selectedValue: any;
  onValueChange: (value: any) => void;
  placeholder?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Seleccionar',
  icon,
  disabled = false,
}) => {
  // 3. Llamar al hook y generar los estilos
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const displayText = selectedOption?.label || placeholder;
  const isPlaceholder = !selectedOption || selectedOption.value === null;

  return (
    <>
      <TouchableOpacity
        onPress={() => !disabled && setModalVisible(true)}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <View style={[styles.pickerButton, disabled && styles.disabled]}>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={colors.darkGray} // 4. Usar colores del tema
              style={{ marginRight: 8 }}
            />
          )}
          <AppText
            style={[
              styles.pickerButtonText,
              isPlaceholder && styles.placeholderText,
            ]}
          >
            {displayText}
          </AppText>
          <Ionicons
            name="chevron-down"
            size={20}
            color={colors.darkGray} // 4. Usar colores del tema
            style={{ marginLeft: 'auto' }}
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>{placeholder}</AppText>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={colors.darkGray} // 4. Usar colores del tema
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsList}>
              {options.map((option, index) => {
                const isSelected = option.value === selectedValue;
                const isDisabled = option.value === null;

                return (
                  <TouchableOpacity
                    key={`${option.value}-${index}`}
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemSelected,
                      isDisabled && styles.optionItemDisabled,
                    ]}
                    onPress={() => {
                      if (!isDisabled) {
                        onValueChange(option.value);
                        setModalVisible(false);
                      }
                    }}
                    disabled={isDisabled}
                  >
                    <AppText
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                        isDisabled && styles.optionTextDisabled,
                      ]}
                    >
                      {option.label}
                    </AppText>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={colors.primary} // 4. Usar colores del tema
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default CustomPicker;

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType) =>
  StyleSheet.create({
    pickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground, // Dinámico
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.secondary, // Dinámico
      paddingHorizontal: 12,
      minHeight: 50,
    },
    pickerButtonText: {
      flex: 1,
      fontSize: 15,
      color: colors.text, // Dinámico
      paddingVertical: 14,
    },
    placeholderText: {
      color: colors.darkGray, // Dinámico
    },
    disabled: {
      backgroundColor: colors.backgroundSecon, // Dinámico
      opacity: 0.6,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.cardBackground, // Dinámico
      borderRadius: 20,
      width: '85%',
      maxHeight: '70%',
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray, // Dinámico
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: fontWeightSemiBold,
      color: colors.text, // Dinámico
    },
    closeButton: {
      padding: 4,
    },
    optionsList: {
      maxHeight: 400,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray, // Dinámico
    },
    optionItemSelected: {
      backgroundColor: `${colors.primary}30`, // Dinámico (light yellow)
    },
    optionItemDisabled: {
      opacity: 0.5,
    },
    optionText: {
      fontSize: 16,
      color: colors.text, // Dinámico
      fontWeight: fontWeightMedium,
    },
    optionTextSelected: {
      color: colors.text, // Dinámico
      fontWeight: fontWeightSemiBold,
    },
    optionTextDisabled: {
      color: colors.darkGray, // Dinámico
    },
  });