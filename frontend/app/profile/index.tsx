// ProfileScreen.tsx
import React, { useMemo, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Pressable,
  useColorScheme,
} from 'react-native';
import { fetchUserProfile } from '../../src/api/users';
import CustomButton from '../../src/components/UI/CustomButton';
import CustomHeader from '../../src/components/UI/CustomHeader';
import { User } from '../../src/types/user';
import { useAutoRefresh } from '@/src/utils/useAutoRefresh';
import { REFRESH_KEYS } from '@/src/constants/refreshKeys';
import { useAuth } from '@/src/contexts/AuthContext';
import ProfileImagePicker from '@/src/components/profile/ProfileImagePicker';
import { useProfilePhoto } from '@/src/utils/useProfilePhoto';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';
import { router } from 'expo-router';
import { useNotification } from '@/src/components/notifications/NotificationContext';
import BottomSheetModal from '@/src/components/profile/BottomSheetModal';
import ProfileCard from '@/src/components/profile/ProfileCard';
import ContactInfo from '@/src/components/profile/ContactInfo';
import AdditionalInfo from '@/src/components/profile/AdditionalInfo';

const AVATAR_PLACEHOLDER = 'https://placehold.co/200x200/png?text=Avatar';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const { showInfo } = useNotification();
  const { isAuthenticated } = useAuth();

  const { photoUrl, uploading, fetchPhoto } = useProfilePhoto(
    user?.id_usuario || 0,
  );

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const refreshPhoto = useCallback(async () => {
    if (user?.id_usuario) {
      try {
        await fetchPhoto();
      } catch (err) {
        console.error('Error refrescando foto:', err);
      }
    }
  }, [user?.id_usuario, fetchPhoto]);

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

  useAutoRefresh({
    key: REFRESH_KEYS.USER_PHOTO,
    onRefresh: refreshPhoto,
    refreshOnFocus: false,
    refreshOnMount: false,
  });

  const onEditProfile = () => router.push('/profile/edit-form');
  const onOpenSettings = () => router.push('/settings');
  const onEditPhoto = () => setShowImagePicker(true);
  const closeBottomSheet = () => setShowImagePicker(false);

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

  const displayAvatar = useMemo(() => {
    return photoUrl || AVATAR_PLACEHOLDER;
  }, [photoUrl]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.secondary} />
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
        style={[styles.scrollView, { backgroundColor: Colors.background }]}
        contentContainerStyle={styles.container}
      >
        <CustomHeader title="Perfil" rightComponent={null} />
        <ProfileCard
          user={user}
          fullName={fullName}
          handle={handle}
          displayAvatar={displayAvatar}
          uploading={uploading}
          onEditPhoto={onEditPhoto}
          onEditProfile={onEditProfile}
          onOpenSettings={onOpenSettings}
        />
        <ContactInfo user={user} showInfo={showInfo} />
        <AdditionalInfo user={user} />
      </ScrollView>

      <BottomSheetModal
        visible={showImagePicker}
        onClose={closeBottomSheet}
        title="Cambiar foto de perfil"
      >
        {user && (
          <ProfileImagePicker
            userId={user.id_usuario}
            onUploadSuccess={() => {
              closeBottomSheet();
              void fetchPhoto();
            }}
          />
        )}
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 16, paddingBottom: 32 },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: { color: Colors.secondary, fontSize: 14 },
});
