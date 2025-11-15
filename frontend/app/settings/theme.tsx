import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import CustomHeader from '@/src/components/UI/CustomHeader';
import CustomButton from '@/src/components/UI/CustomButton';
import { AppText } from '@/src/components/AppText';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type ThemeOption = 'system' | 'light' | 'dark';

export default function ThemeScreen() {
  const [value, setValue] = useState<ThemeOption>('system');

  useEffect(() => {
    (async () => {
      const v = await AsyncStorage.getItem('pref_theme');
      if (v) setValue(v as ThemeOption);
    })();
  }, []);

  const save = async (v: ThemeOption) => {
    setValue(v);
    await AsyncStorage.setItem('pref_theme', v);
    // Aquí dispara tu ThemeProvider o context para aplicar cambios
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Tema"
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
        <AppText>Selecciona el tema de la app:</AppText>
        <View style={styles.buttonGroup}>
          <CustomButton
            title={`Sistema ${value === 'system' ? '✓' : ''}`}
            onPress={() => save('system')}
            icon="phone-portrait-outline"
          />
          <CustomButton
            title={`Claro ${value === 'light' ? '✓' : ''}`}
            onPress={() => save('light')}
            icon="sunny-outline"
          />
          <CustomButton
            title={`Oscuro ${value === 'dark' ? '✓' : ''}`}
            onPress={() => save('dark')}
            icon="moon-outline"
          />
        </View>
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
  buttonGroup: {
    gap: 12, // Espaciado consistente entre botones
  },
});
