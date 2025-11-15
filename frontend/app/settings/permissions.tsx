import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import CustomHeader from '@/src/components/UI/CustomHeader';
import CustomButton from '@/src/components/UI/CustomButton';
import { AppText } from '@/src/components/AppText';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PermissionsScreen() {
  return (
    <View style={styles.container}>
      <CustomHeader
        title="Permisos"
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
        <AppText>Administra permisos del sistema:</AppText>
        <CustomButton
          title="Abrir ajustes del sistema"
          onPress={() => Linking.openSettings()}
          icon="settings-outline"
        />
        <AppText style={{ marginTop: 12 }}>
          Si un permiso está bloqueado, debes habilitarlo desde los ajustes del
          dispositivo.
        </AppText>
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
});
