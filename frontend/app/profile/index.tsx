import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import CustomButton from '../../src/components/UI/CustomButton';

const AVATAR = 'https://placehold.co/200x200/png?text=Avatar';

export default function ProfileScreen() {
  const user = {
    name: 'Jane Doe',
    username: 'janedoe',
    bio: 'no soy un perro, pero me gustan mucho los perros. Amante de la naturaleza y las aventuras al aire libre.',
    ejemplo: 1280,
    ejemplo2: 342,
    datos: 58,
    avatar: AVATAR,
  };

  const onEditProfile = () => {
    console.log('Edit profile');
  };

  const onOpenSettings = () => {
    console.log('Open settings');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Perfil</Text>
          <CustomButton
            title="Ajustes"
            onPress={onOpenSettings}
            variant="secondary"
            icon="settings-outline"
          />
        </View>

        {/* Avatar + Nombre */}
        <View style={styles.center}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>@{user.username}</Text>
        </View>

        {/* Métricas */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.datos}</Text>
            <Text style={styles.statLabel}>datos</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.ejemplo}</Text>
            <Text style={styles.statLabel}>ejemplo</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.ejemplo2}</Text>
            <Text style={styles.statLabel}>ejemplo2</Text>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <Text style={styles.bio}>{user.bio}</Text>
        </View>

        {/* Acciones */}
        <View style={styles.actionsRow}>
          <CustomButton
            title="Editar perfil"
            onPress={onEditProfile}
            variant="primary"
            icon="create-outline"
          />
          <CustomButton
            title="Ajustes"
            onPress={onOpenSettings}
            variant="secondary"
            icon="settings-outline"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2E2C4' },
  container: { padding: 16, paddingBottom: 32 },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { color: '#2C3E50', fontSize: 22, fontWeight: '700', flex: 1 },

  // Avatar y nombre
  center: { alignItems: 'center', marginTop: 8 },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 12 },
  name: { color: '#2C3E50', fontSize: 20, fontWeight: '700' },
  username: { color: '#8B5E3C', marginTop: 2 },

  // Estadísticas
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7E0',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { color: '#CC5803', fontSize: 18, fontWeight: '700' },
  statLabel: { color: '#8B5E3C', marginTop: 4 },

  // Card
  card: {
    backgroundColor: '#FFFDF4',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F7B500',
  },
  sectionTitle: {
    color: '#CC5803',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  bio: { color: '#2C3E50', lineHeight: 20 },

  // Acciones
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
});
