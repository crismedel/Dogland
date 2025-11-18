// src/contexts/AuthContext.tsx
import { authStorage } from '@/src/utils/authStorage';
import { decodeJWT, isTokenExpired } from '@/src/utils/jwtDecoder';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { deletePushToken } from '@/src/api/notifications';

interface User {
  id: number;
  email: string;
  role: string;
  nombre?: string;
  apellido?: string;
  foto_perfil?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  syncUserWithBackend: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Decodifica token y setea user/token
  const setUserFromToken = (tokenString: string) => {
    const payload = decodeJWT(tokenString);

    if (payload) {
      setUser({
        id: payload.id,
        email: payload.email,
        role: payload.role,
        nombre: payload.nombre,
      });
      setToken(tokenString);
    } else {
      setUser(null);
      setToken(null);
    }
  };

  // Login: guardar token y decodificar usuario
  const login = async (tokenString: string) => {
    try {
      await authStorage.saveToken(tokenString);
      setUserFromToken(tokenString);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  // Logout: limpiar token y usuario. Además intenta eliminar push token remoto si existe.
  const logout = async () => {
    try {
      // Intentar eliminar push token guardado en SecureStore (si existe)
      try {
        const lastPushToken = await SecureStore.getItemAsync(
          'last_registered_push_token',
        );
        if (lastPushToken) {
          // deletePushToken es una llamada axios.delete('/notifications/token', { data: { push_token } })
          await deletePushToken(lastPushToken).catch((err) => {
            console.warn(
              'No se pudo eliminar push token en backend:',
              err?.response?.data || err.message || err,
            );
          });
          // borrar local
          await SecureStore.deleteItemAsync('last_registered_push_token');
        }
      } catch (err) {
        console.warn('Error intentando eliminar push token en logout:', err);
      }

      await authStorage.removeToken();
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  // Verificar autenticación al iniciar la app
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const savedToken = await authStorage.getToken();

      if (savedToken) {
        // Verificar si el token ha expirado
        if (isTokenExpired(savedToken)) {
          console.log('Token expirado, limpiando sesión');
          await logout();
        } else {
          setUserFromToken(savedToken);
        }
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuth();
  }, []);

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    if (!token) throw new Error('No autenticado');

    let apiBase = process.env.EXPO_PUBLIC_API_URL;
    if (!apiBase) {
      throw new Error('No se ha configurado EXPO_PUBLIC_API_URL');
    }

    const res = await fetch(`${apiBase}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const raw = await res.text(); // lee texto crudo primero para log
    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      /* no JSON */
    }

    if (!res.ok) {
      // backend a veces usa "error" o "message"
      const msg = data?.message || data?.error || `Error ${res.status}`;
      throw new Error(msg);
    }

    // Opcional: si el backend invalida el token tras el cambio, forzar re-login:
    // await logout();
  };

  const syncUserWithBackend = async () => {
    if (!token) {
      console.warn('No hay token, no se puede sincronizar usuario');
      return;
    }

    try {
      let apiBase = process.env.EXPO_PUBLIC_API_URL;
      if (!apiBase) {
        throw new Error('No se ha configurado EXPO_PUBLIC_API_URL');
      }

      const res = await fetch(`${apiBase}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Error al obtener datos del usuario: ${res.status}`);
      }

      const userData = await res.json();

      // Actualizar el estado del usuario con la información completa del backend
      setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        nombre: userData.nombre,
        apellido: userData.apellido,
        foto_perfil: userData.foto_perfil,
      });
    } catch (error) {
      console.error('Error al sincronizar usuario con backend:', error);
    }
  };

  const value: AuthContextType = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!user && !!token,
      login,
      logout,
      checkAuth,
      changePassword,
      syncUserWithBackend,
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  return context;
};
