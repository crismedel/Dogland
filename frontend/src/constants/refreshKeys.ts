/**
 * ============================================================================
 * CONSTANTES DE KEYS PARA EL SISTEMA DE REFRESH
 * ============================================================================
 *
 * Este archivo centraliza todas las keys usadas en el sistema de refresh.
 *
 * VENTAJAS:
 * ✅ Evita errores de escritura (typos)
 * ✅ Autocompletado en el IDE
 * ✅ Fácil de mantener y documentar
 * ✅ Refactorización segura
 *
 * USO:
 * import { REFRESH_KEYS } from '@/src/constants/refreshKeys';
 *
 * triggerRefresh(REFRESH_KEYS.USER);
 * useAutoRefresh({ key: REFRESH_KEYS.ALERTS, ... });
 *
 * ============================================================================
 */

export const REFRESH_KEYS = {
  /** Datos del perfil de usuario (nombre, email, teléfono, etc.) */
  USER: 'user',

  /** Lista de alertas comunitarias */
  ALERTS: 'alerts',

  /** Lista de adopciones */
  ADOPTION: 'adoption',

  // Agrega más keys según las necesidades de tu aplicación
} as const;

/**
 * Tipo derivado de las keys para type-safety
 *
 * USO:
 * type RefreshKey = typeof REFRESH_KEYS[keyof typeof REFRESH_KEYS];
 */
