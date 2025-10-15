/**
 * Este Middleware que valida los parametros de la URL segun el schema provisto.
 * Garantiza que los parametros tengan el formato esperado y facilita el manejo 
 * seguro de la informacion.
 */

export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error.issues.map(i => i.message).join(', '),
      });
    }
    req.validatedParams = result.data;
    next();
  };
}
