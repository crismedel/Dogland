// app/settings/about.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { AppText } from '@/src/components/AppText';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

function getVersionSafe(): string {
  // Prioridad: app.json/app.config -> manifest
  const v =
    (Constants as any).manifest2?.extra?.expoClient?.version ||
    Constants.expoConfig?.version ||
    (Constants as any).manifest?.version;
  return typeof v === 'string' ? v : '1.0.0';
}

function getRuntimeVersionSafe(): string {
  const rv = Constants.expoConfig?.runtimeVersion;
  if (!rv) return 'unknown';
  if (typeof rv === 'string') return rv;
  // Si es objeto con policy, muéstralo legible
  if (typeof rv === 'object' && 'policy' in rv) {
    return `policy:${rv.policy}`;
  }
  try {
    return JSON.stringify(rv);
  } catch {
    return 'unknown';
  }
}

export default function AboutScreen() {
  const version = getVersionSafe();
  const build = getRuntimeVersionSafe();
  const appId =
    Constants.expoConfig?.android?.package ||
    Constants.expoConfig?.ios?.bundleIdentifier ||
    'unknown';

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Acerca de"
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
        <AppText>Versión: {version}</AppText>
        <AppText>Runtime/Build: {build}</AppText>
        <AppText>App ID: {appId}</AppText>
        <AppText style={{ marginTop: 8 }}>
          © {new Date().getFullYear()} Dogland
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
