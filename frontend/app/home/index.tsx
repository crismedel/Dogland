import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
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
        colors={['#b1d5f0', '#c7df9f']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Botón menú arriba */}
      <View style={styles.menuContainer}>
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
          <Ionicons name="settings-outline" size={30} color="black" />
        </TouchableOpacity>

        {menuVisible && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity disabled style={styles.menuItem}>
              <Text style={styles.menuTextDisabled}>
                Configuración de usuario
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text style={styles.menuText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcomeText}>Bienvenido/a Victoria</Text>

        {/* Bloque 1 (Texto+Botón izquierda, Imagen derecha) */}
        <View style={styles.row}>
          <View style={styles.textBlock}>
            <Text style={styles.questionText}>
              ¿Viste un perrito que necesita ayuda?
            </Text>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/alerts')}
            >
              <Text style={styles.linkButtonText}>Dar aviso</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={{ uri: 'https://placedog.net/300/300?id=5' }}
            style={styles.circleImage}
          />
        </View>

        {/* Bloque 2 (Imagen izquierda, Texto+Botón derecha) */}
        <View style={styles.row}>
          <Image
            source={{ uri: 'https://placedog.net/300/300?id=8' }}
            style={styles.circleImage}
          />
          <View style={styles.textBlock}>
            <Text style={styles.questionText}>
              ¿Te gustaría adoptar un perrito?
            </Text>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/adoption')}
            >
              <Text style={styles.linkButtonText}>Quiero adoptar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bloque 3 (Texto+Botón izquierda, Imagen derecha) */}
        <View style={styles.row}>
          <View style={styles.textBlock}>
            <Text style={styles.questionText}>Mapa Comunitario</Text>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/community_maps')}
            >
              <Text style={styles.linkButtonText}>Ver Mapa</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={{ uri: 'https://placedog.net/300/300?id=15' }}
            style={styles.circleImage}
          />
        </View>

        {/* Bloque 4 (Imagen izquierda, Texto+Botón derecha) */}
        <View style={styles.row}>
          <Image
            source={{ uri: 'https://placedog.net/300/300?id=20' }}
            style={styles.circleImage}
          />
          <View style={styles.textBlock}>
            <Text style={styles.questionText}>Avistamientos</Text>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/sightings')}
            >
              <Text style={styles.linkButtonText}>Ver avistamientos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Redes sociales */}
        <View style={styles.socialContainer}>
          <Text style={styles.socialText}>Puedes buscarnos en :</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => openSocialMedia('facebook')}
            >
              <Ionicons name="logo-facebook" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => openSocialMedia('twitter')}
            >
              <Ionicons name="logo-twitter" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => openSocialMedia('instagram')}
            >
              <Ionicons name="logo-instagram" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuText: {
    fontSize: 16,
    color: 'red',
    fontWeight: '600',
  },
  menuTextDisabled: {
    fontSize: 16,
    color: '#999',
  },
  content: {
    paddingTop: 120,
    paddingBottom: 40,
    gap: 40,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  textBlock: {
    flex: 1,
    marginHorizontal: 10,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
    color: '#000',
  },
  circleImage: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    marginHorizontal: 10,
  },
  linkButton: {
    backgroundColor: '#f7b500', // amarillo similar al de la imagen
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12, // bordes redondeados
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // sombra en Android
    shadowColor: '#000', // sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  linkButtonText: {
    color: '#fff', // texto blanco
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  socialContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  socialText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  socialButtons: {
    flexDirection: 'row',
  },
  socialIcon: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 25,
    marginHorizontal: 8,
    elevation: 2,
  },
});
