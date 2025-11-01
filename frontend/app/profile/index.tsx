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
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  PanResponder,
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
import ProfileImagePicker from '@/src/components/UI/ProfileImagePicker';
import { useProfilePhoto } from '@/src/utils/useProfilePhoto';

const AVATAR_PLACEHOLDER = 'https://placehold.co/200x200/png?text=Avatar';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const { showInfo } = useNotification();
  const { isAuthenticated } = useAuth();

  const { photoUrl, uploading } = useProfilePhoto(user?.id_usuario || 0);

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

  useAutoRefresh({
    key: REFRESH_KEYS.USER,
    onRefresh: loadUserData,
    refreshOnFocus: true,
    refreshOnMount: true,
  });

  const onEditProfile = () => router.push('/profile/edit-form');
  const onOpenSettings = () => router.push('/settings');
  const onEditPhoto = () => setShowImagePicker(true);
  const closeBottomSheet = () => setShowImagePicker(false);

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

  const displayAvatar = useMemo(() => {
    return photoUrl || AVATAR_PLACEHOLDER;
  }, [photoUrl]);

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
    <>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
      >
        <CustomHeader title="Perfil" rightComponent={null} />

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ position: 'relative' }}>
              <Image source={{ uri: displayAvatar }} style={styles.avatar} />

              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}

              <TouchableOpacity
                onPress={onEditPhoto}
                style={styles.editBadge}
                accessibilityLabel="Editar foto de perfil"
                disabled={uploading}
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

      {/* ✅ Bottom Sheet Modal */}
      <BottomSheetModal
        visible={showImagePicker}
        onClose={closeBottomSheet}
        title="Cambiar foto de perfil"
      >
        {user && (
          <ProfileImagePicker
            userId={user.id_usuario}
            onUploadSuccess={() => {
              console.log('onUploadSuccess llamado');
              closeBottomSheet();
              loadUserData(); // Esto debería recargar todo el perfil
            }}
          />
        )}
      </BottomSheetModal>
    </>
  );
}

// ✅ Componente Bottom Sheet reutilizable
function BottomSheetModal({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.bottomSheetContainer,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              {/* Handle bar */}
              <View style={styles.handleBar} />

              {/* Header */}
              <View style={styles.bottomSheetHeader}>
                <AppText style={styles.bottomSheetTitle}>{title}</AppText>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <AppText style={styles.closeButtonText}>✕</AppText>
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView
                style={styles.bottomSheetContent}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: Colors.background },
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
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 56,
    justifyContent: 'center',
    alignItems: 'center',
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

  // ✅ Bottom Sheet Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#FFFDF4',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.75,
    paddingBottom: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2EFE6',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: fontWeightBold,
    color: '#CC5803',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: fontWeightBold,
  },
  bottomSheetContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});
