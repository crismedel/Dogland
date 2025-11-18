import React, { useMemo, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  // 1. Quitar useColorScheme
  // useColorScheme,
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
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import { AppText } from '@/src/components/AppText';
import { router } from 'expo-router';
import { useNotification } from '@/src/components/notifications';
import BottomSheetModal from '@/src/components/profile/BottomSheetModal';
import ProfileCard from '@/src/components/profile/ProfileCard';
import ContactInfo from '@/src/components/profile/ContactInfo';
import AdditionalInfo from '@/src/components/profile/AdditionalInfo';
import Spinner from '@/src/components/UI/Spinner';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

const AVATAR_PLACEHOLDER = 'https://placehold.co/200x200/png?text=Avatar';

export default function ProfileScreen() {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const { showInfo } = useNotification();
  const { isAuthenticated } = useAuth();

  const { photoUrl, uploading, fetchPhoto } = useProfilePhoto(
    user?.id_usuario || 0,
  );

  // 3. Quitar esto, ya lo provee el hook useTheme
  // const colorScheme = useColorScheme();
  // const isDark = colorScheme === 'dark';

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
    return <Spinner />;
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
        // 4. Usar estilos dinámicos
        style={styles.scrollView}
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

        <View style={styles.cardContainer}>
          <CustomButton
            title="Mis Postulaciones"
            variant="secondary"
            icon="document-text-outline"
            onPress={() => router.push('/adoption/misPostulaciones')}
          />
        </View>

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

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: colors.background, // Dinámico
    },
    container: { padding: 16, paddingBottom: 32 },
    loadingContainer: {
      flex: 1,
      backgroundColor: colors.background, // Dinámico
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardContainer: {
      backgroundColor: colors.cardBackground, // Dinámico
      borderRadius: 20,
      paddingVertical: 16,
      paddingHorizontal: 18,
      marginTop: 20,
      borderWidth: 1,
      borderColor: colors.secondary, // Dinámico
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.1 : 0.045, // Dinámico
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },

    errorContainer: {
      flex: 1,
      backgroundColor: colors.background, // Dinámico
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    errorText: {
      color: colors.secondary, // Dinámico
      fontSize: 14,
    },
  });