import pool from '../db/db.js';

export const createAuditLog = async (data) => {
  await pool.query(`
    INSERT INTO audit_logs (id_usuario, action, table_name, record_id, old_values, new_values, ip_address)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [
    data.userId, 
    data.action, 
    data.tableName, 
    data.recordId, 
    data.oldValues ? JSON.stringify(data.oldValues) : null,
    data.newValues ? JSON.stringify(data.newValues) : null,
    data.ipAddress
  ]);
};

/**
 * Servicio que guarda en el log quien creo el dato
 * @param {Object} req - Request de Express
 * @param {string} tableName - Nombre de la tabla
 * @param {number} recordId - ID del dato guardado
 * @param {Object} newValues - Valores ingresados
 */
export const auditCreate = async (req, tableName, recordId, newValues) => {
  await createAuditLog({
    userId: req.user.id,
    action: 'CREATE',
    tableName,
    recordId,
    oldValues: null,
    newValues: newValues || req.body,
    ipAddress: req.ip
  });
};

/**
 * Servicio que guarda en el log quien actualizo el dato
 * @param {Object} req - Request de Express
 * @param {string} tableName - Nombre de la tabla
 * @param {Object} oldValues - Valores antes de actualizar
 */
export const auditUpdate = async (req, tableName, recordId, oldValues, newValues) => {
  await createAuditLog({
    userId: req.user.id,
    action: 'UPDATE',
    tableName,
    recordId: recordId,
    oldValues,
    newValues: newValues || req.body,
    ipAddress: req.ip
  });
};

/**
 * Servicio que guarda en el log quien elimino el dato
 * @param {Object} req - Request de Express
 * @param {string} tableName - Nombre de la tabla
 * @param {Object} oldValues - Valores antes de eliminar
 */
export const auditDelete = async (req, tableName, recordId, oldValues) => {
  await createAuditLog({
    userId: req.user.id,
    action: 'DELETE',
    tableName,
    recordId: recordId, // <-- USA EL ARGUMENTO
    oldValues,
    newValues: null,
    ipAddress: req.ip
  });
};
