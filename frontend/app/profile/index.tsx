import { useNotification } from '@/src/components/notifications/NotificationContext';
import { Colors } from '@/src/constants/colors';
import { router } from 'expo-router';
import React, { useMemo, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchUserProfile } from '../../src/api/users';
import CustomButton from '../../src/components/UI/CustomButton';
import CustomHeader from '../../src/components/UI/CustomHeader';
import { User } from '../../src/types/user';
import { useAutoRefresh } from '@/src/utils/useAutoRefresh';
import { REFRESH_KEYS } from '@/src/constants/refreshKeys';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';
import { useAuth } from '@/src/contexts/AuthContext';

const AVATAR = 'https://placehold.co/200x200/png?text=Avatar';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showInfo } = useNotification();
  const { isAuthenticated } = useAuth();

  // ✅ Usar useCallback para evitar que la función cambie en cada render
  const loadUserData = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      router.replace('/auth');
      return;
    }

    try {
      setLoading(true);
      const userData = await fetchUserProfile();
      setUser(userData);
    } catch (err) {
      console.error('Error cargando usuario:', err);
      router.replace('/auth');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ✅ Solo usar useAutoRefresh (eliminar el useEffect duplicado)
  useAutoRefresh({
    key: REFRESH_KEYS.USER,
    onRefresh: loadUserData,
    refreshOnFocus: true,
    refreshOnMount: true,
  });

  const onEditProfile = () => router.push('/profile/edit-form');
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
        <AppText style={styles.errorText}>No se pudo cargar el perfil</AppText>
        <CustomButton
          title="Reintentar"
          onPress={loadUserData}
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
              <AppText style={styles.editBadgeText}>✎</AppText>
            </TouchableOpacity>
          </View>

          <AppText style={styles.name}>{fullName}</AppText>
          <AppText style={styles.username}>@{handle}</AppText>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: user.activo ? '#16A34A' : '#DC2626' },
            ]}
          >
            <AppText style={styles.statusText}>
              {user.activo ? '✓ Activo' : '✗ Inactivo'}
            </AppText>
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
          <AppText style={styles.statValue}>{edad}</AppText>
          <AppText style={styles.statLabel}>Años</AppText>
        </View>
        <View style={styles.statCard}>
          <AppText style={styles.statValue}>{user.nombre_rol}</AppText>
          <AppText style={styles.statLabel}>Rol</AppText>
        </View>
        <View style={styles.statCard}>
          <AppText style={styles.statValue}>{user.sexo}</AppText>
          <AppText style={styles.statLabel}>Sexo</AppText>
        </View>
      </View>

      {/* Información de Contacto */}
      <View style={styles.card}>
        <AppText style={styles.sectionTitle}>Información de Contacto</AppText>

        <View style={{ marginBottom: 16 }}>
          <AppText style={styles.infoLabel}>Email</AppText>
          <View style={styles.infoValueWrap}>
            <AppText numberOfLines={2} style={styles.infoValue}>
              {user.email}
            </AppText>
            <TouchableOpacity
              onPress={() => showInfo('Copiado', user.email)}
              accessibilityLabel="Copiar Email"
              style={styles.copyPill}
            >
              <AppText style={styles.copyPillText}>Copiar</AppText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={{ marginBottom: 16 }}>
          <AppText style={styles.infoLabel}>Teléfono</AppText>
          <View style={styles.infoValueWrap}>
            <AppText numberOfLines={1} style={styles.infoValue}>
              {formatPhone(user.telefono)}
            </AppText>
            <TouchableOpacity
              onPress={() => showInfo('Copiado', String(user.telefono))}
              accessibilityLabel="Copiar Teléfono"
              style={styles.copyPill}
            >
              <AppText style={styles.copyPillText}>Copiar</AppText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View>
          <AppText style={styles.infoLabel}>Ciudad</AppText>
          <View style={styles.infoValueWrap}>
            <AppText numberOfLines={1} style={styles.infoValue}>
              {user.nombre_ciudad}
            </AppText>
          </View>
        </View>
      </View>

      {/* Información Adicional */}
      <View style={styles.card}>
        <AppText style={styles.sectionTitle}>Información Adicional</AppText>

        <View style={{ marginBottom: 16 }}>
          <AppText style={styles.infoLabel}>Fecha de nacimiento</AppText>
          <View style={styles.infoValueWrap}>
            <AppText style={styles.infoValue}>
              {formatDate(user.fecha_nacimiento)}
            </AppText>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={{ marginBottom: user.nombre_organizacion ? 16 : 0 }}>
          <AppText style={styles.infoLabel}>Miembro desde</AppText>
          <View style={styles.infoValueWrap}>
            <AppText style={styles.infoValue}>{fechaCreacion}</AppText>
          </View>
        </View>

        {user.nombre_organizacion ? (
          <>
            <View style={styles.divider} />
            <View>
              <AppText style={styles.infoLabel}>Organización</AppText>
              <View style={styles.infoValueWrap}>
                <AppText numberOfLines={2} style={styles.infoValue}>
                  {user.nombre_organizacion}
                </AppText>
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
  editBadgeText: {
    color: '#fff',
    fontWeight: fontWeightSemiBold,
    fontSize: 12,
  },

  name: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: fontWeightBold,
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
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: fontWeightSemiBold,
  },

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
    fontWeight: fontWeightBold,
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
    fontWeight: fontWeightSemiBold,
    marginBottom: 16,
  },

  infoLabel: {
    color: '#6B7280',
    fontWeight: fontWeightMedium,
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
