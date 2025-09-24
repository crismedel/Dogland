import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from './blacklist.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ error: 'No se proporcionó token' });
  }

  // Verificar si el token está en la lista negra
  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ error: 'Token invalidado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token no válido' });
    }
    req.user = user;
    next();
  });
};

export const authorizeRol = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.role;

        if (!userRole) {
            return res.status(403).json({ success: false, error: 'Rol no proporcionado en el token' });
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ success: false, error: 'Acceso denegado. No tienes los permisos requeridos' });
        }
        
        next();
    };
};