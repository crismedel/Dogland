import pool from '../db/db.js';

export const getFullAnimals = async (req, res, next) => {
  try {
    const query = `
      SELECT
        a.id_animal AS "id",
        a.nombre_animal AS "name",
        a.edad_animal AS "age",
        r.nombre_raza AS "breed",
        e.nombre_especie AS "species",
        
        -- 1. Se devuelve el ID numérico y el texto del estado de salud
        esal.id_estado_salud AS "estadoMedico", 
        esal.estado_salud AS "health",
        
        -- 2. Se obtiene UNA SOLA imagen (la primera que encuentre)
        (SELECT f.url FROM foto f WHERE f.id_animal = a.id_animal LIMIT 1) AS "imageUrl",
        
        -- 3. Se añade el campo 'size' (NOTA: ¡Debes agregarlo a tu tabla 'animal'!)
        a.size, -- Asumiendo que agregarás la columna 'size' a la tabla 'animal'
        
        ad.descripcion AS "descripcionMedica" -- Usando la descripción de adopción

      FROM animal a
      LEFT JOIN estado_salud esal ON a.id_estado_salud = esal.id_estado_salud
      LEFT JOIN raza r ON a.id_raza = r.id_raza
      LEFT JOIN especie e ON r.id_especie = e.id_especie
      LEFT JOIN adopcion ad ON ad.id_animal = a.id_animal
      
      -- Filtramos solo los que están disponibles para adopción
      WHERE ad.disponible = TRUE 
      
      ORDER BY a.fecha_creacion DESC; -- Ordenar por fecha de creación es más útil
    `;

    const result = await pool.query(query);

    // Mapeamos los resultados para asegurar que los campos nulos sean consistentes
    const formattedData = result.rows.map(animal => ({
      ...animal,
      imageUrl: animal.imageUrl || null, // Si no hay imagen, envía null
      size: animal.size || 'No especificado', // Valor por defecto si 'size' es nulo
    }));

    res.json({
      success: true,
      count: result.rowCount,
      data: formattedData,
    });

  } catch (error) {
    console.error('Error en getFullAnimals:', error);
    next(error);
  }
};