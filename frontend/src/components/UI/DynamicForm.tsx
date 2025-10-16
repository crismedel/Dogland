import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from './CustomButton';
import { Colors } from '@/src/constants/colors';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

export interface FormField {
  name: string;
  label: string;
  placeholder?: string; //opcional
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  icon?: keyof typeof Ionicons.glyphMap; // 👈 campo opcional de ícono
  type: 'text' | 'password' | 'email' | 'phone' | 'date' | 'picker';
  options?: { label: string; value: any }[];
}

interface DynamicFormProps {
  fields: FormField[];
  onSubmit: (values: Record<string, any>) => void;
  loading?: boolean;
  buttonText?: string;
  buttonIcon?: keyof typeof Ionicons.glyphMap;
  values: Record<string, any>;
  onValueChange: (name: string, value: any) => void;
  loadingFields?: Record<string, boolean>;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  onSubmit,
  loading = false,
  buttonText = 'Acceder',
  buttonIcon,
  values,
  onValueChange,
  loadingFields = {},
}) => {
  const [showDatePickerFor, setShowDatePickerFor] = useState<string | null>(
    null,
  );

  const handleSubmit = () => {
    onSubmit(values);
  };

  return (
    <View style={styles.formContainer}>
      {fields.map((field) => {
        const isLoadingField = loadingFields[field.name] || false;

        if (field.type === 'picker') {
          return (
            <View key={field.name} style={styles.inputContainer}>
              <AppText style={styles.inputLabel}>{field.label}</AppText>
              <View
                style={[styles.inputWrapper, isLoadingField && styles.disabled]}
              >
                {field.icon && (
                  <Ionicons
                    name={field.icon}
                    size={20}
                    color="#9CA3AF"
                    style={{ marginRight: 8 }}
                  />
                )}
                {isLoadingField ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.background}
                    style={{ flex: 1 }}
                  />
                ) : (
                  <Picker
                    selectedValue={values[field.name]}
                    onValueChange={(itemValue) =>
                      onValueChange(field.name, itemValue)
                    }
                    style={styles.picker}
                    enabled={!isLoadingField}
                  >
                    {field.options?.map((opt) => (
                      <Picker.Item
                        key={String(opt.value)}
                        label={opt.label}
                        value={opt.value}
                      />
                    ))}
                  </Picker>
                )}
              </View>
            </View>
          );
        }

        if (field.type === 'date') {
          return (
            <View key={field.name} style={styles.inputContainer}>
              <AppText style={styles.inputLabel}>{field.label}</AppText>
              <TouchableOpacity
                onPress={() => setShowDatePickerFor(field.name)}
              >
                <View style={styles.inputWrapper}>
                  {field.icon && (
                    <Ionicons
                      name={field.icon}
                      size={20}
                      color="#9CA3AF"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <AppText style={styles.textInput}>
                    {values[field.name]
                      ? new Date(values[field.name]).toLocaleDateString('es-CL')
                      : field.placeholder}
                  </AppText>
                </View>
              </TouchableOpacity>
              {showDatePickerFor === field.name && (
                <DateTimePicker
                  value={
                    values[field.name]
                      ? new Date(values[field.name])
                      : new Date()
                  }
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePickerFor(null);
                    if (selectedDate) {
                      onValueChange(field.name, selectedDate);
                    }
                  }}
                />
              )}
            </View>
          );
        }

        return (
          <View key={field.name} style={styles.inputContainer}>
            <AppText style={styles.inputLabel}>{field.label}</AppText>
            <View style={styles.inputWrapper}>
              {field.icon && (
                <Ionicons
                  name={field.icon}
                  size={20}
                  color="#9CA3AF"
                  style={{ marginRight: 8 }}
                />
              )}
              <TextInput
                style={[
                  styles.textInput,
                  field.multiline && {
                    height: field.numberOfLines ? field.numberOfLines * 20 : 80,
                    textAlignVertical: 'top',
                  },
                ]}
                placeholder={field.placeholder}
                placeholderTextColor="#9CA3AF"
                keyboardType={field.keyboardType || 'default'}
                secureTextEntry={field.secureTextEntry || false}
                autoCapitalize={field.autoCapitalize || 'sentences'}
                multiline={field.multiline || false}
                numberOfLines={field.numberOfLines}
                value={values[field.name]}
                onChangeText={(text) => onValueChange(field.name, text)}
              />
            </View>
          </View>
        );
      })}

      {/* Botón principal */}
      <CustomButton
        title={buttonText}
        onPress={handleSubmit}
        variant="primary"
        icon={buttonIcon}
        loading={loading}
        style={styles.customButton}
        textStyle={styles.customButtonText}
      />
    </View>
  );
};

export default DynamicForm;

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
    // padding: 20, // Es mejor manejar el padding en la pantalla que usa el formulario.
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: fontWeightMedium,
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    paddingHorizontal: 12,
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  picker: {
    flex: 1,
    color: '#1F2937',
    marginVertical: Platform.OS === 'ios' ? -10 : 0,
  },
  disabled: {
    backgroundColor: '#F3F4F6',
  },
  customButton: {
    marginTop: 20,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#FACC15',
  },
  customButtonText: {
    fontSize: 18,
    fontWeight: fontWeightSemiBold,
    color: '#111827',
    textAlign: 'center',
  },
});
