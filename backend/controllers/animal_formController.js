import pool from '../db/db.js';

export const createFullAnimal = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const {
      nombre_animal,
      edad_animal,
      size,
      id_raza,
      id_estado_salud,
      descripcion_adopcion,
      foto_url,
      historial_medico,
    } = req.body;
    
    // Asumimos que el ID del usuario viene del token (middleware de autenticación)
    // Tus otros controladores usan req.user.id
    const id_usuario_rescatista = req.user.id; 

    await client.query('BEGIN');

    // 1. Insertar en 'animal'
    const animalQuery = `
      INSERT INTO animal (nombre_animal, edad_animal, size, id_raza, id_estado_salud)
      VALUES ($1, $2, $3, $4, $5) RETURNING id_animal;
    `;
    const animalResult = await client.query(animalQuery, [nombre_animal, edad_animal, size, id_raza, id_estado_salud]);
    const newAnimalId = animalResult.rows[0].id_animal;

    // 2. Insertar en 'adopcion'
    const adopcionQuery = `
      INSERT INTO adopcion (id_animal, id_usuario_rescatista, descripcion)
      VALUES ($1, $2, $3);
    `;
    await client.query(adopcionQuery, [newAnimalId, id_usuario_rescatista, descripcion_adopcion]);

    // 3. Insertar en 'historial_medico'
    if (historial_medico && historial_medico.diagnostico) {
      const historialQuery = `
        INSERT INTO historial_medico (id_animal, diagnostico, tratamiento, fecha_examen)
        VALUES ($1, $2, $3, $4);
      `;
      await client.query(historialQuery, [newAnimalId, historial_medico.diagnostico, historial_medico.tratamiento, historial_medico.fecha_examen]);
    }

    // 4. Insertar en 'foto' (basado en tu MER)
    if (foto_url) {
      const fotoQuery = `INSERT INTO foto (id_animal, url) VALUES ($1, $2);`;
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
