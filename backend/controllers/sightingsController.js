import db from '../db/db.js';

// Función para obtener todos los avistamientos
export const getSightings = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM avistamiento'); // Usando query() con pg

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No se encontraron avistamientos' });
    }

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener los avistamientos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Función para obtener un avistamiento por ID
export const getSightingById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.any('SELECT * FROM avistamiento WHERE id_avistamiento = $1', [id]);

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Avistamiento no encontrado' });
    }

    res.status(200).json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error al obtener el avistamiento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Función para crear un nuevo avistamiento
export const createSighting = async (req, res) => {
  try {
    const {
      id_usuario, 
      id_estado_avistamiento, 
      id_estado_salud, 
      id_especie, 
      descripcion, 
      ubicacion, 
      direccion
    } = req.body;

    // Verifica que todos los campos necesarios estén presentes
    if (!id_usuario || !id_estado_avistamiento || !id_estado_salud || !id_especie) {
      return res.status(400).json({ success: false, error: 'Faltan campos obligatorios (id_usuario, id_estado_avistamiento, id_estado_salud, id_especie)' });
    }

    // Inserta el nuevo avistamiento en la base de datos
    const result = await db.query(
      `
      INSERT INTO avistamiento 
      (id_usuario, id_estado_avistamiento, id_estado_salud, id_especie, descripcion, ubicacion, direccion) 
      VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), $8) 
      RETURNING *
      `,
      [
        id_usuario,
        id_estado_avistamiento,
        id_estado_salud,
        id_especie,
        descripcion,
        ubicacion.longitude,  // Longitud
        ubicacion.latitude,   // Latitud
        direccion
      ]
    );

    // Devuelve el resultado si todo salió bien
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error al crear el avistamiento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
// Función para actualizar un avistamiento
export const updateSighting = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      id_estado_avistamiento, 
      id_estado_salud, 
      id_especie, 
      descripcion, 
      ubicacion, 
      direccion 
    } = req.body;

    // Realizar la consulta de actualización en la base de datos
    const result = await db.query(
      `
      UPDATE avistamiento 
      SET id_estado_avistamiento = COALESCE($1, id_estado_avistamiento),
          id_estado_salud = COALESCE($2, id_estado_salud),
          id_especie = COALESCE($3, id_especie),
          descripcion = COALESCE($4, descripcion),
          ubicacion = COALESCE(ST_SetSRID(ST_MakePoint($5, $6), 4326), ubicacion),
          direccion = COALESCE($7, direccion)
      WHERE id_avistamiento = $8
      RETURNING *
      `,
      [
        id_estado_avistamiento, id_estado_salud, id_especie, descripcion, 
        ubicacion.longitude, ubicacion.latitude, direccion, id
      ]
    );

    // Si no se encuentra el avistamiento, devolver 404
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Avistamiento no encontrado' });
    }

    // Responder con los datos actualizados
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar el avistamiento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
// Función para eliminar un avistamiento
export const deleteSighting = async (req, res) => {
  try {
    const { id } = req.params;

    // Realizar la consulta para eliminar el avistamiento
    const result = await db.query(
      'DELETE FROM avistamiento WHERE id_avistamiento = $1 RETURNING *',
      [id]
    );

    // Si el avistamiento no fue encontrado, devolver 404
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Avistamiento no encontrado' });
    }

    // Responder con éxito y mensaje
    res.status(200).json({
      success: true,
      message: 'Avistamiento eliminado correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar el avistamiento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
