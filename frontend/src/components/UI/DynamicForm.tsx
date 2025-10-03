import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from './CustomButton';
import { Colors } from '@/src/constants/colors';

export interface FormField {
  name: string;
  label: string;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  icon?: keyof typeof Ionicons.glyphMap; // 👈 campo opcional de ícono
}

interface DynamicFormProps {
  fields: FormField[];
  onSubmit: (values: Record<string, string>) => void;
  loading?: boolean;
  buttonText?: string;
  buttonIcon?: keyof typeof Ionicons.glyphMap;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  onSubmit,
  loading = false,
  buttonText = 'Acceder',
  buttonIcon,
}) => {
  const [values, setValues] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}),
  );

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(values);
  };

  return (
    <View style={styles.formContainer}>
      {fields.map((field) => (
        <View key={field.name} style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{field.label}</Text>
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
              onChangeText={(text) => handleChange(field.name, text)}
            />
          </View>
        </View>
      ))}

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
    padding: 20,
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  customButton: {
    marginTop: 20,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#FACC15', // Amarillo Dogland
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  customButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
});
