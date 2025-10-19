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
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import CustomButton from '../../src/components/UI/CustomButton';
import { Colors } from '@/src/constants/colors';
import { fetchUserProfile } from '@/src/api/users';
import { authStorage } from '@/src/utils/authStorage';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';
import { NotificationBanner } from '@/src/components/NotificationBanner';
import { fetchActiveAlerts, ActiveAlert } from '@/src/api/alerts'; //  Importa la función y la interfaz

const { width } = Dimensions.get('window');
const BADGE_SIZE = 42;

export default function Index() {
  const [userName, setUserName] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeAlerts, setActiveAlerts] = React.useState<ActiveAlert[]>([]); //  Estado para alertas activas
  const [showPopup, setShowPopup] = React.useState<boolean>(false); //  control del modal
  const [popupMessage, setPopupMessage] = React.useState<string>(''); //  Mensaje dinámico para el popup

  // Cargar perfil y alertas al montar
  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const user = await fetchUserProfile();
        if (!isMounted) return;
        const name = user?.nombre_usuario || '';
        setUserName(name);

        //  Cargar alertas activas
        const alerts = await fetchActiveAlerts();
        if (isMounted) {
          setActiveAlerts(alerts);
          if (alerts.length > 0) {
            // Si hay alertas, prepara el popup con la primera o un resumen
            setPopupMessage(
              `¡Tienes ${alerts.length} alerta(s) activa(s)! La más reciente: ${alerts[0].titulo}`,
            );
            setShowPopup(true);
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        if (err?.response?.status === 401) {
          await authStorage.removeToken?.();
          router.replace('/auth');
          return;
        }
        setError(
          err?.response?.data?.error ??
            err?.message ??
            'No se pudo cargar el perfil o las alertas',
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const userInitial = React.useMemo(
    () => (userName?.trim()?.[0] || 'U').toUpperCase(),
    [userName],
  );

  const openSocialMedia = (platform: 'facebook' | 'twitter' | 'instagram') => {
    const urls = {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    };
    Linking.openURL(urls[platform]);
  };

  // Loading/errores arriba del layout
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#2c3e50" />
        <AppText style={{ marginTop: 12, color: '#2c3e50' }}>
          Cargando tu perfil…
        </AppText>
      </View>
    );
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
          onPress={() => router.replace('/auth')}
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
      <LinearGradient
        colors={['#F2E2C4', '#F2E2C4']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Modal Pop-up de alerta */}
      <Modal visible={showPopup} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <AppText style={styles.modalTitle}>🚨 Alerta importante</AppText>
            <AppText style={styles.modalBody}>{popupMessage}</AppText>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#d9534f' }]}
                onPress={() => setShowPopup(false)}
              >
                <AppText style={styles.modalButtonText}>Cerrar</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#0275d8' }]}
                onPress={() => {
                  setShowPopup(false);
                  router.push('/alerts');
                }}
              >
                <AppText style={styles.modalButtonText}>Ver alertas</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Badge de perfil */}
      <View style={styles.topBar}>
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

      <ScrollView contentContainerStyle={styles.content}>
        <AppText style={styles.welcomeText}>
          Bienvenido/a {userName || 'Usuario'}
        </AppText>

        {/* 🆕 NotificationBanner se muestra si hay alertas activas */}
        {activeAlerts.length > 0 && (
          <NotificationBanner
            title="🐾 Alertas activas"
            message={`Tienes ${activeAlerts.length} alerta(s) activa(s). La más reciente: ${activeAlerts[0].titulo}`}
            color="#f0ad4e"
          />
        )}

        {/* Bloque 1 (imagen derecha) */}
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

        {/* Bloque 2 (imagen izquierda) */}
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

        {/* Bloque 3 (imagen derecha) */}
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

        {/* Bloque 4 (imagen izquierda) */}
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
              color="black"
              style={styles.socialIcon}
              onPress={() => openSocialMedia('facebook')}
            />
            <Ionicons
              name="logo-twitter"
              size={24}
              color="black"
              style={styles.socialIcon}
              onPress={() => openSocialMedia('twitter')}
            />
            <Ionicons
              name="logo-instagram"
              size={24}
              color="black"
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
const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  profileBadge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: '#2c3e50',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.lightText,
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
    color: '#fff',
    fontWeight: fontWeightBold,
    fontSize: 18,
  },
  content: { paddingTop: 120, paddingBottom: 40, gap: 30 },
  welcomeText: {
    fontSize: 28,
    fontWeight: fontWeightBold,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },

  // estilos del pop-up
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#d9534f',
  },
  modalBody: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  /** ---- CARDS ---- */
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.5)',
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
    backgroundColor: 'rgba(255,255,255,0.5)',
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
    fontSize: 18,
    fontWeight: fontWeightMedium,
    marginBottom: 12,
    color: '#000',
    textAlign: 'center',
  },
  circleImage: {
    width: width * 0.28,
    height: width * 0.28,
    borderRadius: (width * 0.28) / 2,
    borderWidth: 3,
    borderColor: '#fff',
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
    color: '#2c3e50',
  },
  socialButtons: { flexDirection: 'row' },
  socialIcon: {
    backgroundColor: '#fff',
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
