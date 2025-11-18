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

configureSpanishLocale();

interface DateTimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (dateTime: Date) => void;
  initialDateTime?: Date | string;
  title?: string;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  // theme?: 'light' | 'dark'; // 3. Se elimina la prop, usaremos el hook
  minuteStep?: number; // default 5
  mode?: 'date' | 'datetime'; // default 'datetime'
  theme?: 'light' | 'dark';
}

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialDateTime,
  title,
  minDate,
  maxDate,
  minuteStep = 5,
  mode = 'datetime',
}) => {
  // 4. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const displayTitle =
    title ||
    (mode === 'date' ? 'Seleccionar Fecha' : 'Seleccionar Fecha y Hora');

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

  // 5. Refactorizar calendarTheme para usar el hook y useMemo
  const calendarTheme = React.useMemo(
    () => ({
      backgroundColor: isDark ? colors.background : colors.cardBackground,
      calendarBackground: isDark ? colors.background : colors.cardBackground,
      textSectionTitleColor: colors.darkGray,
      selectedDayBackgroundColor: colors.primary,
      selectedDayTextColor: colors.text,
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

  const handleConfirm = () => {
    const [y, m, d] = selectedDay.split('-').map(Number);
    // If mode is 'date', set time to 00:00:00, otherwise use selected time
    const finalHour = mode === 'date' ? 0 : hour;
    const finalMinute = mode === 'date' ? 0 : minute;
    const finalDate = new Date(
      y,
      (m ?? 1) - 1,
      d ?? 1,
      finalHour,
      finalMinute,
      0,
      0,
    );

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
          {/* 6. Usar estilos dinámicos */}
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <AppText style={styles.title}>{displayTitle}</AppText>
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
              current={selectedDay}
              onDayPress={(day) => setSelectedDay(day.dateString)}
              markedDates={{
                [selectedDay]: {
                  selected: true,
                  selectedColor: colors.primary, // 6. Usar colores del tema
                },
              }}
              minDate={minDate}
              maxDate={maxDate}
              theme={calendarTheme}
              style={styles.calendar}
              enableSwipeMonths
            />

            {/* Time Picker inline - only show if mode is datetime */}
            {mode === 'datetime' && (
              <View style={styles.timeSection}>
                <AppText style={styles.timeLabel}>Hora</AppText>

                <View style={styles.timeRow}>
                  {/* Hour */}
                  <View style={styles.timeBox}>
                    <TouchableOpacity onPress={incHour} style={styles.timeBtn}>
                      <Ionicons
                        name="chevron-up"
                        size={20}
                        color={colors.darkGray} // 6. Usar colores del tema
                      />
                    </TouchableOpacity>
                    <AppText style={styles.timeValue}>{pad2(hour)}</AppText>
                    <TouchableOpacity onPress={decHour} style={styles.timeBtn}>
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={colors.darkGray} // 6. Usar colores del tema
                      />
                    </TouchableOpacity>
                  </View>

                  <AppText style={styles.colon}>:</AppText>

                  {/* Minute */}
                  <View style={styles.timeBox}>
                    <TouchableOpacity
                      onPress={incMinute}
                      style={styles.timeBtn}
                    >
                      <Ionicons
                        name="chevron-up"
                        size={20}
                        color={colors.darkGray} // 6. Usar colores del tema
                      />
                    </TouchableOpacity>
                    <AppText style={styles.timeValue}>{pad2(minute)}</AppText>
                    <TouchableOpacity
                      onPress={decMinute}
                      style={styles.timeBtn}
                    >
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={colors.darkGray} // 6. Usar colores del tema
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <AppText style={styles.cancelText}>Cancelar</AppText>
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

// 7. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
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
      backgroundColor: isDark ? colors.background : colors.cardBackground, // Dinámico
    },
    header: {
      padding: 20,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomColor: colors.gray, // Dinámico
    },
    title: {
      fontSize: 18,
      fontWeight: fontWeightBold,
      color: colors.text, // Dinámico
    },
    calendar: { paddingBottom: 10, backgroundColor: 'transparent' },
    timeSection: {
      paddingHorizontal: 16,
      paddingTop: 8,
      borderTopColor: colors.gray, // Dinámico
    },
    timeLabel: {
      fontSize: 15,
      fontWeight: fontWeightSemiBold,
      marginBottom: 8,
      color: colors.text, // Dinámico
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    timeBox: {
      width: 80,
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
      borderRadius: 10,
      alignItems: 'center',
      paddingVertical: 6,
      backgroundColor: colors.background, // Dinámico
    },
    timeBtn: { paddingVertical: 6, width: '100%', alignItems: 'center' },
    timeValue: {
      fontSize: 22,
      fontWeight: fontWeightBold,
      color: colors.text, // Dinámico
    },
    colon: {
      marginHorizontal: 10,
      fontSize: 24,
      fontWeight: '600',
      color: colors.darkGray, // Dinámico
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 12,
      borderTopWidth: 1,
      gap: 8,
      borderTopColor: colors.gray, // Dinámico
    },
    cancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
    cancelText: {
      fontSize: 15,
      fontWeight: fontWeightSemiBold,
      color: colors.darkGray, // Dinámico
    },
    confirmBtn: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: colors.primary, // Dinámico
      borderRadius: 10,
    },
    confirmText: {
      fontSize: 15,
      fontWeight: fontWeightSemiBold,
      color: colors.text, // Dinámico (para contraste con amarillo)
    },
  });
