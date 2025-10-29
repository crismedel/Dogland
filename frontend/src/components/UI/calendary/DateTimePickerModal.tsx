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

configureSpanishLocale();

interface DateTimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (dateTime: Date) => void;
  initialDateTime?: Date | string;
  title?: string;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  theme?: 'light' | 'dark';
  minuteStep?: number; // default 5
}

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialDateTime,
  title = 'Seleccionar Fecha y Hora',
  minDate,
  maxDate,
  theme = 'light',
  minuteStep = 5,
}) => {
  const isDarkTheme = theme === 'dark';

  const initial = React.useMemo(() => {
    const d =
      typeof initialDateTime === 'string'
        ? new Date(initialDateTime)
        : initialDateTime ?? new Date();
    const base = d instanceof Date && !isNaN(d.getTime()) ? d : new Date();
    return base;
  }, [initialDateTime]);

  const [selectedDay, setSelectedDay] = React.useState<string>(
    initial.toISOString().split('T')[0],
  );
  const [hour, setHour] = React.useState<number>(initial.getHours());
  const [minute, setMinute] = React.useState<number>(
    initial.getMinutes() - (initial.getMinutes() % minuteStep),
  );

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

  const handleConfirm = () => {
    const [y, m, d] = selectedDay.split('-').map(Number);
    const finalDate = new Date(y, (m ?? 1) - 1, d ?? 1, hour, minute, 0, 0);

    if (minDate) {
      const [yMin, mMin, dMin] = minDate.split('-').map(Number);
      const min = new Date(yMin, (mMin ?? 1) - 1, dMin ?? 1, 0, 0, 0, 0);
      if (finalDate < min) return;
    }
    if (maxDate) {
      const [yMax, mMax, dMax] = maxDate.split('-').map(Number);
      const max = new Date(yMax, (mMax ?? 1) - 1, dMax ?? 1, 23, 59, 59, 999);
      if (finalDate > max) return;
    }

    onConfirm(finalDate);
    onClose();
  };

  const incHour = () => setHour((h) => (h + 1) % 24);
  const decHour = () => setHour((h) => (h + 23) % 24);
  const incMinute = () => setMinute((m) => (m + minuteStep) % 60);
  const decMinute = () => setMinute((m) => (m + 60 - minuteStep) % 60);

  return (
    <Modal
      visible={visible}
      transparent
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
              styles.container,
              {
                backgroundColor: isDarkTheme ? Colors.text : Colors.background,
              },
            ]}
          >
            {/* Header */}
            <View
              style={[
                styles.header,
                {
                  borderBottomColor: isDarkTheme ? '#374151' : Colors.secondary,
                },
              ]}
            >
              <AppText
                style={[
                  styles.title,
                  { color: isDarkTheme ? '#F9FAFB' : Colors.text },
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
              current={selectedDay}
              onDayPress={(day) => setSelectedDay(day.dateString)}
              markedDates={{
                [selectedDay]: {
                  selected: true,
                  selectedColor: Colors.primary || '#FACC15',
                },
              }}
              minDate={minDate}
              maxDate={maxDate}
              theme={calendarTheme}
              style={styles.calendar}
              enableSwipeMonths
            />

            {/* Time Picker inline */}
            <View
              style={[
                styles.timeSection,
                { borderTopColor: isDarkTheme ? Colors.text : '#E5E7EB' },
              ]}
            >
              <AppText
                style={[
                  styles.timeLabel,
                  { color: isDarkTheme ? '#E5E7EB' : '#374151' },
                ]}
              >
                Hora
              </AppText>

              <View style={styles.timeRow}>
                {/* Hour */}
                <View style={styles.timeBox}>
                  <TouchableOpacity onPress={incHour} style={styles.timeBtn}>
                    <Ionicons name="chevron-up" size={20} color="#6B7280" />
                  </TouchableOpacity>
                  <AppText style={styles.timeValue}>{pad2(hour)}</AppText>
                  <TouchableOpacity onPress={decHour} style={styles.timeBtn}>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <AppText style={styles.colon}>:</AppText>

                {/* Minute */}
                <View style={styles.timeBox}>
                  <TouchableOpacity onPress={incMinute} style={styles.timeBtn}>
                    <Ionicons name="chevron-up" size={20} color="#6B7280" />
                  </TouchableOpacity>
                  <AppText style={styles.timeValue}>{pad2(minute)}</AppText>
                  <TouchableOpacity onPress={decMinute} style={styles.timeBtn}>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View
              style={[
                styles.actions,
                { borderTopColor: isDarkTheme ? Colors.text : '#E5E7EB' },
              ]}
            >
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <AppText
                  style={[
                    styles.cancelText,
                    { color: isDarkTheme ? '#9CA3AF' : '#6B7280' },
                  ]}
                >
                  Cancelar
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirm}
              >
                <AppText style={styles.confirmText}>Confirmar</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default DateTimePickerModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    borderRadius: 20,
    width: Math.min(Dimensions.get('window').width - 40, 380),
    maxWidth: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: fontWeightBold },
  calendar: { paddingBottom: 10, backgroundColor: 'transparent' },
  timeSection: { paddingHorizontal: 16, paddingTop: 8 },
  timeLabel: { fontSize: 15, fontWeight: fontWeightSemiBold, marginBottom: 8 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  timeBox: {
    width: 80,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: '#FFF',
  },
  timeBtn: { paddingVertical: 6, width: '100%', alignItems: 'center' },
  timeValue: { fontSize: 22, fontWeight: fontWeightBold, color: '#111827' },
  colon: { marginHorizontal: 10, fontSize: 24, fontWeight: '600' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelText: { fontSize: 15, fontWeight: fontWeightSemiBold },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary || '#FACC15',
    borderRadius: 10,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: fontWeightSemiBold,
    color: '#111827',
  },
});
