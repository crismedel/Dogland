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
import { Colors } from '@/src/constants/colors';
import { configureSpanishLocale } from '@/src/components/UI/calendary/Calendary';

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
  theme?: 'light' | 'dark';
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  visible,
  onClose,
  onDateSelect,
  selectedDate,
  title = 'Seleccionar Fecha',
  minDate,
  maxDate,
  theme = 'light',
}) => {
  const getDateString = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  };

  const isDarkTheme = theme === 'dark';

  const calendarTheme = {
    backgroundColor: isDarkTheme ? '#1F2937' : '#FFFFFF',
    calendarBackground: isDarkTheme ? '#1F2937' : '#FFFFFF',
    textSectionTitleColor: isDarkTheme ? '#9CA3AF' : '#6B7280',
    selectedDayBackgroundColor: Colors.primary || '#FACC15',
    selectedDayTextColor: '#111827',
    todayTextColor: Colors.primary || '#FACC15',
    dayTextColor: isDarkTheme ? '#F9FAFB' : '#1F2937',
    textDisabledColor: isDarkTheme ? '#4B5563' : '#D1D5DB',
    monthTextColor: isDarkTheme ? '#F9FAFB' : '#111827',
    textMonthFontWeight: 'bold' as const,
    textDayFontSize: 15,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 13,
    arrowColor: isDarkTheme ? '#F9FAFB' : '#111827',
  };

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
          <View
            style={[
              styles.calendarContainer,
              isDarkTheme && styles.calendarContainerDark,
            ]}
          >
            {/* Header */}
            <View
              style={[
                styles.calendarHeader,
                isDarkTheme && styles.calendarHeaderDark,
              ]}
            >
              <AppText
                style={[
                  styles.calendarTitle,
                  isDarkTheme && styles.calendarTitleDark,
                ]}
              >
                {title}
              </AppText>
              <TouchableOpacity onPress={onClose}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDarkTheme ? '#9CA3AF' : '#6B7280'}
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
                  selectedColor: Colors.primary || '#FACC15',
                },
              }}
              minDate={minDate}
              maxDate={maxDate}
              theme={calendarTheme}
              style={styles.calendar}
              enableSwipeMonths={true}
            />

            {/* Actions */}
            <View
              style={[
                styles.calendarActions,
                isDarkTheme && styles.calendarActionsDark,
              ]}
            >
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <AppText
                  style={[
                    styles.cancelButtonText,
                    isDarkTheme && styles.cancelButtonTextDark,
                  ]}
                >
                  Cancelar
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default CustomCalendar;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContainer: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    width: Math.min(Dimensions.get('window').width - 40, 360),
    maxWidth: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calendarContainerDark: {
    backgroundColor: Colors.text,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary,
  },
  calendarHeaderDark: {
    borderBottomColor: '#374151',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: fontWeightBold,
    color: Colors.text,
  },
  calendarTitleDark: {
    color: '#F9FAFB',
  },
  calendar: {
    paddingBottom: 10,
  },
  calendarActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  calendarActionsDark: {
    borderTopColor: Colors.text,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: fontWeightSemiBold,
    color: '#6B7280',
  },
  cancelButtonTextDark: {
    color: '#9CA3AF',
  },
});
