import pool from '../db/db.js';

// GET /user/profile-image/:userId
// Devuelve metadatos (no el binario)
export const getProfilePhoto = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT id_usuario,
              CASE WHEN foto_perfil_blob IS NOT NULL THEN true ELSE false END AS has_photo,
              foto_perfil_mime,
              foto_perfil_updated_at
       FROM usuario
       WHERE id_usuario = $1`,
      [userId],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Usuario no encontrado' });
    }

    // Puedes incluir una URL de tu API para recuperar el binario
    const row = result.rows[0];
    const fileUrl = row.has_photo
      ? `${req.protocol}://${req.get(
          'host',
        )}/api/user/profile-image/${userId}/file`
      : null;

    res.json({
      success: true,
      data: {
        id_usuario: row.id_usuario,
        has_photo: row.has_photo,
        foto_perfil_mime: row.foto_perfil_mime,
        foto_perfil_updated_at: row.foto_perfil_updated_at,
        foto_perfil_api_url: fileUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /user/profile-image/:userId/file
// Devuelve el binario de la imagen
// GET /user/profile-image/:userId/file
export const getProfilePhotoFile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT foto_perfil_blob, foto_perfil_mime
       FROM usuario
       WHERE id_usuario = $1`,
      [userId],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Usuario no encontrado' });
    }

    const row = result.rows[0];
    if (!row.foto_perfil_blob) {
      return res
        .status(404)
        .json({ success: false, error: 'Sin imagen de perfil' });
    }

    res.set('Content-Type', row.foto_perfil_mime || 'image/webp');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.send(row.foto_perfil_blob);
  } catch (error) {
    console.error('❌ Error en getProfilePhotoFile:', error); // ⬅️ AGREGAR
    next(error);
  }
};

// POST /user/profile-image/upload/:userId
// Guarda/actualiza el blob en la BD
export const uploadProfilePhoto = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { userId } = req.params;
    const image = req.processedImage;

    if (!image) {
      return res
        .status(400)
        .json({ success: false, error: 'Imagen no procesada' });
    }

    const userRes = await client.query(
      'SELECT id_usuario FROM usuario WHERE id_usuario = $1',
      [userId],
    );

    if (userRes.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Usuario no encontrado' });
    }

    const upd = await client.query(
      `UPDATE usuario
         SET foto_perfil_blob = $1,
             foto_perfil_mime = $2,
             foto_perfil_updated_at = NOW(),
             foto_perfil = NULL,
             foto_perfil_url = NULL
       WHERE id_usuario = $3
       RETURNING id_usuario, foto_perfil_mime, foto_perfil_updated_at`,
      [image.buffer, image.mimetype, userId],
    );

    res.json({
      success: true,
      message: 'Foto de perfil actualizada',
      data: upd.rows[0],
    });
  } catch (error) {
    console.error('❌ Error en uploadProfilePhoto:', error); // ⬅️ Debug
    next(error);
  } finally {
    client.release();
  }
};

// DELETE /user/profile-image/:userId
// Limpia el blob en la BD
export const deleteProfilePhoto = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { userId } = req.params;

    const userRes = await client.query(
      'SELECT id_usuario FROM usuario WHERE id_usuario = $1',
      [userId],
    );
    if (userRes.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Usuario no encontrado' });
    }

    await client.query(
      `UPDATE usuario
         SET foto_perfil_blob = NULL,
             foto_perfil_mime = NULL,
             foto_perfil_updated_at = NOW(),
             foto_perfil = NULL,
             foto_perfil_url = NULL
       WHERE id_usuario = $1`,
      [userId],
    );

    res.json({ success: true, message: 'Foto de perfil eliminada' });
  } catch (error) {
    next(error);
  } finally {
    client.release();
  }
};
