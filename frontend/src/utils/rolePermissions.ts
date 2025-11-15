/**
 * Define qué pantallas/funcionalidades tiene acceso cada rol
 */

export type UserRole = 'Usuario' | 'Trabajador' | 'Admin';

export interface RoutePermission {
  route: string;
  label: string;
  icon: string;
  roles: UserRole[]; // Roles que pueden acceder
}

// Define todas las rutas y sus permisos
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  {
    route: '/home',
    label: 'Inicio',
    icon: 'home',
    roles: ['Usuario', 'Trabajador', 'Admin'],
  },
  {
    route: '/sightings',
    label: 'Avistamientos',
    icon: 'eye',
    roles: ['Usuario', 'Trabajador', 'Admin'],
  },
  {
    route: '/my-sightings',
    label: 'Mis Avistamientos',
    icon: 'bookmark',
    roles: ['Usuario', 'Trabajador', 'Admin'],
  },
  {
    route: '/alerts',
    label: 'Alertas',
    icon: 'alert-circle',
    roles: ['Usuario', 'Trabajador', 'Admin'],
  },
  {
    route: '/adoption',
    label: 'Adopciones',
    icon: 'heart',
    roles: ['Usuario', 'Trabajador', 'Admin'],
  },
  {
    route: '/community_maps',
    label: 'Mapa Comunitario',
    icon: 'map',
    roles: ['Usuario', 'Trabajador', 'Admin'],
  },
  {
    route: '/create-report',
    label: 'Crear Reporte',
    icon: 'add-circle',
    roles: ['Usuario', 'Trabajador', 'Admin'],
  },
  {
    route: '/stats',
    label: 'Estadísticas',
    icon: 'stats-chart',
    roles: ['Trabajador', 'Admin'], // Solo trabajadores y admin
  },
  {
    route: '/users',
    label: 'Usuarios',
    icon: 'people',
    roles: ['Admin'], // Solo admin
  },
  {
    route: '/profile',
    label: 'Perfil',
    icon: 'person',
    roles: ['Usuario', 'Trabajador', 'Admin'],
  },
  {
    route: '/settings',
    label: 'Configuración',
    icon: 'settings',
    roles: ['Usuario', 'Trabajador', 'Admin'],
  },
];

/**
 * Verifica si un usuario con cierto rol puede acceder a una ruta
 */
export const canAccessRoute = (route: string, userRole: string): boolean => {
  const permission = ROUTE_PERMISSIONS.find((p) => p.route === route);

  if (!permission) {
    return false; // Si la ruta no está definida, denegar acceso
  }

  return permission.roles.includes(userRole as UserRole);
};

/**
 * Obtiene todas las rutas permitidas para un rol
 */
export const getRoutesForRole = (userRole: string): RoutePermission[] => {
  return ROUTE_PERMISSIONS.filter((permission) =>
    permission.roles.includes(userRole as UserRole)
  );
};

/**
 * Obtiene la ruta por defecto para un rol después del login
 */
export const getDefaultRouteForRole = (userRole: string): string => {
  // Todos los roles van a /home por defecto
  return '/home';
};
