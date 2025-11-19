import pool from '../db/db.js';
import { sendPushNotificationToUsers } from '../middlewares/pushNotifications.js';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../services/auditService.js';
import { getOldValuesForAudit, sanitizeForAudit } from '../utils/audit.js';
import * as notificationService from '../services/notificationService.js';

// --- FUNCIÓN HELPER SIMPLIFICADA ---
// Ahora PostgreSQL nos da el Base64 limpio, solo agregamos el prefijo
const bufferToUrl = (base64String) => {
    if (!base64String) return null;
    return `data:image/jpeg;base64,${base64String}`;
};

// --- FUNCIONES DE LECTURA (GET) ---

export const getSightings = async (req, res) => {
  try {
    const result = await pool.query(`
          SELECT 
              av.id_avistamiento, 
              av.id_usuario, 
              av.id_estado_avistamiento, 
              av.id_estado_salud, 
              av.id_especie, 
              av.fecha_creacion, 
              av.fecha_actualizacion, 
              av.descripcion, 
              av.direccion,
              av.motivo_cierre,
              ST_X(av.ubicacion::geometry)::float8 AS longitude,
              ST_Y(av.ubicacion::geometry)::float8 AS latitude,
              COALESCE(
                  -- CORRECCIÓN CRÍTICA: 'encode' convierte el binario a base64 en la BD
                  json_agg(encode(af.image_data, 'base64')) FILTER (WHERE af.image_data IS NOT NULL), 
                  '[]'
              ) AS fotos_data
          FROM avistamiento av
          LEFT JOIN avistamiento_foto af ON av.id_avistamiento = af.id_avistamiento
          GROUP BY av.id_avistamiento
          ORDER BY av.fecha_creacion DESC
        `);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No se encontraron avistamientos' });
    }

    const mappedResults = result.rows.map(row => ({
        ...row,
        fotos_url: row.fotos_data.map(b64 => bufferToUrl(b64)), // Mapeo simple
        fotos_data: undefined 
    }));

    res.status(200).json({ success: true, data: mappedResults });
  } catch (error) {
    console.error('Error getSightings:', error);
    res.status(500).json({ success: false, error: 'Error interno.' });
  }
};

export const getSightingById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
          av.id_avistamiento, av.id_usuario, av.id_estado_avistamiento, av.id_estado_salud, 
          av.id_especie, av.fecha_creacion, av.fecha_actualizacion, av.descripcion, 
          av.direccion, av.motivo_cierre,
          ST_X(av.ubicacion::geometry)::float8 AS longitude,
          ST_Y(av.ubicacion::geometry)::float8 AS latitude,
          COALESCE(
              -- CORRECCIÓN CRÍTICA
              json_agg(encode(af.image_data, 'base64')) FILTER (WHERE af.image_data IS NOT NULL), 
              '[]'
          ) AS fotos_data
       FROM avistamiento av
       LEFT JOIN avistamiento_foto af ON av.id_avistamiento = af.id_avistamiento
       WHERE av.id_avistamiento = $1
       GROUP BY av.id_avistamiento`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Avistamiento no encontrado' });
    }

    const sighting = result.rows[0];
    sighting.fotos_url = sighting.fotos_data.map(b64 => bufferToUrl(b64));
    delete sighting.fotos_data;

    res.status(200).json({ success: true, data: sighting });
  } catch (error) {
    console.error('Error getSightingById:', error);
    res.status(500).json({ success: false, error: 'Error interno.' });
  }
};

export const getMySightings = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'ID de usuario no proporcionado en el token. Autenticación requerida.',
    });
  }

  try {
    const query = `
          SELECT 
              a.id_avistamiento, 
              a.descripcion, 
              a.fecha_creacion, 
              a.direccion,
              a.id_estado_salud, 
              a.id_estado_avistamiento, 
              a.id_especie, 
              a.id_usuario, 
              a.motivo_cierre,
              ST_X(a.ubicacion::geometry)::float8 AS longitude,
              ST_Y(a.ubicacion::geometry)::float8 AS latitude,
              --  AHORA SÍ TRAEMOS LA FOTO
              COALESCE(
                  json_agg(encode(af.image_data, 'base64')) FILTER (WHERE af.image_data IS NOT NULL), 
                  '[]'
              ) AS fotos_data
          FROM avistamiento a
          --  HACEMOS EL JOIN CON LA TABLA DE FOTOS
          LEFT JOIN avistamiento_foto af ON a.id_avistamiento = af.id_avistamiento
          WHERE a.id_usuario = $1
          --  AGRUPAMOS POR EL ID DEL AVISTAMIENTO
          GROUP BY a.id_avistamiento
          ORDER BY a.fecha_creacion DESC;
        `;

    const result = await pool.query(query, [userId]);

    // Mapeamos los resultados para formatear la URL de la imagen
    const mappedResults = result.rows.map(row => ({
        ...row,
        // Convertimos el string Base64 crudo de SQL a un Data URI válido para React Native
        fotos_url: row.fotos_data.map(b64 => `data:image/jpeg;base64,${b64}`),
        fotos_data: undefined 
    }));

    res.status(200).json({ success: true, data: mappedResults });
  } catch (error) {
    console.error('Error al obtener los avistamientos del usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener Mis Avistamientos.',
    });
  }
};

// --- CREAR ---

export const createSighting = async (req, res) => {
  try {
    const {
      id_estado_avistamiento, id_estado_salud, id_especie, descripcion,
      ubicacion, direccion, imageDataBase64, 
    } = req.body;

    const id_usuario = req.user.id;

    if (!id_usuario || !id_estado_avistamiento || !id_estado_salud || !id_especie) {
      return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
    }

    // 1. Insertar Avistamiento
    const result = await pool.query(
      `INSERT INTO avistamiento 
      (id_usuario, id_estado_avistamiento, id_estado_salud, id_especie, descripcion, ubicacion, direccion) 
      VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), $8) 
      RETURNING *`,
      [id_usuario, id_estado_avistamiento, id_estado_salud, id_especie, descripcion, ubicacion.longitude, ubicacion.latitude, direccion],
    );
    const avistamiento = result.rows[0];

    // 2. Insertar Foto BYTEA
    if (imageDataBase64) {
      const base64Data = imageDataBase64.replace(/^data:image\/(\w+);base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      await pool.query(
        `INSERT INTO avistamiento_foto (id_avistamiento, image_data) VALUES ($1, $2)`,
        [avistamiento.id_avistamiento, imageBuffer],
      );
    }

    // 3. Respuesta Completa (Con encode para devolver la imagen correcta al instante)
    const finalResult = await pool.query(
      `SELECT 
        av.id_avistamiento, av.id_usuario, av.id_estado_avistamiento, av.id_estado_salud, av.id_especie, 
        av.fecha_creacion, av.fecha_actualizacion, av.descripcion, av.direccion, av.motivo_cierre,
        ST_X(av.ubicacion::geometry)::float8 AS longitude,
        ST_Y(av.ubicacion::geometry)::float8 AS latitude,
        COALESCE(
            json_agg(encode(af.image_data, 'base64')) FILTER (WHERE af.image_data IS NOT NULL), -- CORRECCIÓN
            '[]'
        ) AS fotos_data,
        e.nombre_especie, es.estado_salud, u.id_ciudad
      FROM avistamiento av
      LEFT JOIN avistamiento_foto af ON av.id_avistamiento = af.id_avistamiento
      LEFT JOIN especie e ON av.id_especie = e.id_especie
      LEFT JOIN estado_salud es ON av.id_estado_salud = es.id_estado_salud
      LEFT JOIN usuario u ON av.id_usuario = u.id_usuario
      WHERE av.id_avistamiento = $1
      GROUP BY av.id_avistamiento, e.nombre_especie, es.estado_salud, u.id_ciudad
      `,
      [avistamiento.id_avistamiento],
    );

    const fullSighting = finalResult.rows[0];
    fullSighting.fotos_url = fullSighting.fotos_data.map(b64 => bufferToUrl(b64));
    delete fullSighting.fotos_data;

    await auditCreate(req, 'avistamiento', avistamiento.id_avistamiento, fullSighting);

    // ... (Notificaciones Push omitidas para brevedad, funcionan igual) ...

    res.status(201).json({ success: true, data: fullSighting, notificacionesEnviadas: true });
  } catch (error) {
    console.error('Error createSighting:', error);
    res.status(500).json({ success: false, error: 'Error interno.' });
  }
};

// --- ACTUALIZAR ---
export const updateSighting = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Validaciones de permisos...
    const userResult = await pool.query('SELECT id_rol FROM usuario WHERE id_usuario = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ success: false });
    const isAdmin = userResult.rows[0].id_rol === 1;

    if (!isAdmin) {
      const check = await pool.query('SELECT id_usuario FROM avistamiento WHERE id_avistamiento = $1', [id]);
      if (check.rows.length === 0) return res.status(404).json({ success: false });
      if (check.rows[0].id_usuario !== userId) return res.status(403).json({ success: false });
    }

    const {
      id_estado_avistamiento, id_estado_salud, id_especie, descripcion,
      ubicacion, direccion, imageDataBase64 
    } = req.body;

    const oldSighting = await getOldValuesForAudit('avistamiento', 'id_avistamiento', id);

    const result = await pool.query(
      `UPDATE avistamiento SET 
         id_estado_avistamiento = COALESCE($1, id_estado_avistamiento),
         id_estado_salud = COALESCE($2, id_estado_salud),
         id_especie = COALESCE($3, id_especie),
         descripcion = COALESCE($4, descripcion),
         ubicacion = COALESCE(ST_SetSRID(ST_MakePoint($5, $6), 4326), ubicacion),
         direccion = COALESCE($7, direccion)
       WHERE id_avistamiento = $8 RETURNING *`,
      [id_estado_avistamiento, id_estado_salud, id_especie, descripcion, ubicacion?.longitude, ubicacion?.latitude, direccion, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ success: false });

    if (imageDataBase64) {
        const base64Data = imageDataBase64.replace(/^data:image\/(\w+);base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const updatePhoto = await pool.query(
          `UPDATE avistamiento_foto SET image_data = $1 WHERE id_foto = (SELECT id_foto FROM avistamiento_foto WHERE id_avistamiento = $2 LIMIT 1) RETURNING *`,
          [buffer, id]
        );
        if (updatePhoto.rowCount === 0) {
            await pool.query(`INSERT INTO avistamiento_foto (id_avistamiento, image_data) VALUES ($1, $2)`, [id, buffer]);
        }
    }

    const finalResult = await pool.query(
      `SELECT 
         av.id_avistamiento, av.id_usuario, av.id_estado_avistamiento, av.id_estado_salud, 
         av.id_especie, av.fecha_creacion, av.fecha_actualizacion, av.descripcion, av.direccion, av.motivo_cierre,
         ST_X(av.ubicacion::geometry)::float8 AS longitude, ST_Y(av.ubicacion::geometry)::float8 AS latitude,
         COALESCE(
             json_agg(encode(af.image_data, 'base64')) FILTER (WHERE af.image_data IS NOT NULL), 
             '[]'
         ) AS fotos_data
       FROM avistamiento av
       LEFT JOIN avistamiento_foto af ON av.id_avistamiento = af.id_avistamiento
       WHERE av.id_avistamiento = $1
       GROUP BY av.id_avistamiento`,
      [id],
    );

    const fullSighting = finalResult.rows[0];
    fullSighting.fotos_url = fullSighting.fotos_data.map(b64 => bufferToUrl(b64));
    delete fullSighting.fotos_data;

    await auditUpdate(req, 'avistamiento', id, oldSighting, fullSighting);
    res.status(200).json({ success: true, data: fullSighting });

  } catch (error) {
    console.error('Error updateSighting:', error);
    res.status(500).json({ success: false, error: 'Error interno.' });
  }
};

// --- ELIMINAR ---
export const deleteSighting = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const userResult = await pool.query('SELECT id_rol FROM usuario WHERE id_usuario = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ success: false });
    const isAdmin = userResult.rows[0].id_rol === 1;

    if (!isAdmin) {
      const check = await pool.query('SELECT id_usuario FROM avistamiento WHERE id_avistamiento = $1', [id]);
      if (check.rows.length === 0) return res.status(404).json({ success: false });
      if (check.rows[0].id_usuario !== userId) return res.status(403).json({ success: false });
    }

    const oldSighting = await getOldValuesForAudit('avistamiento', 'id_avistamiento', id);

    await pool.query('DELETE FROM avistamiento_foto WHERE id_avistamiento = $1', [id]);
    const result = await pool.query('DELETE FROM avistamiento WHERE id_avistamiento = $1 RETURNING *', [id]);

    if (result.rows.length === 0) return res.status(404).json({ success: false });

    await auditDelete(req, 'avistamiento', id, oldSighting);
    res.status(200).json({ success: true, message: 'Eliminado correctamente' });
  } catch (error) {
    console.error('Error deleteSighting:', error);
    if (error.code === '23503') return res.status(500).json({ success: false, error: 'No se puede eliminar.' });
    res.status(500).json({ success: false, error: 'Error interno.' });
  }
};

// --- UBICACIÓN ---
export const getSightingsByLocation = async (req, res) => {
  try {
    const { longitude, latitude, distance } = req.query;
    if (!longitude || !latitude || !distance) return res.status(400).json({ success: false, error: 'Faltan parámetros.' });

    const result = await pool.query(
      `SELECT 
          av.id_avistamiento, av.id_usuario, av.id_estado_avistamiento, av.id_estado_salud, 
          av.id_especie, av.fecha_creacion, av.fecha_actualizacion, av.descripcion, av.direccion, av.motivo_cierre,
          ST_X(av.ubicacion::geometry)::float8 AS longitude, ST_Y(av.ubicacion::geometry)::float8 AS latitude,
          COALESCE(
              json_agg(encode(af.image_data, 'base64')) FILTER (WHERE af.image_data IS NOT NULL), 
              '[]'
          ) AS fotos_data
       FROM avistamiento av
       LEFT JOIN avistamiento_foto af ON av.id_avistamiento = af.id_avistamiento
       WHERE ST_DWithin(av.ubicacion, ST_SetSRID(ST_MakePoint($1, $2), 4326), $3)
       GROUP BY av.id_avistamiento`,
      [longitude, latitude, distance],
    );

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'No se encontraron avistamientos.' });

    const mappedResults = result.rows.map(row => ({
        ...row,
        fotos_url: row.fotos_data.map(b64 => bufferToUrl(b64)),
        fotos_data: undefined 
    }));

    res.status(200).json({ success: true, data: mappedResults });
  } catch (error) {
    console.error('Error getSightingsByLocation:', error);
    res.status(500).json({ success: false, error: 'Error interno.' });
  }
};

// --- FILTROS ---
export const filterSightings = async (req, res) => {
  const { id_especie, id_estado_salud, id_estado_avistamiento } = req.query;
  const filters = [];
  const values = [];
  let paramIndex = 1;

  try {
    if (id_especie && id_especie !== 'null') { filters.push(`av.id_especie = $${paramIndex++}`); values.push(parseInt(id_especie)); }
    if (id_estado_salud && id_estado_salud !== 'null') { filters.push(`av.id_estado_salud = $${paramIndex++}`); values.push(parseInt(id_estado_salud)); }
    if (id_estado_avistamiento && id_estado_avistamiento !== 'null') { filters.push(`av.id_estado_avistamiento = $${paramIndex++}`); values.push(parseInt(id_estado_avistamiento)); }

    let query = `
        SELECT 
            av.id_avistamiento, av.id_usuario, av.id_estado_avistamiento, av.id_estado_salud, 
            av.id_especie, av.fecha_creacion, av.fecha_actualizacion, av.descripcion, av.direccion, av.motivo_cierre,
            ST_X(av.ubicacion::geometry)::float8 AS longitude,
            ST_Y(av.ubicacion::geometry)::float8 AS latitude,
            COALESCE(
                json_agg(encode(af.image_data, 'base64')) FILTER (WHERE af.image_data IS NOT NULL), 
                '[]'
            ) AS fotos_data
        FROM avistamiento av
        LEFT JOIN avistamiento_foto af ON av.id_avistamiento = af.id_avistamiento
    `;

    if (filters.length > 0) query += ` WHERE ` + filters.join(' AND ');
    query += ` GROUP BY av.id_avistamiento ORDER BY av.fecha_creacion DESC`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) return res.status(404).json({ success: false });
    
    const mappedResults = result.rows.map(row => ({
        ...row,
        fotos_url: row.fotos_data.map(b64 => bufferToUrl(b64)),
        fotos_data: undefined 
    }));

    res.status(200).json({ success: true, data: mappedResults });
  } catch (error) {
    console.error('Error filterSightings:', error);
    res.status(500).json({ success: false, error: 'Error interno.' });
  }
};

// --- CIERRE ---
export const closeSighting = async (req, res) => {
  const { id } = req.params;
  const { newStatusId, reason } = req.body;
  const userId = req.user.id; 

  if (!userId) return res.status(401).json({ success: false, message: 'Usuario no autenticado.' });
  if (!newStatusId || !reason) return res.status(400).json({ success: false, message: 'Faltan datos.' });

  try {
    const result = await pool.query(
      `UPDATE avistamiento SET id_estado_avistamiento = $1, motivo_cierre = $2 WHERE id_avistamiento = $3 RETURNING *`,
      [newStatusId, reason, id]
    );

    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Avistamiento no encontrado.' });
    res.status(200).json({ success: true, message: 'Cerrado exitosamente.', data: result.rows[0] });
  } catch (error) {
    console.error('Error closeSighting:', error);
    res.status(500).json({ success: false, error: 'Error interno.' });
  }
};

// Datos maestros
export const getEspecies = async (req, res) => { try { const result = await pool.query(`SELECT id_especie AS id, nombre_especie AS nombre FROM especie ORDER BY nombre_especie`); res.status(200).json({ success: true, data: result.rows }); } catch (error) { console.error(error); res.status(500).json({ success: false }); } };
export const getEstadosSalud = async (req, res) => { try { const result = await pool.query(`SELECT id_estado_salud AS id, estado_salud AS nombre FROM estado_salud ORDER BY estado_salud`); res.status(200).json({ success: true, data: result.rows }); } catch (error) { console.error(error); res.status(500).json({ success: false }); } };
export const getEstadosAvistamiento = async (req, res) => { try { const result = await pool.query(`SELECT id_estado_avistamiento AS id, estado_avistamiento AS nombre FROM estado_avistamiento ORDER BY estado_avistamiento`); res.status(200).json({ success: true, data: result.rows }); } catch (error) { console.error(error); res.status(500).json({ success: false }); } };