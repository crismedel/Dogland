import React from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { UserRole } from '@/src/utils/rolePermissions';

interface RoleBasedContentProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente que muestra contenido solo si el usuario tiene uno de los roles permitidos
 *
 * @example
 * <RoleBasedContent allowedRoles={['Admin', 'Organizacion']}>
 *   <AdminPanel />
 * </RoleBasedContent>
 */
export const RoleBasedContent: React.FC<RoleBasedContentProps> = ({
  allowedRoles,
  children,
  fallback = null,
}) => {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  const hasAccess = allowedRoles.includes(user.role as UserRole);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

/**
 * Hook personalizado para verificar permisos de rol
 *
 * @example
 * const { hasRole, isAdmin, role } = useRole();
 * if (isAdmin) { ... }
 */
export const useRole = () => {
  const { user } = useAuth();

  return {
    role: user?.role || null,
    hasRole: (roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role as UserRole);
    },
    isAdmin: user?.role === 'Admin',
    isWorker: user?.role === 'Trabajador',
    isUser: user?.role === 'Usuario',
  };
};
