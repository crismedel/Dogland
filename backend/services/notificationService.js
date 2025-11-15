import pool from '../db/db.js';

let _cachedTableInfo = null;
let _cachedAt = 0;
const CACHE_TTL_MS = 30 * 1000; // 30s

/**
 * Busca la tabla 'notifications' en information_schema y devuelve
 * { schema, table, qualifiedName, columns: [] } o null si no existe.
 * Prioriza dogland -> public -> cualquier otra schema.
 */
async function getNotificationsTableInfo() {
  const now = Date.now();
  if (_cachedTableInfo && now - _cachedAt < CACHE_TTL_MS) {
    return _cachedTableInfo;
  }

  try {
    // Buscar la tabla en todas las schemas, priorizando dogland y public
    const tableRes = await pool.query(
      `
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_name = 'notifications' AND table_type = 'BASE TABLE'
      ORDER BY CASE WHEN table_schema = 'dogland' THEN 0 WHEN table_schema = 'public' THEN 1 ELSE 2 END
      LIMIT 1
      `,
    );

    if (tableRes.rowCount === 0) {
      _cachedTableInfo = null;
      _cachedAt = now;
      return null;
    }

    const schema = tableRes.rows[0].table_schema;
    const table = tableRes.rows[0].table_name;
    const qualifiedName = `"${schema}"."${table}"`;

    // Obtener columnas
    const colsRes = await pool.query(
      `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2
      `,
      [schema, table],
    );
    const cols = colsRes.rows.map((r) => r.column_name);

    _cachedTableInfo = { schema, table, qualifiedName, columns: cols };
    _cachedAt = now;
    return _cachedTableInfo;
  } catch (err) {
    console.warn('getNotificationsTableInfo error:', err.message || err);
    _cachedTableInfo = null;
    _cachedAt = now;
    return null;
  }
}

/**
 * Helper para formatear JSON -> string si la columna existe
 */
function maybeStringify(val) {
  if (val === null || val === undefined) return null;
  try {
    return typeof val === 'string' ? val : JSON.stringify(val);
  } catch {
    return String(val);
  }
}

/* ------------------ API pública del servicio ------------------ */

export const getNotificationsByUser = async (
  userId,
  { limit = 50, offset = 0, read = null } = {},
) => {
  const tableInfo = await getNotificationsTableInfo();
  if (!tableInfo) {
    console.warn(
      'getNotificationsByUser: tabla notifications no encontrada (omitido).',
    );
    return [];
  }

  const q = [];
  const params = [userId];
  let idx = 2;

  let baseQuery = `SELECT * FROM ${tableInfo.qualifiedName} WHERE user_id = $1`;

  if (read !== null) {
    baseQuery += ` AND read = $${idx++}`;
    params.push(read);
  }

  baseQuery += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);

  const result = await pool.query(baseQuery, params);
  return result.rows;
};

export const markAsRead = async (notificationId, userId) => {
  const tableInfo = await getNotificationsTableInfo();
  if (!tableInfo) {
    console.warn('markAsRead: tabla notifications no encontrada (omitido).');
    return null;
  }

  console.info(
    '[markAsRead] intentando marcar id=%s para user_id=%s en %s',
    notificationId,
    userId,
    tableInfo.qualifiedName,
  );

  // Comprobar existencia previa (solo para debugging)
  try {
    const pre = await pool.query(
      `SELECT id, user_id, read FROM ${tableInfo.qualifiedName} WHERE id = $1`,
      [notificationId],
    );
    console.info(
      '[markAsRead] pre-check rowCount=%d rows=%o',
      pre.rowCount,
      pre.rows[0] ?? null,
    );
    console.info('[markAsRead] pre-check rows=%d', pre.rowCount);
    if (pre.rowCount > 0) {
      console.info(
        '[markAsRead] pre-check row user_id=%s read=%s',
        pre.rows[0].user_id,
        pre.rows[0].read,
      );
    } else {
      console.info(
        '[markAsRead] no existe notificación con id=%s en %s',
        notificationId,
        tableInfo.qualifiedName,
      );
    }
  } catch (e) {
    console.warn('[markAsRead] pre-check fallo:', e?.message || e);
  }

  const result = await pool.query(
    `UPDATE ${tableInfo.qualifiedName}
     SET read = TRUE, read_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [notificationId, userId],
  );

  console.info('[markAsRead] update rowCount=%d', result.rowCount);
  if (result.rowCount === 0) {
    // opcional: log detallado
    console.warn(
      '[markAsRead] UPDATE no afectó filas. id=%s userId=%s',
      notificationId,
      userId,
    );
  }

  return result.rows[0] || null;
};

export const markAllAsRead = async (userId) => {
  const tableInfo = await getNotificationsTableInfo();
  if (!tableInfo) {
    console.warn('markAllAsRead: tabla notifications no encontrada (omitido).');
    return [];
  }

  const result = await pool.query(
    `UPDATE ${tableInfo.qualifiedName}
     SET read = TRUE, read_at = NOW()
     WHERE user_id = $1 AND COALESCE(read, false) = FALSE
     RETURNING *`,
    [userId],
  );
  return result.rows;
};

export const deleteNotification = async (notificationId, userId) => {
  const tableInfo = await getNotificationsTableInfo();
  if (!tableInfo) {
    console.warn(
      'deleteNotification: tabla notifications no encontrada (omitido).',
    );
    return null;
  }

  const result = await pool.query(
    `DELETE FROM ${tableInfo.qualifiedName}
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [notificationId, userId],
  );
  return result.rows[0] || null;
};

export const createNotification = async (
  userId,
  { title, body, type = null, data = null, metadata = null },
) => {
  const tableInfo = await getNotificationsTableInfo();
  if (!tableInfo) {
    console.warn(
      'createNotification: tabla notifications no encontrada (omitido).',
    );
    return null;
  }

  const cols = tableInfo.columns;

  const desiredMap = {
    user_id: userId,
    title: title ?? null,
    body: body ?? null,
    type: type ?? null,
    data: data ? maybeStringify(data) : null,
    metadata: metadata ? maybeStringify(metadata) : null,
    read: false,
    created_at: new Date().toISOString(),
  };

  const insertCols = Object.keys(desiredMap).filter((c) => cols.includes(c));
  if (insertCols.length === 0) {
    console.warn(
      'createNotification: no hay columnas válidas para insertar en notifications.',
    );
    return null;
  }

  const values = [];
  const placeholders = [];
  let p = 1;
  for (const col of insertCols) {
    values.push(desiredMap[col]);
    placeholders.push(`$${p++}`);
  }

  const sql = `INSERT INTO ${tableInfo.qualifiedName} (${insertCols.join(
    ',',
  )}) VALUES (${placeholders.join(',')}) RETURNING *`;
  const result = await pool.query(sql, values);
  return result.rows[0];
};

/**
 * createNotificationsBulk: insert masivo solo con columnas existentes.
 * Devuelve array de filas insertadas (si el INSERT masivo funciona), o [] si tabla no existe / error.
 */
export const createNotificationsBulk = async (userIds = [], payload = {}) => {
  if (!Array.isArray(userIds) || userIds.length === 0) return [];

  const tableInfo = await getNotificationsTableInfo();
  if (!tableInfo) {
    console.warn(
      'createNotificationsBulk: no se encontró la tabla notifications. Se omitirá guardado en BD.',
    );
    return [];
  }

  const cols = tableInfo.columns;

  if (!cols.includes('user_id')) {
    console.warn(
      'createNotificationsBulk: la tabla notifications no tiene la columna user_id. No se guardará nada.',
    );
    return [];
  }

  // Campos que queremos insertar (si existen)
  const desiredFields = [
    'user_id',
    'title',
    'body',
    'type',
    'data',
    'metadata',
    'read',
    'created_at',
  ];
  const fields = desiredFields.filter((f) => cols.includes(f));

  if (fields.length === 0) {
    console.warn(
      'createNotificationsBulk: no hay columnas válidas para insertar en notifications.',
    );
    return [];
  }

  // Construir placeholders y valores
  const values = [];
  const rowPlaceholders = [];
  let idx = 1;
  for (const uid of userIds) {
    const ph = [];
    for (const field of fields) {
      let val;
      switch (field) {
        case 'user_id':
          val = uid;
          break;
        case 'title':
          val = payload.title ?? null;
          break;
        case 'body':
          val = payload.body ?? null;
          break;
        case 'type':
          val = payload.type ?? null;
          break;
        case 'data':
          val = payload.data ? maybeStringify(payload.data) : null;
          break;
        case 'metadata':
          val = payload.metadata ? maybeStringify(payload.metadata) : null;
          break;
        case 'read':
          val = false;
          break;
        case 'created_at':
          val = new Date().toISOString();
          break;
        default:
          val = null;
      }
      values.push(val);
      ph.push(`$${idx++}`);
    }
    rowPlaceholders.push(`(${ph.join(',')})`);
  }

  const sql = `INSERT INTO ${tableInfo.qualifiedName} (${fields.join(
    ',',
  )}) VALUES ${rowPlaceholders.join(',')} RETURNING *`;

  try {
    const res = await pool.query(sql, values);
    return res.rows;
  } catch (err) {
    console.error(
      'createNotificationsBulk: error al insertar en lote:',
      err.message || err,
    );
    // Fallback: intentar insertar individualmente para no romper la lógica principal
    const inserted = [];
    for (const uid of userIds) {
      try {
        const singlePayload = {
          title: payload.title,
          body: payload.body,
          type: payload.type,
          data: payload.data,
          metadata: payload.metadata,
        };
        const row = await createNotification(uid, singlePayload);
        if (row) inserted.push(row);
      } catch (singleErr) {
        console.error(
          'createNotificationsBulk: fallback individual falló para user',
          uid,
          singleErr.message || singleErr,
        );
      }
    }
    return inserted;
  }
};

export default {
  getNotificationsByUser,
  markAsRead,
  deleteNotification,
  createNotification,
  createNotificationsBulk,
  markAllAsRead,
};
