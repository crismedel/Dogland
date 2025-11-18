/**
 * Decodifica un JWT y extrae el payload
 * No verifica la firma, solo decodifica el contenido
 */

export interface JWTPayload {
  id: number;
  role: string;
  email: string;
  nombre?: string;
  iat: number;
  exp: number;
}

// Interfaz para el payload crudo del backend
interface RawJWTPayload {
  id_usuario?: number;
  id?: number;
  id_rol?: number;
  role?: string;
  email: string;
  nombre_usuario?: string;
  nombre?: string;
  iat: number;
  exp: number;
}

export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // Un JWT tiene 3 partes separadas por puntos: header.payload.signature
    const parts = token.split('.');

    if (parts.length !== 3) {
      console.error('Token inválido: no tiene 3 partes');
      return null;
    }

    // El payload es la segunda parte
    const payload = parts[1];

    // Decodificar desde Base64URL
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const rawPayload = JSON.parse(jsonPayload) as RawJWTPayload;

    // Mapear campos del backend al formato esperado por el frontend
    return {
      id: rawPayload.id_usuario || rawPayload.id || 0,
      role: rawPayload.id_rol?.toString() || rawPayload.role || '',
      email: rawPayload.email,
      nombre: rawPayload.nombre_usuario || rawPayload.nombre,
      iat: rawPayload.iat,
      exp: rawPayload.exp,
    } as JWTPayload;
  } catch (error) {
    console.error('Error al decodificar JWT:', error);
    return null;
  }
};

/**
 * Verifica si un token JWT ha expirado
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token);

  if (!payload || !payload.exp) {
    return true;
  }

  // exp está en segundos, Date.now() en milisegundos
  const now = Date.now() / 1000;
  return payload.exp < now;
};

/**
 * Extrae solo el rol del token
 */
export const getRoleFromToken = (token: string): string | null => {
  const payload = decodeJWT(token);
  return payload?.role || null;
};
