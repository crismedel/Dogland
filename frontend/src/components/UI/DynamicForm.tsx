import {
  AppText,
  fontWeightMedium,
  fontWeightSemiBold
} from '@/src/components/AppText';
import { Colors } from '@/src/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardTypeOptions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import CustomCalendar from './calendary/CustomCalendar';
import DateTimePickerModal from './calendary/DateTimePickerModal';
import CustomButton from './CustomButton';
import CustomPicker from './CustomPicker';
import TimePickerInline from './TimePickerInline';


export interface FormField {
  name: string;
  label: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  type:
    | 'text'
    | 'password'
    | 'email'
    | 'phone'
    | 'date'
    | 'picker'
    | 'location';
  options?: { label: string; value: any }[];
  minDate?: string;
  maxDate?: string;
  calendarTheme?: 'light' | 'dark';
  onLocationPress?: () => void;
  onLocationClear?: () => void;
  formatLocation?: (value: any) => string | null;

  // Nuevas props para fecha/hora
  dateMode?: 'date' | 'time' | 'datetime'; // default 'date'
  timeStep?: number; // minutos (default 5)
  useNativeTimePicker?: boolean; // para time mode si usas nativo
  dateFormat?: (value: Date | string) => string; // formateador custom
  maxLength?: number; 
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
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleSubmit = () => {
    onSubmit(values);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDateTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${formatDate(d)} ${formatTime(d)}`;
  };

  const ensureDate = (v: any) => {
    if (v instanceof Date) return v;
    if (typeof v === 'string') {
      const d = new Date(v);
      return isNaN(d.getTime()) ? new Date() : d;
    }
    return new Date();
  };

  return (
    <View style={styles.formContainer}>
      {fields.map((field) => {
        const isLoadingField = loadingFields[field.name] || false;

        if (field.type === 'picker') {
          return (
            <View key={field.name} style={styles.inputContainer}>
              <AppText style={styles.inputLabel}>{field.label}</AppText>
              {isLoadingField ? (
                <View style={[styles.inputWrapper, styles.disabled]}>
                  {field.icon && (
                    <Ionicons
                      name={field.icon}
                      size={20}
                      color="#9CA3AF"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <ActivityIndicator
                    size="small"
                    color={Colors.background}
                    style={{ flex: 1 }}
                  />
                </View>
              ) : (
                <CustomPicker
                  options={field.options || []}
                  selectedValue={values[field.name]}
                  onValueChange={(itemValue) =>
                    onValueChange(field.name, itemValue)
                  }
                  placeholder={field.placeholder || field.label}
                  icon={field.icon}
                  disabled={isLoadingField}
                />
              )}
            </View>
          );
        }

        if (field.type === 'date') {
          const mode = field.dateMode ?? 'date';
          const value = values[field.name];
          const show = activeField === field.name;
          const minuteStep = field.timeStep ?? 5;

          if (mode === 'date') {
            return (
              <View key={field.name} style={styles.inputContainer}>
                <AppText style={styles.inputLabel}>{field.label}</AppText>
                <TouchableOpacity
                  onPress={() => setActiveField(field.name)}
                  activeOpacity={0.7}
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
                    <AppText
                      style={[styles.textInput, !value && { color: '#9CA3AF' }]}
                    >
                      {value
                        ? field.dateFormat
                          ? field.dateFormat(value)
                          : formatDate(value)
                        : field.placeholder || 'Seleccionar fecha'}
                    </AppText>
                  </View>
                </TouchableOpacity>

                <CustomCalendar
                  visible={show}
                  onClose={() => setActiveField(null)}
                  onDateSelect={(date) => onValueChange(field.name, date)}
                  selectedDate={value}
                  title={field.label}
                  minDate={field.minDate}
                  maxDate={field.maxDate}
                  theme={field.calendarTheme || 'light'}
                />
              </View>
            );
          }

          if (mode === 'time') {
            return (
              <View key={field.name} style={styles.inputContainer}>
                <AppText style={styles.inputLabel}>{field.label}</AppText>
                <TouchableOpacity
                  onPress={() => setActiveField(field.name)}
                  activeOpacity={0.7}
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
                    <AppText
                      style={[styles.textInput, !value && { color: '#9CA3AF' }]}
                    >
                      {value
                        ? field.dateFormat
                          ? field.dateFormat(value)
                          : formatTime(value)
                        : field.placeholder || 'Seleccionar hora'}
                    </AppText>
                  </View>
                </TouchableOpacity>

                {/* Modal para hora simple */}
                {show && (
                  <View
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: '#FFF',
                        borderRadius: 16,
                        padding: 16,
                        width: '85%',
                      }}
                    >
                      <AppText
                        style={{
                          fontWeight: fontWeightSemiBold,
                          fontSize: 16,
                          marginBottom: 8,
                        }}
                      >
                        {field.label}
                      </AppText>

                      {field.useNativeTimePicker ? (
                        // Para usar el nativo, descomenta y asegúrate de instalar la librería
                        // <DateTimePicker
                        //   value={ensureDate(value)}
                        //   mode="time"
                        //   display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        //   is24Hour
                        //   onChange={(_, date) => {
                        //     if (date) onValueChange(field.name, date);
                        //   }}
                        // />
                        <AppText>
                          Habilita el selector nativo instalando
                          @react-native-community/datetimepicker y descomentando
                          el código.
                        </AppText>
                      ) : (
                        <TimePickerInline
                          value={ensureDate(value)}
                          minuteStep={minuteStep}
                          onChange={(d) => onValueChange(field.name, d)}
                        />
                      )}

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          marginTop: 8,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => setActiveField(null)}
                          style={{ padding: 10 }}
                        >
                          <AppText
                            style={{
                              color: '#6B7280',
                              fontWeight: fontWeightSemiBold,
                            }}
                          >
                            Cerrar
                          </AppText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            );
          }

          // mode === 'datetime'
          return (
            <View key={field.name} style={styles.inputContainer}>
              <AppText style={styles.inputLabel}>{field.label}</AppText>
              <TouchableOpacity
                onPress={() => setActiveField(field.name)}
                activeOpacity={0.7}
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
                  <AppText
                    style={[styles.textInput, !value && { color: '#9CA3AF' }]}
                  >
                    {value
                      ? field.dateFormat
                        ? field.dateFormat(value)
                        : formatDateTime(value)
                      : field.placeholder || 'Seleccionar fecha y hora'}
                  </AppText>
                </View>
              </TouchableOpacity>

              <DateTimePickerModal
                visible={activeField === field.name}
                onClose={() => setActiveField(null)}
                onConfirm={(dt) => onValueChange(field.name, dt)}
                initialDateTime={value ?? new Date()}
                minDate={field.minDate}
                maxDate={field.maxDate}
                title={field.label}
                theme={field.calendarTheme || 'light'}
                minuteStep={minuteStep}
              />
            </View>
          );
        }

        if (field.type === 'location') {
          return (
            <View key={field.name} style={styles.inputContainer}>
              <AppText style={styles.inputLabel}>{field.label}</AppText>
              <TouchableOpacity
                onPress={field.onLocationPress}
                activeOpacity={0.7}
                disabled={isLoadingField}
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
                  <AppText
                    style={[
                      styles.textInput,
                      !values[field.name] && { color: '#9CA3AF' },
                    ]}
                  >
                    {isLoadingField
                      ? 'Obteniendo ubicación...'
                      : values[field.name] && field.formatLocation
                      ? field.formatLocation(values[field.name])
                      : field.placeholder}
                  </AppText>
                </View>
              </TouchableOpacity>

              {values[field.name] && field.onLocationClear && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={field.onLocationClear}
                >
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={Colors.danger}
                  />
                  <AppText style={styles.clearButtonText}>
                    Limpiar ubicación
                  </AppText>
                </TouchableOpacity>
              )}
            </View>
          );
        }

        // Text / email / phone
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
                maxLength={field.maxLength}
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
  formContainer: { width: '100%' },
  inputContainer: { marginBottom: 18 },
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
  textInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1F2937' },
  disabled: { backgroundColor: '#F3F4F6' },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearButtonText: {
    color: Colors.danger,
    fontSize: 12,
    marginLeft: 4,
    textDecorationLine: 'underline',
    fontWeight: fontWeightMedium,
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
