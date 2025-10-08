/** 
 * Middeware para verificar los tipos de datos correctos para solicitudes 
 * que requieren datos de entrada en los endpoints,
 * dado un esquema creado en el directorio `schemas/`
 */
export const validateSchema = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      const errorMessages = parsed.error.issues.map(issue => {
        return `${issue.path[0]}: ${issue.message}`;
      }).join('; ');

      return res.status(400).json({
        success: false,
        error: errorMessages,
      });
    }

    req.validatedBody = parsed.data;
    next();
  } catch (err) {
    // Se activa por errores inesperados.
    console.error('Error en validateSchema middleware:', err);
    res.status(500).json({ success: false, error: 'Error interno de validación' });
  }
};
