import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { AppText, fontWeightBold, fontWeightSemiBold } from '../../AppText';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import { configureSpanishLocale } from '@/src/components/UI/calendary/Calendary';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

// Configurar el calendario en español
configureSpanishLocale();

interface CustomCalendarProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate?: Date | string;
  title?: string;
  minDate?: string;
  maxDate?: string;
  // 3. Eliminar la prop de theme
  // theme?: 'light' | 'dark';
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  visible,
  onClose,
  onDateSelect,
  selectedDate,
  title = 'Seleccionar Fecha',
  minDate,
  maxDate,
  // 3. Eliminar la prop de theme
}) => {
  // 4. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const getDateString = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  };

  // 5. Refactorizar calendarTheme para usar el hook y useMemo
  const calendarTheme = React.useMemo(
    () => ({
      backgroundColor: isDark ? colors.background : colors.cardBackground,
      calendarBackground: isDark ? colors.background : colors.cardBackground,
      textSectionTitleColor: colors.darkGray,
      selectedDayBackgroundColor: colors.primary,
      selectedDayTextColor: isDark ? colors.lightText : colors.text, // Texto oscuro en fondo amarillo
      todayTextColor: colors.primary,
      dayTextColor: colors.text,
      textDisabledColor: colors.gray,
      monthTextColor: colors.text,
      textMonthFontWeight: 'bold' as const,
      textDayFontSize: 15,
      textMonthFontSize: 18,
      textDayHeaderFontSize: 13,
      arrowColor: colors.text,
    }),
    [colors, isDark],
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* 6. Usar estilos dinámicos */}
          <View style={styles.calendarContainer}>
            {/* Header */}
            <View style={styles.calendarHeader}>
              <AppText style={styles.calendarTitle}>{title}</AppText>
              <TouchableOpacity onPress={onClose}>
                <Ionicons
                  name="close"
                  size={24}
                  color={colors.darkGray} // 6. Usar colores del tema
                />
              </TouchableOpacity>
            </View>

            {/* Calendar */}
            <Calendar
              current={selectedDate ? getDateString(selectedDate) : undefined}
              onDayPress={(day) => {
                onDateSelect(new Date(day.dateString));
                onClose();
              }}
              markedDates={{
                [selectedDate ? getDateString(selectedDate) : '']: {
                  selected: true,
                  selectedColor: colors.primary, // 6. Usar colores del tema
                },
              }}
              minDate={minDate}
              maxDate={maxDate}
              theme={calendarTheme}
              style={styles.calendar}
              enableSwipeMonths={true}
            />

            {/* Actions */}
            <View style={styles.calendarActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <AppText style={styles.cancelButtonText}>Cancelar</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default CustomCalendar;

// 7. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    calendarContainer: {
      backgroundColor: isDark ? colors.background : colors.cardBackground, // Dinámico
      borderRadius: 20,
      width: Math.min(Dimensions.get('window').width - 40, 360),
      maxWidth: '100%',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.secondary, // Dinámico
    },
    calendarTitle: {
      fontSize: 18,
      fontWeight: fontWeightBold,
      color: colors.text, // Dinámico
    },
    calendar: {
      paddingBottom: 10,
    },
    calendarActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.gray, // Dinámico
    },
    cancelButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    cancelButtonText: {
      fontSize: 15,
      fontWeight: fontWeightSemiBold,
      color: colors.darkGray, // Dinámico
    },
  });