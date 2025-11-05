// src/services/pushTokens.js
import pool from '../db/db.js';

/**
 * Upsert (registrar / actualizar) token push en user_push_tokens.
 */
export async function upsertToken({
  user_id,
  push_token,
  platform = null,
  app_version = null,
  device_id = null,
}) {
  const q = `
    INSERT INTO user_push_tokens
      (user_id, push_token, platform, app_version, is_valid, created_at, last_seen, device_id)
    VALUES ($1,$2,$3,$4, TRUE, now(), now(), $5)
    ON CONFLICT (user_id, push_token)
    DO UPDATE SET
      last_seen = now(),
      platform = EXCLUDED.platform,
      app_version = EXCLUDED.app_version,
      is_valid = TRUE,
      device_id = EXCLUDED.device_id
  `;
  const params = [user_id, push_token, platform, app_version, device_id];
  await pool.query(q, params);
  return { ok: true };
}

/**
 * Borrar token específico
 */
export async function deleteToken(user_id, push_token) {
  const q = `DELETE FROM user_push_tokens WHERE user_id = $1 AND push_token = $2`;
  const r = await pool.query(q, [user_id, push_token]);
  return r.rowCount;
}

/**
 * Borrar todos los tokens de un usuario (logout global)
 */
export async function deleteAllTokens(user_id) {
  const q = `DELETE FROM user_push_tokens WHERE user_id = $1`;
  const r = await pool.query(q, [user_id]);
  return r.rowCount;
}

/**
 * Marcar token como inválido y aumentar contador / timestamp.
 */
export async function markTokenInvalid(push_token, reason = null) {
  const q = `
    UPDATE user_push_tokens
    SET is_valid = FALSE,
        failure_count = COALESCE(failure_count, 0) + 1,
        last_failed_at = now(),
        last_seen = now()
    WHERE push_token = $1
    RETURNING user_id
  `;
  try {
    const r = await pool.query(q, [push_token]);

    console.warn(`markTokenInvalid: ${push_token} (${reason})`);
    return r.rowCount > 0;
  } catch (err) {
    console.error('Error in markTokenInvalid:', err);
    throw err;
  }
}

/**
 * Obtener tokens válidos para una lista de userIds
 * Retorna [{ user_id, push_token, platform, app_version, device_id }]
 */
export async function getValidTokensByUserIds(userIds = []) {
  if (!userIds || userIds.length === 0) return [];
  const q = `
    SELECT user_id, push_token, platform, app_version, device_id
    FROM user_push_tokens
    WHERE user_id = ANY($1) AND is_valid = TRUE
  `;
  const r = await pool.query(q, [userIds]);
  return r.rows;
}

/**
 * Obtener tokens activos por ciudad (útil para alertas)
 */
export async function getActiveTokensByCity(id_ciudad, { limit = 500 } = {}) {
  const q = `
    SELECT upt.push_token, upt.user_id, upt.device_id
    FROM user_push_tokens upt
    INNER JOIN usuario u ON upt.user_id = u.id_usuario
    WHERE u.id_ciudad = $1 AND u.activo = true AND upt.is_valid = true
    LIMIT $2
  `;
  const r = await pool.query(q, [id_ciudad, limit]);
  return r.rows;
}

/**
 * Obtener tokens activos globales limitados (alto riesgo)
 */
export async function getAllActiveTokens({ limit = 1000 } = {}) {
  const q = `
    SELECT user_id, push_token, device_id
    FROM user_push_tokens
    WHERE is_valid = TRUE
    LIMIT $1
  `;
  const r = await pool.query(q, [limit]);
  return r.rows;
}

/**
 * Persistir ticket (ticketId -> push_token) para procesar receipts async
 */
export async function saveTicket(ticketId, push_token, user_id = null) {
  const q = `
    INSERT INTO push_tickets (ticket_id, push_token, user_id, created_at, status)
    VALUES ($1,$2,$3, now(), 'pending')
    ON CONFLICT (ticket_id) DO NOTHING
    RETURNING *
  `;
  const r = await pool.query(q, [ticketId, push_token, user_id]);
  return r.rows[0];
}

/**
 * Obtener tickets pendientes para procesar receipts (worker).
 */
export async function getPendingTickets(limit = 500) {
  const q = `SELECT * FROM push_tickets WHERE processed_at IS NULL ORDER BY created_at LIMIT $1`;
  const r = await pool.query(q, [limit]);
  return r.rows;
}

/**
 * Marcar ticket procesado
 */
export async function markTicketProcessed(
  ticketId,
  status = 'ok',
  details = null,
) {
  const q = `
    UPDATE push_tickets SET status = $2, processed_at = now(), details = $3::jsonb
    WHERE ticket_id = $1 RETURNING *
  `;
  const r = await pool.query(q, [
    ticketId,
    status,
    details ? JSON.stringify(details) : null,
  ]);
  return r.rows[0];
}

export default {
  upsertToken,
  deleteToken,
  deleteAllTokens,
  markTokenInvalid,
  getValidTokensByUserIds,
  getActiveTokensByCity,
  getAllActiveTokens,
  saveTicket,
  getPendingTickets,
  markTicketProcessed,
};
