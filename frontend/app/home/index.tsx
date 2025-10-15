import React from 'react';
import {
  Text,
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import CustomButton from '../../src/components/UI/CustomButton';
import { Colors } from '@/src/constants/colors';
import { fetchUserProfile } from '@/src/api/users'; // <-- importa tu función
import { authStorage } from '@/src/utils/authStorage'; // para logout en caso 401 opcional

const { width } = Dimensions.get('window');
const BADGE_SIZE = 42;

export default function Index() {
  const [userName, setUserName] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Cargar perfil al montar
  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const user = await fetchUserProfile();
        if (!isMounted) return;

        // Ajusta según tu backend. Con /users/me recibes:
        // { id_usuario, nombre_usuario, ... , nombre_rol, ... }
        const name = user?.nombre_usuario || user?.nombre_usuario || '';
        setUserName(name);
      } catch (err: any) {
        if (!isMounted) return;
        // Manejo de errores básicos
        if (err?.response?.status === 401) {
          // Token inválido/expirado → limpiar y mandar a login
          await authStorage.removeToken?.();
          router.replace('/auth');
          return;
        }
        setError(
          err?.response?.data?.error ??
            err?.message ??
            'No se pudo cargar el perfil',
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
        <Text style={{ marginTop: 12, color: '#2c3e50' }}>
          Cargando tu perfil…
        </Text>
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
        <Text
          style={{ color: 'crimson', textAlign: 'center', marginBottom: 12 }}
        >
          {error}
        </Text>
        <CustomButton
          title="Reintentar"
          onPress={() => router.replace('/')}
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

      {/* Badge con inicial del usuario real */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.push('/profile')}
          accessibilityLabel="Ir al perfil"
          style={({ pressed }) => [
            styles.profileBadge,
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
        >
          <Text style={styles.profileInitial}>{userInitial}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcomeText}>
          Bienvenido/a {userName || 'Usuario'}
        </Text>

        {/* Bloque 1 (imagen derecha) */}
        <View style={styles.cardRight}>
          <View style={styles.textBlock}>
            <Text style={styles.questionText}>
              ¿Viste un perrito que necesita ayuda?
            </Text>
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
            <Text style={styles.questionText}>
              ¿Te gustaría adoptar un perrito?
            </Text>
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
            <Text style={styles.questionText}>Mapa Comunitario</Text>
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
            <Text style={styles.questionText}>Avistamientos</Text>
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
          <Text style={styles.socialText}>Puedes buscarnos en :</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Top bar con badge de perfil
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
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  content: { paddingTop: 120, paddingBottom: 40, gap: 30 },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
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
    fontWeight: '600',
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
    fontWeight: '600',
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
