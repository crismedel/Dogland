import { useNotification } from '@/src/components/notifications/NotificationContext';
import { Colors } from '@/src/constants/colors';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { fetchUserProfile } from '../../src/api/users';
import CustomButton from '../../src/components/UI/CustomButton';
import CustomHeader from '../../src/components/UI/CustomHeader';
import { User } from '../../src/types/user';

const AVATAR = 'https://placehold.co/200x200/png?text=Avatar';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showInfo } = useNotification();

  useEffect(() => {
  fetchUserProfile()
    .then((userData) => setUser(userData))
    .catch((err) => console.error('Error cargando usuario:', err))
    .finally(() => setLoading(false));
  }, []);

  const onEditProfile = () => console.log('Edit profile');
  const onOpenSettings = () => router.push('/settings');
  const onEditPhoto = () => console.log('Edit photo');

  // Helpers
  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };

  const formatDate = (dateStr: string, opts?: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...opts,
    }).format(new Date(dateStr));

  const formatPhone = (value?: string | number) => {
    if (!value) return '-';
    const digits = String(value).replace(/\D/g, '');
    if (digits.length >= 11) {
      return `+${digits.slice(0, 2)} ${digits.slice(2, 3)} ${digits.slice(
        3,
        7,
      )} ${digits.slice(7, 11)}`;
    }
    return digits.replace(/(\d{3})(\d{3})(\d{3,4})/, '$1 $2 $3');
  };

  const fullName = useMemo(() => {
    if (!user) return '';
    return `${user.nombre_usuario} ${user.apellido_paterno ?? ''} ${
      user.apellido_materno ?? ''
    }`.trim();
  }, [user]);

  const handle = useMemo(
    () => (user ? user.nombre_usuario?.toLowerCase() : ''),
    [user],
  );

  const edad = useMemo(
    () => (user ? calcularEdad(user.fecha_nacimiento) : 0),
    [user],
  );

  const fechaCreacion = useMemo(
    () => (user ? formatDate(user.fecha_creacion) : ''),
    [user],
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#CC5803" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
        <CustomButton
          title="Reintentar"
          onPress={() => {
            setLoading(true);
            fetchUserProfile()
              .then((userData) => setUser(userData))
              .finally(() => setLoading(false));
          }}
          variant="primary"
          style={{ marginTop: 24 }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      <CustomHeader
        title="Perfil"
        // Sin botón de cerrar sesión aquí
        rightComponent={null}
      />

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ position: 'relative' }}>
            <Image source={{ uri: AVATAR }} style={styles.avatar} />
            <TouchableOpacity
              onPress={onEditPhoto}
              style={styles.editBadge}
              accessibilityLabel="Editar foto de perfil"
            >
              <Text style={styles.editBadgeText}>✎</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.username}>@{handle}</Text>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: user.activo ? '#16A34A' : '#DC2626' },
            ]}
          >
            <Text style={styles.statusText}>
              {user.activo ? '✓ Activo' : '✗ Inactivo'}
            </Text>
          </View>

          {/* Acciones */}
          <View style={styles.actionsRow}>
            <CustomButton
              title="Editar perfil"
              onPress={onEditProfile}
              variant="primary"
              icon="create-outline"
              style={styles.customButtonStyle}
            />
            <CustomButton
              title="Ajustes"
              onPress={onOpenSettings}
              variant="secondary"
              icon="settings-outline"
              style={styles.customButtonStyle}
            />
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{edad}</Text>
          <Text style={styles.statLabel}>Años</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user.nombre_rol}</Text>
          <Text style={styles.statLabel}>Rol</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user.sexo}</Text>
          <Text style={styles.statLabel}>Sexo</Text>
        </View>
      </View>

      {/* Información de Contacto */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Información de Contacto</Text>

        <View style={{ marginBottom: 16 }}>
          <Text style={styles.infoLabel}>Email</Text>
          <View style={styles.infoValueWrap}>
            <Text numberOfLines={2} style={styles.infoValue}>
              {user.email}
            </Text>
            <TouchableOpacity
              onPress={() => showInfo('Copiado', user.email)}
              accessibilityLabel="Copiar Email"
              style={styles.copyPill}
            >
              <Text style={styles.copyPillText}>Copiar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={{ marginBottom: 16 }}>
          <Text style={styles.infoLabel}>Teléfono</Text>
          <View style={styles.infoValueWrap}>
            <Text numberOfLines={1} style={styles.infoValue}>
              {formatPhone(user.telefono)}
            </Text>
            <TouchableOpacity
              onPress={() => showInfo('Copiado', String(user.telefono))}
              accessibilityLabel="Copiar Teléfono"
              style={styles.copyPill}
            >
              <Text style={styles.copyPillText}>Copiar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View>
          <Text style={styles.infoLabel}>Ciudad</Text>
          <View style={styles.infoValueWrap}>
            <Text numberOfLines={1} style={styles.infoValue}>
              {user.nombre_ciudad}
            </Text>
          </View>
        </View>
      </View>

      {/* Información Adicional */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Información Adicional</Text>

        <View style={{ marginBottom: 16 }}>
          <Text style={styles.infoLabel}>Fecha de nacimiento</Text>
          <View style={styles.infoValueWrap}>
            <Text style={styles.infoValue}>
              {formatDate(user.fecha_nacimiento)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={{ marginBottom: user.nombre_organizacion ? 16 : 0 }}>
          <Text style={styles.infoLabel}>Miembro desde</Text>
          <View style={styles.infoValueWrap}>
            <Text style={styles.infoValue}>{fechaCreacion}</Text>
          </View>
        </View>

        {user.nombre_organizacion ? (
          <>
            <View style={styles.divider} />
            <View>
              <Text style={styles.infoLabel}>Organización</Text>
              <View style={styles.infoValueWrap}>
                <Text numberOfLines={2} style={styles.infoValue}>
                  {user.nombre_organizacion}
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: '#FAF7EF' },
  container: { padding: 16, paddingBottom: 32 },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAF7EF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#FAF7EF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: { color: '#CC5803', fontSize: 14 },

  profileCard: {
    backgroundColor: Colors.lightText,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    overflow: 'hidden',
  },
  avatar: { width: 112, height: 112, borderRadius: 56, marginBottom: 16 },
  editBadge: {
    position: 'absolute',
    right: 4,
    bottom: 8,
    backgroundColor: '#CC5803',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  editBadgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  name: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  username: { color: '#6B7280', marginTop: 2, textAlign: 'center' },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 8,
  },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  statsGrid: { flexDirection: 'row', gap: 12, marginTop: 16 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.lightText,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F2D8A7',
  },
  statValue: {
    color: '#CC5803',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  statLabel: { color: '#6B7280', marginTop: 4, fontSize: 12 },

  card: {
    backgroundColor: '#FFFDF4',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F2D8A7',
  },
  sectionTitle: {
    color: '#CC5803',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },

  infoLabel: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoValue: { color: '#1F2937', fontSize: 14, flexShrink: 1 },
  copyPill: {
    backgroundColor: Colors.lightText,
    borderWidth: 1,
    borderColor: '#F2D8A7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  copyPillText: { color: '#1F2937', fontSize: 12 },
  divider: { height: 1, backgroundColor: '#F2EFE6', marginVertical: 8 },

  actionsRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  customButtonStyle: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    minWidth: 50,
  },
});
