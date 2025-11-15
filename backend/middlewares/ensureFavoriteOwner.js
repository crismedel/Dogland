// middlewares/ensureFavoriteOwner.js
import pool from '../db/db.js';

export const ensureFavoriteOwner = async (req, res, next) => {
  try {
    const userIdFromToken = req.user?.id;
    if (!userIdFromToken)
      return res.status(401).json({ error: 'Unauthorized' });

    const animalId = parseInt(req.params.animal_id, 10);
    if (isNaN(animalId))
      return res.status(400).json({ error: 'animal_id inválido' });

    // Admins pueden eliminar cualquier favorito
    if (
      req.user.roles &&
      Array.isArray(req.user.roles) &&
      req.user.roles.includes('admin')
    ) {
      return next();
    }

    const q = 'SELECT 1 FROM favorito WHERE id_usuario = $1 AND id_animal = $2';
    const result = await pool.query(q, [userIdFromToken, animalId]);

    if (result.rowCount === 0) {
      return res
        .status(403)
        .json({ error: 'No tienes permiso para eliminar este favorito' });
    }

    next();
  } catch (err) {
    next(err);
  }
};
