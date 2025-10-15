export const errorHandler = (err, req, res, next) => {
  // Log según el tipo de error
  if (process.env.NODE_ENV !== 'test') {
    if (err.code) {
      // Errores de PostgreSQL
      console.error(`[DB Error ${err.code}]: ${err.message}`);
    } else if (err.message === 'CORS no permitido para este origen') {
      console.error('[CORS Error]:', err.message);
    } else {
      // Otros errores
      console.error('Error:', err.message);
    }
  }

  // CORS Error
  if (err.message === 'CORS no permitido para este origen') {
    return res.status(403).json({ 
      success: false, 
      error: 'Origen no permitido' 
    });
  }

  // PostgreSQL Errors - DB caída
  if (err.code === 'ECONNREFUSED' || 
      err.code === '57P03' || 
      err.code === '08006') {
    return res.status(503).json({ 
      success: false, 
      error: 'Servicio temporalmente no disponible' 
    });
  }

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(409).json({ 
      success: false, 
      error: 'El registro ya existe' 
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ 
      success: false, 
      error: 'Referencia inválida' 
    });
  }

  // Error genérico
  res.status(500).json({ 
    success: false, 
    error: 'Error interno del servidor' 
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Ruta no encontrada' 
  });
};
