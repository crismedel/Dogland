// CustomPicker.tsx
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
import { Colors } from '@/src/constants/colors';
import {
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

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
              color="#9CA3AF"
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
            color="#9CA3AF"
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
                <Ionicons name="close" size={24} color="#6B7280" />
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
                        color={Colors.primary}
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

const styles = StyleSheet.create({
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    paddingHorizontal: 12,
    minHeight: 50,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    paddingVertical: 14,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  disabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.cardBackground,
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
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: fontWeightSemiBold,
    color: '#111827',
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
    borderBottomColor: '#F3F4F6',
  },
  optionItemSelected: {
    backgroundColor: '#FEF3C7',
  },
  optionItemDisabled: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: fontWeightMedium,
  },
  optionTextSelected: {
    color: '#111827',
    fontWeight: fontWeightSemiBold,
  },
  optionTextDisabled: {
    color: '#9CA3AF',
  },
});
