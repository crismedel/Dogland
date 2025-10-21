/**
 * Middleware para validar req.body, req.params y req.query
 * usando esquemas de Zod del directorio `schemas/`
 */
export const validateSchema = (schema) => (req, res, next) => {
  try {
    // Validar body, params y query juntos
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!parsed.success) {
      // Formatear errores de manera clara
      const errors = parsed.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors
      });
    }

    // Reemplazar con datos validados y transformados
    if (parsed.data.body) {
      req.body = parsed.data.body;
    }
    if (parsed.data.params) {
      req.params = parsed.data.params;
    }
    if (parsed.data.query) {
      // En lugar de reemplazar req.query, copiamos las propiedades
      // Primero limpiamos las propiedades existentes y copiamos las nuevas
      Object.keys(req.query).forEach(key => {
        delete req.query[key];
      });
      Object.keys(parsed.data.query).forEach(key => {
        req.query[key] = parsed.data.query[key];
      });
    }

    next();
  } catch (err) {
    console.error('Error en validateSchema middleware:', err);
    res.status(500).json({
      success: false,
      message: 'Error interno de validación',
      error: err.message
    });
  }
};
