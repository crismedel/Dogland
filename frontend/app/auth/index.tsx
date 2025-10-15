import {
  Text,
  View,
  ImageBackground,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import CustomButton from '@/src/components/UI/CustomButton'; // Ajusta la ruta según tu estructura
import { Colors } from '@/src/constants/colors';

const { width, height } = Dimensions.get('window');

export default function Index() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ImageBackground
        source={require('../../assets/images/golden.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <View style={styles.access}>
          {/* Custom Button */}
          <CustomButton
            title="Acceder"
            onPress={() => router.push('/auth/login')}
            variant="primary"
            icon="log-in-outline"
            style={styles.customButtonStyle}
            textStyle={styles.customButtonText}
          />

          {/* Registration Prompt */}
          <View style={styles.registrationContainer}>
            <Text
              style={styles.registrationText}
              onPress={() => router.push('/auth/register')}
            >
              No tienes una cuenta?{' '}
              <Text style={styles.registrationLink}>Regístrate</Text>
            </Text>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  container: {
    flex: 1,
  },
  access: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 80,
  },
  customButtonStyle: {
    paddingVertical: 18,
    paddingHorizontal: 50,
    minWidth: 250,
  },
  customButtonText: {
    fontSize: 20,
    fontWeight: '800',
  },
  registrationContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  registrationText: {
    color: Colors.lightText,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '400',
  },
  registrationLink: {
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
