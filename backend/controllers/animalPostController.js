import pool from '../db/db.js'; // Importamos el pool de la base de datos

/**
 * Crea un nuevo animal y registra sus fotos.
 * Utiliza una transacción para asegurar la integridad de los datos.
 */
export const crearAnimal = async (req, res, next) => {
  // Datos validados por el esquema Joi (animalPost.js)
  const {
    nombre_animal,
    edad_animal = null,
    edad_aproximada = null,
    id_estado_salud,
    id_raza = null,
    fotos, // Este es el array de URLs de fotos (opcional)
  } = req.body;

  // Cliente para la transacción
  const client = await pool.connect();

  try {
    // 1. Iniciar la transacción
    await client.query('BEGIN');

    // 2. Insertar el animal en la tabla `animal`
    const animalQuery = `
      INSERT INTO dogland.animal 
        (nombre_animal, edad_animal, edad_aproximada, id_estado_salud, id_raza)
      VALUES 
        ($1, $2, $3, $4, $5)
      RETURNING id_animal;
    `;
    const animalValues = [
      nombre_animal,
      edad_animal,
      edad_aproximada,
      id_estado_salud,
      id_raza,
    ];
    
    const animalResult = await client.query(animalQuery, animalValues);
    // Capturamos el ID del animal que acabamos de crear
    const id_animal = animalResult.rows[0].id_animal;

    // 3. Insertar las fotos en `animal_foto` (solo si se enviaron fotos)
    let fotosResult = [];
    if (fotos && fotos.length > 0) {
      const fotoQuery = `
        INSERT INTO dogland.animal_foto (id_animal, url)
        VALUES ($1, $2)
        RETURNING *;
      `;
      
      // Creamos un array de promesas (una por cada foto a insertar)
      const fotoPromises = fotos.map((url) => {
        return client.query(fotoQuery, [id_animal, url]);
      });

      // Esperamos a que todas las fotos se inserten en paralelo
      const settledResults = await Promise.all(fotoPromises);
      fotosResult = settledResults.map(res => res.rows[0]);
    }

    // 4. Si todo salió bien, confirmamos la transacción
    await client.query('COMMIT');

    // 5. Enviar respuesta de éxito (Código 201 - Creado)
    res.status(201).json({
      success: true,
      message: 'Animal registrado exitosamente',
      data: {
        id_animal: id_animal,
        nombre_animal: nombre_animal,
        fotos: fotosResult,
      },
    });

  } catch (error) {
    // 6. Si algo falla, deshacemos la transacción (ROLLBACK)
    await client.query('ROLLBACK');
    console.error('Error en la transacción al crear animal:', error);
    // Pasamos el error al middleware de errores (errorHandler)
    next(error); 
  
  } finally {
    // 7. Liberar el cliente de la pool, pase lo que pase
    client.release();
  }
};