/**
 * Servicio para autenticación con Google usando @react-native-google-signin
 * Funciona nativamente en Development Build
 * En Expo Go, retorna funciones dummy para evitar crashes
 */
import { apiClient } from '../api/client';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

interface GoogleSignInResponse {
  success: boolean;
  token?: string;
  user?: {
    id_usuario: number;
    email: string;
    nombre_usuario: string;
    apellido_paterno: string;
    apellido_materno: string;
    id_rol: number;
  };
  error?: string;
}

// Intentar importar GoogleSignin, si falla (Expo Go) usar mock
let GoogleSignin: any = null;
let isGoogleSignInAvailable = false;

try {
  const GoogleSignInModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = GoogleSignInModule.GoogleSignin;
  isGoogleSignInAvailable = true;
  console.log('✅ Google Sign-In módulo nativo disponible');
} catch (error) {
  console.warn('⚠️ Google Sign-In no disponible (Expo Go)');
  isGoogleSignInAvailable = false;
}

/**
 * Verifica si Google Sign-In está disponible
 */
export const isGoogleSignInSupported = (): boolean => {
  return isGoogleSignInAvailable;
};

/**
 * Configura Google Sign-In
 * Debe llamarse antes de usar cualquier función de Google Sign-In
 */
export const configureGoogleSignIn = () => {
  if (!isGoogleSignInAvailable || !GoogleSignin) {
    console.warn('Google Sign-In no está disponible en este entorno');
    return;
  }

  try {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
      forceCodeForRefreshToken: false,
    });
    console.log('✅ Google Sign-In configurado correctamente');
  } catch (error) {
    console.error('❌ Error configurando Google Sign-In:', error);
  }
};

/**
 * Inicia el flujo de autenticación con Google
 * @returns Información del usuario de Google y su idToken
 */
export const signInWithGoogle = async () => {
  if (!isGoogleSignInAvailable || !GoogleSignin) {
    return {
      success: false,
      error: 'Google Sign-In no está disponible en Expo Go. Usa un Development Build.',
    };
  }

  try {
    // Verificar si Google Play Services está disponible (Android)
    await GoogleSignin.hasPlayServices();

    // Iniciar sesión
    const userInfo = await GoogleSignin.signIn();

    // Obtener el idToken
    const tokens = await GoogleSignin.getTokens();

    return {
      success: true,
      userInfo: userInfo.data,
      idToken: tokens.idToken,
    };
  } catch (error: any) {
    console.error('Error en Google Sign-In:', error);

    let errorMessage = 'Error al iniciar sesión con Google';

    if (error.code === 'SIGN_IN_CANCELLED') {
      errorMessage = 'Inicio de sesión cancelado';
    } else if (error.code === 'IN_PROGRESS') {
      errorMessage = 'Operación en progreso';
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      errorMessage = 'Google Play Services no disponible';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Envía el idToken de Google al backend para autenticación
 * @param idToken - Token de ID de Google
 * @returns Respuesta del servidor con JWT y datos del usuario
 */
export const sendGoogleTokenToBackend = async (
  idToken: string
): Promise<GoogleSignInResponse> => {
  try {
    const response = await apiClient.post('/auth/google/mobile/signin', {
      idToken,
    });

    return {
      success: true,
      token: response.data.token,
      user: response.data.user,
    };
  } catch (error: any) {
    console.error('Error enviando token de Google al backend:', error);

    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      'Error al autenticar con Google';

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Cierra sesión de Google
 */
export const signOutGoogle = async () => {
  if (!isGoogleSignInAvailable || !GoogleSignin) {
    return;
  }

  try {
    await GoogleSignin.signOut();
    console.log('✅ Sesión de Google cerrada');
  } catch (error) {
    console.error('Error al cerrar sesión de Google:', error);
  }
};

/**
 * Verifica si el usuario ya está autenticado con Google
 */
export const isSignedInGoogle = async (): Promise<boolean> => {
  if (!isGoogleSignInAvailable || !GoogleSignin) {
    return false;
  }

  try {
    return await GoogleSignin.isSignedIn();
  } catch (error) {
    return false;
  }
};

/**
 * Obtiene el usuario actual de Google (si existe)
 */
export const getCurrentGoogleUser = async () => {
  if (!isGoogleSignInAvailable || !GoogleSignin) {
    return {
      success: false,
      error: 'Google Sign-In no disponible',
    };
  }

  try {
    const userInfo = await GoogleSignin.signInSilently();
    return {
      success: true,
      userInfo: userInfo.data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'No hay sesión activa de Google',
    };
  }
};

export default {
  isGoogleSignInSupported,
  configureGoogleSignIn,
  signInWithGoogle,
  sendGoogleTokenToBackend,
  signOutGoogle,
  isSignedInGoogle,
  getCurrentGoogleUser,
};
