import { authStorage } from '@/src/utils/authStorage';
import { decodeJWT, isTokenExpired } from '@/src/utils/jwtDecoder';
import React, { createContext, useContext, useEffect, useState } from 'react';

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

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    checkAuth,
  };

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
