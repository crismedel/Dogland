import pool from '../db/db.js';

export const getFullAnimals = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        a.id_animal,
        a.nombre_animal,
        a.edad_animal,
        a.edad_aproximada,
        esal.estado_salud,
        esal.descripcion_estado_salud,
        r.nombre_raza AS raza,
        e.nombre_especie AS especie,
        ad.id_adopcion,
        ad.descripcion AS descripcion_adopcion,
        ad.disponible,
        u.nombre_usuario AS rescatista,
        COALESCE(
          json_agg(DISTINCT f.url) FILTER (WHERE f.url IS NOT NULL),
          '[]'
        ) AS fotos,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'fecha_examen', hm.fecha_examen,
              'diagnostico', hm.diagnostico,
              'tratamiento', hm.tratamiento
            )
          ) FILTER (WHERE hm.id_historial_medico IS NOT NULL),
          '[]'
        ) AS historial_medico
      FROM animal a
      LEFT JOIN estado_salud esal ON a.id_estado_salud = esal.id_estado_salud
      LEFT JOIN raza r ON a.id_raza = r.id_raza
      LEFT JOIN especie e ON r.id_especie = e.id_especie
      LEFT JOIN adopcion ad ON ad.id_animal = a.id_animal
      LEFT JOIN usuario u ON ad.id_usuario_rescatista = u.id_usuario
      LEFT JOIN foto f ON f.id_animal = a.id_animal
      LEFT JOIN historial_medico hm ON hm.id_animal = a.id_animal
      GROUP BY
        a.id_animal,
        esal.estado_salud,
        esal.descripcion_estado_salud,
        r.nombre_raza,
        e.nombre_especie,
        ad.id_adopcion,
        ad.descripcion,
        ad.disponible,
        u.nombre_usuario
      ORDER BY a.id_animal ASC;
    `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    console.error('Error en getFullAnimals:', error);
    next(error);
  }
};
