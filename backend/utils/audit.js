import pool from '../db/db.js';

/**
 * Obtiene los valores anteriores de un registro antes de aplicar cambios
 * @param {string} tableName - Nombre de la tabla
 * @param {string} idColumn - Nombre de la columna ID
 * @param {number} id - Valor del ID
 * @returns {Object|null} Los valores anteriores o null si no existe
 */
export const getOldValuesForAudit = async (tableName, idColumn, id) => {
  const result = await pool.query(
    `SELECT * FROM ${tableName} WHERE ${idColumn} = $1`,
    [id]
  );
  
  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0];
};

const SENSITIVE_FIELDS = {
  usuario: ['password_hash'],
};

/**
 * Sanitiza los datos removiendo campos sensibles antes de auditar
 * @param {string} tableName - Nombre de la tabla
 * @param {Object} data - Datos a sanitizar
 * @returns {Object} - Datos sin campos sensibles
 */
export const sanitizeForAudit = (tableName, data) => {
  const sensitiveFields = SENSITIVE_FIELDS[tableName] || [];
  const sanitized = { ...data };
  
  sensitiveFields.forEach(field => {
    delete sanitized[field];
  });
  
  return sanitized;
};