// controllers/favoritesController.js
import pool from '../db/db.js';

// Añadir favorito (usa id_animal en body)
export const addFavorite = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { animal_id } = req.body;

    // validar existencia del animal (ajusta schema si hace falta: dogland.animal)
    const chk = await pool.query('SELECT 1 FROM animal WHERE id_animal = $1', [
      animal_id,
    ]);
    if (chk.rowCount === 0)
      return res.status(404).json({ error: 'Animal no encontrado' });

    try {
      const q =
        'INSERT INTO favorito (id_usuario, id_animal) VALUES ($1, $2) RETURNING *';
      const result = await pool.query(q, [user_id, animal_id]);
      return res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      if (err.code === '23505')
        return res.status(400).json({ error: 'Favorito ya existe' });
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

// Eliminar favorito por animal_id (usa params)
export const removeFavorite = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const animal_id = parseInt(req.params.animal_id, 10);

    const q =
      'DELETE FROM favorito WHERE id_usuario = $1 AND id_animal = $2 RETURNING *';
    const result = await pool.query(q, [user_id, animal_id]);
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Favorito no encontrado' });
    return res.json({ success: true, message: 'Favorito eliminado' });
  } catch (error) {
    next(error);
  }
};

// Obtener favoritos de un usuario por user_id (route: /api/users/:user_id/favorites)
export const getUserFavorites = async (req, res, next) => {
  try {
    const userIdParam = parseInt(req.params.user_id, 10);

    if (
      req.user.id !== userIdParam &&
      !(req.user.roles && req.user.roles.includes('admin'))
    ) {
      return res
        .status(403)
        .json({ error: 'No autorizado para ver estos favoritos' });
    }

    const q = `
      SELECT a.*, f.id_favorito, f.created_at AS favorited_at
      FROM animal a
      JOIN favorito f ON a.id_animal = f.id_animal
      WHERE f.id_usuario = $1
      ORDER BY f.created_at DESC
    `;
    const result = await pool.query(q, [userIdParam]);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Obtener favoritos del usuario autenticado (route: GET /api/favorites)
export const getCurrentUserFavorites = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autorizado' });

    const q = `
      SELECT a.*, f.id_favorito, f.created_at AS favorited_at
      FROM animal a
      JOIN favorito f ON a.id_animal = f.id_animal
      WHERE f.id_usuario = $1
      ORDER BY f.created_at DESC
    `;
    const result = await pool.query(q, [userId]);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};
