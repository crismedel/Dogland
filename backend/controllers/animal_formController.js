//este archivo es una prueba para subir la información a la base de datos

import pool from '../db/db.js';

export const createFullAnimal = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const {
      nombre_animal,
      edad_animal,
      edad_aproximada, 
      id_raza,
      id_estado_salud,
      descripcion_adopcion,
      foto_url,
      historial_medico,
    } = req.body;
    
    // Asumimos que el ID del usuario viene del token (middleware de autenticación)
    const id_usuario_rescatista = req.user.id; 

    await client.query('BEGIN');

    // 1. Insertar en 'animal'
    const animalQuery = `
      INSERT INTO animal (nombre_animal, edad_animal, edad_aproximada, id_raza, id_estado_salud)
      VALUES ($1, $2, $3, $4, $5) RETURNING id_animal;
    `;
    const animalResult = await client.query(animalQuery, [nombre_animal, edad_animal, edad_aproximada, id_raza, id_estado_salud]);
    const newAnimalId = animalResult.rows[0].id_animal;

    // 2. Insertar en 'adopcion' (Esta consulta estaba correcta)
    const adopcionQuery = `
      INSERT INTO adopcion (id_animal, id_usuario_rescatista, descripcion)
      VALUES ($1, $2, $3);
    `;
    await client.query(adopcionQuery, [newAnimalId, id_usuario_rescatista, descripcion_adopcion]);

    // 3. Insertar en 'historial_medico'
    if (historial_medico && historial_medico.diagnostico) {
      // CORRECCIÓN 2: Se ajustan columnas a dogland.sql
      const historialQuery = `
        INSERT INTO historial_medico (id_animal, diagnostico, detalles, fecha_evento, tipo_evento, nombre_veterinario)
        VALUES ($1, $2, $3, $4, $5, $6);
      `;
      
      // Mapeamos los datos del 'body' (test) a las columnas reales de la BD
      await client.query(historialQuery, [
        newAnimalId, 
        historial_medico.diagnostico, 
        historial_medico.tratamiento, // 'tratamiento' (body) -> 'detalles' (BD)
        historial_medico.fecha_examen,  // 'fecha_examen' (body) -> 'fecha_evento' (BD)
        historial_medico.tipo_evento || 'Consulta', // 'tipo_evento' es NOT NULL, usamos un default
        historial_medico.nombre_veterinario
      ]);
    }

    // 4. Insertar en 'animal_foto'
    if (foto_url) {
      // CORRECCIÓN 3: La tabla es 'animal_foto'
      const fotoQuery = `INSERT INTO animal_foto (id_animal, url) VALUES ($1, $2);`;
      await client.query(fotoQuery, [newAnimalId, foto_url]);
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Animal creado exitosamente.', data: { id_animal: newAnimalId } });

  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};