import { useAuth } from '@/src/contexts/AuthContext';

export type Role = 'Admin' | 'Trabajador' | 'Usuario';

export const useRole = () => {
  const { user } = useAuth();

  /**
   * Verifica si el usuario tiene uno de los roles permitidos
   * @param allowedRoles - Array de roles permitidos
   * @returns true si el usuario tiene uno de los roles permitidos
   */
  const hasRole = (allowedRoles: Role[]): boolean => {
    if (!user?.role) return false;
    return allowedRoles.includes(user.role as Role);
  };

  /**
   * Verifica si el usuario es Admin
   */
  const isAdmin = (): boolean => {
    return hasRole(['Admin']);
  };

  /**
   * Verifica si el usuario es Trabajador o Admin
   */
  const isTrabajador = (): boolean => {
    return hasRole(['Trabajador', 'Admin']);
  };

  /**
   * Verifica si el usuario es Usuario, Trabajador o Admin (cualquier rol autenticado)
   */
  const isUsuario = (): boolean => {
    return hasRole(['Usuario', 'Trabajador', 'Admin']);
  };

  return {
    role: user?.role as Role | null,
    hasRole,
    isAdmin,
    isTrabajador,
    isUsuario,
  };
};
