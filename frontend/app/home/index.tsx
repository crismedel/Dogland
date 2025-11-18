import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Image,
  ScrollView,
  Pressable,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import CustomButton from '../../src/components/UI/CustomButton';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import { fetchUserProfile } from '@/src/api/users';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  fontWeightBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';
import { fetchNotifications } from '@/src/api/notifications';
import Spinner from '@/src/components/UI/Spinner';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

const { width } = Dimensions.get('window');
const BADGE_SIZE = 42;

export default function Index() {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [userName, setUserName] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showPopup, setShowPopup] = React.useState<boolean>(false);
  const [popupMessage, setPopupMessage] = React.useState<string>('');
  const { logout } = useAuth();

  // Estado para contar notificaciones nuevas
  const [newNotificationsCount, setNewNotificationsCount] = React.useState(0);

  // ✅ cargar únicamente el perfil y notificaciones nuevas
  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const user = await fetchUserProfile();
      const name = user?.nombre_usuario || '';
      setUserName(name);

      // Cargar notificaciones para contar las no vistas
      const notificationsResponse = await fetchNotifications(1, 100); // Ajusta el límite si quieres
      const notifications = Array.isArray(notificationsResponse.rows)
        ? notificationsResponse.rows
        : [];

      // Contar las que no están leídas (read === false)
      const newCount = notifications.filter((n) => !n.read).length;
      setNewNotificationsCount(newCount);

      setShowPopup(false);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        await logout();
        router.replace('/auth');
        return;
      }

      setError('No se pudo cargar tu perfil. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [logout]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const userInitial = React.useMemo(
    () => (userName?.trim()?.[0] || 'U').toUpperCase(),
    [userName],
  );

  const onOpenSettings = () => router.push('/settings');

  const openSocialMedia = (platform: 'facebook' | 'twitter' | 'instagram') => {
    const urls = {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    };
    Linking.openURL(urls[platform]);
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center', padding: 16 },
        ]}
      >
        <AppText
          style={{ color: 'crimson', textAlign: 'center', marginBottom: 12 }}
        >
          {error}
        </AppText>
        <CustomButton
          title="Reintentar"
          onPress={loadData}
          variant="primary"
          style={{ marginBottom: 10 }}
        />

        <CustomButton
          title="Ir a Configuraciones"
          onPress={onOpenSettings}
          variant="primary"
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Image
        source={require('../../assets/images/huellas.png')}
        style={styles.imageWrapper}
      />

      {/* Badge de perfil */}
      <View style={styles.topBar1}>
        <Pressable
          onPress={() => router.push('/profile')}
          accessibilityLabel="Ir al perfil"
          style={({ pressed }) => [
            styles.profileBadge,
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
        >
          <AppText style={styles.profileInitial}>{userInitial}</AppText>
        </Pressable>
      </View>

      {/* Icono de notificaciones con badge */}
      <View style={styles.topBar2}>
        <Pressable
          onPress={() => router.push('/notifications')}
          accessibilityLabel="Ir a notificaciones"
          style={({ pressed }) => [
            styles.profileBadge,
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
        >
          {/* 4. Usar colores del tema */}
          <Ionicons
            name="notifications-outline"
            size={24}
            color={isDark ? colors.primary : colors.lightText}
          />
          {newNotificationsCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                {newNotificationsCount > 99 ? '99+' : newNotificationsCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <AppText style={styles.welcomeText}>
          Bienvenido/a {userName || 'Usuario'}
        </AppText>

        {/* Bloque 1 */}
        <View style={styles.cardRight}>
          <View style={styles.textBlock}>
            <AppText style={styles.questionText}>
              ¿Viste un perrito que necesita ayuda?
            </AppText>
            <CustomButton
              title="Dar aviso"
              onPress={() => router.push('/alerts')}
              variant="primary"
              icon="alert-circle-outline"
            />
          </View>
          <Image
            source={{ uri: 'https://placedog.net/300/300?id=5' }}
            style={styles.circleImage}
          />
        </View>

        {/* Bloque 2 */}
        <View style={styles.cardLeft}>
          <Image
            source={{ uri: 'https://placedog.net/300/300?id=8' }}
            style={styles.circleImage}
          />
          <View style={styles.textBlock}>
            <AppText style={styles.questionText}>
              ¿Te gustaría adoptar un perrito?
            </AppText>
            <CustomButton
              title="Quiero adoptar"
              onPress={() => router.push('/adoption')}
              variant="primary"
              icon="paw-outline"
            />
          </View>
        </View>

        {/* Bloque 3 */}
        <View style={styles.cardRight}>
          <View style={styles.textBlock}>
            <AppText style={styles.questionText}>Mapa Comunitario</AppText>
            <CustomButton
              title="Ver mapa"
              onPress={() => router.push('/community_maps')}
              variant="primary"
              icon="map-outline"
            />
          </View>
          <Image
            source={{ uri: 'https://placedog.net/300/300?id=15' }}
            style={styles.circleImage}
          />
        </View>

        {/* Bloque 4 */}
        <View style={styles.cardLeft}>
          <Image
            source={{ uri: 'https://placedog.net/300/300?id=20' }}
            style={styles.circleImage}
          />
          <View style={styles.textBlock}>
            <AppText style={styles.questionText}>Avistamientos</AppText>
            <CustomButton
              title="Ver avistamientos"
              onPress={() => router.push('/sightings')}
              variant="primary"
              icon="eye-outline"
            />
          </View>
        </View>

        {/* Redes sociales */}
        <View style={styles.socialContainer}>
          <AppText style={styles.socialText}>Puedes buscarnos en :</AppText>
          <View style={styles.socialButtons}>
            <Ionicons
              name="logo-facebook"
              size={24}
              color={colors.text} // 4. Usar colores del tema
              style={styles.socialIcon}
              onPress={() => openSocialMedia('facebook')}
            />
            <Ionicons
              name="logo-twitter"
              size={24}
              color={colors.text} // 4. Usar colores del tema
              style={styles.socialIcon}
              onPress={() => openSocialMedia('twitter')}
            />
            <Ionicons
              name="logo-instagram"
              size={24}
              color={colors.text} // 4. Usar colores del tema
              style={styles.socialIcon}
              onPress={() => openSocialMedia('instagram')}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---- ESTILOS ---- */
// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background }, // Dinámico
    errorText: {
      color: colors.danger, // Dinámico
      textAlign: 'center',
      marginBottom: 12,
      fontSize: 16,
    },
    imageWrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      opacity: isDark ? 0.3 : 0.5, // Dinámico
      width: '100%',
      height: '100%',
      resizeMode: 'repeat',
    },
    topBar1: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
    topBar2: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
    profileBadge: {
      width: BADGE_SIZE,
      height: BADGE_SIZE,
      borderRadius: BADGE_SIZE / 2,
      backgroundColor: isDark ? colors.cardBackground : colors.text, // Dinámico
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: isDark ? colors.primary : colors.lightText, // Dinámico
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 2 },
        },
        android: { elevation: 6 },
      }),
    },
    profileInitial: {
      color: isDark ? colors.primary : colors.lightText, // Dinámico
      fontWeight: fontWeightBold,
      fontSize: 18,
    },
    badgeContainer: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: colors.danger, // Dinámico
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
      borderWidth: 1,
      borderColor: colors.lightText, // Dinámico
    },
    badgeText: {
      color: colors.lightText, // Dinámico
      fontWeight: '700',
      fontSize: 12,
    },
    content: { paddingTop: 120, paddingBottom: 40, gap: 30 },
    welcomeText: {
      fontSize: 28,
      fontWeight: fontWeightBold,
      color: colors.text, // Dinámico
      textAlign: 'center',
      marginBottom: 20,
      textShadowColor: 'rgba(0,0,0,0.15)',
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: 3,
    },
    cardRight: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.secondary,
      backgroundColor: colors.cardBackground, // Dinámico
      borderTopRightRadius: 70,
      borderBottomRightRadius: 70,
      borderTopLeftRadius: 20,
      borderBottomLeftRadius: 20,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 0 },
        },
        android: { elevation: 4 },
      }),
    },
    cardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.secondary,
      backgroundColor: colors.cardBackground, // Dinámico
      borderTopLeftRadius: 70,
      borderBottomLeftRadius: 70,
      borderTopRightRadius: 20,
      borderBottomRightRadius: 20,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 0 },
        },
        android: { elevation: 4 },
      }),
    },
    textBlock: { flex: 1, alignItems: 'center', marginHorizontal: 10 },
    questionText: {
      fontSize: 15,
      fontWeight: fontWeightMedium,
      marginBottom: 12,
      color: colors.text, // Dinámico
      textAlign: 'center',
    },
    circleImage: {
      width: width * 0.28,
      height: width * 0.28,
      borderRadius: (width * 0.28) / 2,
      borderWidth: 3,
      borderColor: colors.lightText, // Dinámico
      marginHorizontal: 10,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
        },
        android: { elevation: 6 },
      }),
    },
    socialContainer: { alignItems: 'center', marginTop: 30 },
    socialText: {
      fontSize: 16,
      fontWeight: fontWeightMedium,
      marginBottom: 10,
      color: colors.text, // Dinámico
    },
    socialButtons: { flexDirection: 'row' },
    socialIcon: {
      backgroundColor: colors.cardBackground, // Dinámico
      padding: 10,
      borderRadius: 25,
      marginHorizontal: 8,
      minWidth: 44,
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 2 },
        },
        android: { elevation: 4 },
      }),
    },
  });
