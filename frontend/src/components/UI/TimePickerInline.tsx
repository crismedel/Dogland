import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  AppText,
  fontWeightSemiBold,
  fontWeightBold,
} from '@/src/components/AppText';

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

interface TimePickerInlineProps {
  value?: Date;
  onChange: (date: Date) => void;
  minuteStep?: number; // default 5
}

const TimePickerInline: React.FC<TimePickerInlineProps> = ({
  value,
  onChange,
  minuteStep = 5,
}) => {
  const base = React.useMemo(
    () => (value ? new Date(value) : new Date()),
    [value],
  );
  const [hour, setHour] = React.useState<number>(base.getHours());
  const [minute, setMinute] = React.useState<number>(
    base.getMinutes() - (base.getMinutes() % minuteStep),
  );

  React.useEffect(() => {
    const d = value ? new Date(value) : new Date();
    d.setHours(hour, minute, 0, 0);
    onChange(d);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hour, minute]);

  const incHour = () => setHour((h) => (h + 1) % 24);
  const decHour = () => setHour((h) => (h + 23) % 24);
  const incMinute = () => setMinute((m) => (m + minuteStep) % 60);
  const decMinute = () => setMinute((m) => (m + 60 - minuteStep) % 60);

  return (
    <View style={styles.row}>
      <View style={styles.box}>
        <TouchableOpacity onPress={incHour} style={styles.btn}>
          <Ionicons name="chevron-up" size={20} color="#6B7280" />
        </TouchableOpacity>
        <AppText style={styles.value}>{pad2(hour)}</AppText>
        <TouchableOpacity onPress={decHour} style={styles.btn}>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <AppText style={styles.colon}>:</AppText>

      <View style={styles.box}>
        <TouchableOpacity onPress={incMinute} style={styles.btn}>
          <Ionicons name="chevron-up" size={20} color="#6B7280" />
        </TouchableOpacity>
        <AppText style={styles.value}>{pad2(minute)}</AppText>
        <TouchableOpacity onPress={decMinute} style={styles.btn}>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TimePickerInline;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  box: {
    width: 90,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 6,
  },
  btn: { paddingVertical: 6, width: '100%', alignItems: 'center' },
  value: { fontSize: 22, fontWeight: fontWeightBold, color: '#111827' },
  colon: { fontSize: 22, fontWeight: fontWeightSemiBold },
});
