import { NODE_ENV } from '../config/env.js';

// Lista de orígenes permitidos para CORS (Cross-Origin Resource Sharing)
const allowedOrigins = [
  'https://tu-dominio-web.com', // Dominio web en producción
];

// Opciones de configuración para CORS
export const corsOptions = {
  origin: function (origin, callback) {
    // Mostrar en consola el origen de la petición
    if (NODE_ENV == 'development') {
      console.log('CORS origin:', origin);
    }

    // Si no hay encabezado 'origin' (petición directa, por ejemplo desde Postman), permitir la petición
    if (!origin) {
      if (NODE_ENV === 'development') {
        console.log('No origin header, permitiendo request');
      }
      return callback(null, true);
    }

    // Verificar si el origen es localhost (desarrollo local)
    const isLocalhost = origin.startsWith('http://localhost');
    // Verificar si el origen es una red local con formato específico (ejemplo: Expo en red local)
    const isLocalNetwork = /^exp:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/.test(
      origin,
    );

    // Permitir la petición si el origen está en la lista permitida, es localhost o red local
    if (allowedOrigins.includes(origin) || isLocalhost || isLocalNetwork) {
      if (NODE_ENV === 'development') {
        console.log('Origen permitido:', origin);
      }
      return callback(null, true);
    } else {
      // Bloquear la petición si el origen no está permitido
      if (NODE_ENV === 'development') {
        console.log('Origen NO permitido:', origin);
      }
      return callback(null, false);
    }
  },
};

// Middleware para bloquear peticiones CORS no permitidas manualmente
export function corsBlocker(req, res, next) {
  const origin = req.headers.origin;
  const isLocalhost = origin && origin.startsWith('http://localhost');
  const isLocalNetwork = origin && /^exp:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/.test(origin);

  // Si el origen existe y no está en la lista permitida ni es localhost ni red local, bloquear la petición
  if (
    origin &&
    !allowedOrigins.includes(origin) &&
    !isLocalhost &&
    !isLocalNetwork
  ) {
    if (NODE_ENV === 'development') {
      console.log('Bloqueando petición CORS de origen no permitido:', origin);
    }
    return res.status(403).json({ error: 'CORS: Origen no permitido' });
  }
  // Si el origen es permitido, continuar con el siguiente middleware o ruta
  next();
}
