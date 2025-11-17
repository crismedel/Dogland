import React from 'react';
import { useRole, Role } from '@/src/hooks/useRole';

interface RoleGuardProps {
  /**
   * Roles permitidos para ver el contenido
   */
  allowedRoles: Role[];
  /**
   * Contenido a renderizar si el usuario tiene el rol permitido
   */
  children: React.ReactNode;
  /**
   * Contenido alternativo a renderizar si el usuario NO tiene el rol permitido
   * Por defecto no renderiza nada (null)
   */
  fallback?: React.ReactNode;
}

/**
 * Componente que controla el acceso basado en roles
 *
 * @example
 * // Ocultar completamente si no tiene el rol
 * <RoleGuard allowedRoles={['Admin', 'Trabajador']}>
 *   <Button title="Crear Alerta" />
 * </RoleGuard>
 *
 * @example
 * // Mostrar mensaje alternativo si no tiene el rol
 * <RoleGuard
 *   allowedRoles={['Admin']}
 *   fallback={<Text>Solo administradores</Text>}
 * >
 *   <Button title="Gestionar Organizaciones" />
 * </RoleGuard>
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback = null,
}) => {
  const { hasRole } = useRole();

  if (!hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
