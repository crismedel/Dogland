import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { AppText } from '@/src/components/AppText';
import CustomButton from '@/src/components/UI/CustomButton';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const [enabled, setEnabled] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [system, setSystem] = useState(true);

  useEffect(() => {
    (async () => {
      const e = await AsyncStorage.getItem('notif_enabled');
      const m = await AsyncStorage.getItem('notif_marketing');
      const s = await AsyncStorage.getItem('notif_system');
      if (e !== null) setEnabled(e === '1');
      if (m !== null) setMarketing(m === '1');
      if (s !== null) setSystem(s === '1');
    })();
  }, []);

  const requestPerms = async () => {
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      if (req.status !== 'granted') {
        if (!canAskAgain) {
          Linking.openSettings();
        }
        return;
      }
    }
    setEnabled(true);
    await AsyncStorage.setItem('notif_enabled', '1');
  };

  const toggle = async (
    setter: (v: boolean) => void,
    key: string,
    val: boolean,
  ) => {
    setter(val);
    await AsyncStorage.setItem(key, val ? '1' : '0');
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Notificaciones"
        leftComponent={
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />
      <View style={styles.card}>
        <View style={styles.row}>
          <AppText>Habilitar notificaciones</AppText>
          <Switch
            value={enabled}
            onValueChange={(v) =>
              v ? requestPerms() : toggle(setEnabled, 'notif_enabled', v)
            }
          />
        </View>
        <View style={styles.row}>
          <AppText>Sistema</AppText>
          <Switch
            value={system}
            onValueChange={(v) => toggle(setSystem, 'notif_system', v)}
            disabled={!enabled}
          />
        </View>
        <View style={styles.row}>
          <AppText>Marketing</AppText>
          <Switch
            value={marketing}
            onValueChange={(v) => toggle(setMarketing, 'notif_marketing', v)}
            disabled={!enabled}
          />
        </View>
        <CustomButton
          title="Probar notificación"
          onPress={async () => {
            if (!enabled) return;
            await Notifications.scheduleNotificationAsync({
              content: { title: 'Hola', body: 'Esto es una prueba.' },
              trigger: null,
            });
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7EF',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFDF4',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F2D8A7',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
});
