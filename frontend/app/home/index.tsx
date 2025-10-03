import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import CustomButton from '../../src/components/UI/CustomButton';

const { width } = Dimensions.get('window');

export default function Index() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [token, setToken] = useState('mi_token'); // Token simulado

  const openSocialMedia = (platform: string) => {
    const urls = {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    };
    Linking.openURL(urls[platform as keyof typeof urls]);
  };

  const handleLogout = () => {
    Alert.alert('Confirmar', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => {
          setToken('');
          setMenuVisible(false);
          Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente.', [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/auth');
              },
            },
          ]);
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Fondo degradado */}
      <LinearGradient
        colors={['#F2E2C4', '#F2E2C4']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Botón menú arriba */}
      <View style={styles.menuContainer}>
        <Ionicons
          name="settings-outline"
          size={30}
          color="black"
          onPress={() => setMenuVisible(!menuVisible)}
        />

        {menuVisible && (
          <View style={styles.dropdownMenu}>
            <CustomButton
              title="Perfil"
              onPress={() => router.push('/profile')}
              variant="outline"
              style={{ marginVertical: 5 }}
            />
            <CustomButton
              title="Cerrar sesión"
              onPress={handleLogout}
              variant="secondary"
              style={{ marginVertical: 5 }}
            />
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcomeText}>Bienvenido/a Victoria</Text>

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
  menuContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  dropdownMenu: {
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 5,
    width: 200,
    elevation: 6,
  },
  content: {
    paddingTop: 120,
    paddingBottom: 40,
    gap: 30,
  },
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
    backgroundColor: 'rgba(255,255,255,0.5)', // transparencia
    borderTopRightRadius: 70, // lado redondeado hacia la imagen
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
      android: {
        elevation: 4,
      },
    }),
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.5)', // transparencia
    borderTopLeftRadius: 70, // lado imagen
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
      android: {
        elevation: 4,
      },
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
      android: {
        elevation: 6,
      },
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
