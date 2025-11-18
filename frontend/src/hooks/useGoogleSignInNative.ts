/**
 * Hook personalizado para manejar la autenticación con Google usando el SDK nativo
 * En Expo Go, retorna un hook deshabilitado para evitar crashes
 */
import { useState, useEffect, useCallback } from 'react';
import {
  configureGoogleSignIn,
  signInWithGoogle,
  sendGoogleTokenToBackend,
  isGoogleSignInSupported,
} from '../services/googleSignInNative';

interface UseGoogleSignInOptions {
  onSuccess?: (token: string, user: any) => void;
  onError?: (error: string) => void;
}

interface UseGoogleSignInReturn {
  signIn: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
}

export const useGoogleSignInNative = (
  options: UseGoogleSignInOptions = {}
): UseGoogleSignInReturn => {
  const { onSuccess, onError } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Configurar Google Sign-In al montar el componente
  useEffect(() => {
    // Verificar si Google Sign-In está disponible (Dev Build)
    if (!isGoogleSignInSupported()) {
      console.log('i Google Sign-In no disponible - ejecutando en Expo Go');
      setIsReady(false);
      return;
    }

    try {
      configureGoogleSignIn();
      setIsReady(true);
    } catch (err: any) {
      console.error('Error configurando Google Sign-In:', err);
      setError('No se pudo configurar Google Sign-In');
      setIsReady(false);
    }
  }, []);

  // Función para iniciar el flujo de autenticación
  const signIn = useCallback(async () => {
    if (!isReady) {
      setError('Google Sign-In no está configurado');
      onError?.('Google Sign-In no está configurado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Paso 1: Autenticar con Google nativo
      const googleResult = await signInWithGoogle();

      if (!googleResult.success || !googleResult.idToken) {
        const errorMsg = googleResult.error || 'No se obtuvo el token de Google';
        setError(errorMsg);
        onError?.(errorMsg);
        setIsLoading(false);
        return;
      }

      // Paso 2: Enviar idToken al backend
      const backendResult = await sendGoogleTokenToBackend(googleResult.idToken);

      if (backendResult.success && backendResult.token && backendResult.user) {
        // Éxito: llamar callback con token JWT y usuario
        onSuccess?.(backendResult.token, backendResult.user);
      } else {
        const errorMsg = backendResult.error || 'Error al autenticar con el servidor';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error durante la autenticación';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [isReady, onSuccess, onError]);

  return {
    signIn,
    isLoading,
    error,
    isReady,
  };
};

export default useGoogleSignInNative;
