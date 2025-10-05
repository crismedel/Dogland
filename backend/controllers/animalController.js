import pool from '../db/db.js';

// ✅ Obtener todos los animales
export const getAnimals = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT a.id_animal,
             a.nombre_animal,
             a.edad_animal,
             a.edad_aproximada,
             es.id_estado_salud AS estado_salud,
             r.id_raza
      FROM animal a
      INNER JOIN estado_salud es ON a.id_estado_salud = es.id_estado_salud
      INNER JOIN raza r ON a.id_raza = r.id_raza
      ORDER BY a.id_animal ASC
    `);
    res.json({ success: true, data: result.rows, count: result.rowCount });
  } catch (error) {
    next(error);
  }
};

// ✅ Obtener un animal específico por ID
export const getAnimalById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `
      SELECT a.id_animal,
             a.nombre_animal,
             a.edad_animal,
             a.edad_aproximada,
             es.id_estado_salud AS estado_salud,
             r.id_raza
      FROM animal a
      INNER JOIN estado_salud es ON a.id_estado_salud = es.id_estado_salud
      INNER JOIN raza r ON a.id_raza = r.id_raza
      WHERE a.id_animal = $1
    `,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Animal no encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// ✅ Obtener animales por organización
export const getAnimalsByOrganization = async (req, res, next) => {
  try {
    const result = await pool.query(
     `
     SELECT 
      a.id_animal,
      a.nombre_animal,
      a.edad_animal,
      r.id_raza,
      s.id_estado_salud,
      o.nombre_organizacion,
      u.nombre_usuario
     FROM animal a
     JOIN adopcion ad ON ad.id_animal = a.id_animal
     JOIN usuario u ON u.id_usuario = ad.id_usuario_rescatista
     JOIN organizacion o ON o.id_organizacion = u.id_organizacion
     LEFT JOIN raza r ON r.id_raza = a.id_raza
     LEFT JOIN estado_salud s ON s.id_estado_salud = a.id_estado_salud
     WHERE o.id_organizacion = $1;
    `,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Animal(es) no encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// ✅ Crear un nuevo animal
export const createAnimal = async (req, res, next) => {
  try {
    const { nombre_animal, edad_animal, edad_aproximada, id_estado_salud, id_raza } = req.body;

    if (!nombre_animal || !id_estado_salud || !id_raza) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: nombre_animal, id_estado_salud, id_raza',
      });
    }

    const result = await pool.query(
      `
      INSERT INTO animal (nombre_animal, edad_animal, edad_aproximada, id_estado_salud, id_raza)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *
    `,
      [nombre_animal, edad_animal, edad_aproximada, id_estado_salud, id_raza],
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// ✅ Actualizar un animal
export const updateAnimal = async (req, res, next) => {
  try {
    const { nombre_animal, edad_animal, edad_aproximada, id_estado_salud, id_raza } = req.body;

    const result = await pool.query(
      `
      UPDATE animal
      SET nombre_animal   = COALESCE($1, nombre_animal),
          edad_animal     = COALESCE($2, edad_animal),
          edad_aproximada = COALESCE($3, edad_aproximada),
          id_estado_salud = COALESCE($4, id_estado_salud),
          id_raza         = COALESCE($5, id_raza)
      WHERE id_animal = $6
      RETURNING *
    `,
      [nombre_animal, edad_animal, edad_aproximada, id_estado_salud, id_raza, req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Animal no encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// ✅ Eliminar un animal
export const deleteAnimal = async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM animal WHERE id_animal = $1 RETURNING *',
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Animal no encontrado' });
    }

    res.json({ success: true, message: 'Animal eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};
