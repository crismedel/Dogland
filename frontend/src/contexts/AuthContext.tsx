import { authStorage } from '@/src/utils/authStorage';
import { decodeJWT, isTokenExpired } from '@/src/utils/jwtDecoder';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';

interface User {
  id: number;
  email: string;
  role: string;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Función para decodificar y establecer el usuario desde el token
  const setUserFromToken = (tokenString: string) => {
    const payload = decodeJWT(tokenString);

    if (payload) {
      setUser({
        id: payload.id,
        email: payload.email,
        role: payload.role,
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

  // Logout: limpiar token y usuario
  const logout = async () => {
    try {
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
