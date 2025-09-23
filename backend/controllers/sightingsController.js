import pool from '../db/db.js'; // Importa correctamente el pool de conexiones

// Función para obtener todos los avistamientos
export const getSightings = async (req, res) => {
  try {
    // Usa 'pool.query' en lugar de 'db.query'
    const result = await pool.query('SELECT * FROM avistamiento'); 

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
    // Usa 'pool.query' en lugar de 'db.any'
    const result = await pool.query('SELECT * FROM avistamiento WHERE id_avistamiento = $1', [id]);

    // La librería 'pg' devuelve el array de resultados en la propiedad 'rows'
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Avistamiento no encontrado' });
    }

    // Accede al resultado a través de 'result.rows'
    res.status(200).json({ success: true, data: result.rows[0] });
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

    if (!id_usuario || !id_estado_avistamiento || !id_estado_salud || !id_especie) {
      return res.status(400).json({ success: false, error: 'Faltan campos obligatorios (id_usuario, id_estado_avistamiento, id_estado_salud, id_especie)' });
    }

    // Usa 'pool.query' en lugar de 'db.query'
    const result = await pool.query(
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
        ubicacion.longitude,
        ubicacion.latitude,
        direccion
      ]
    );

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

    // Usa 'pool.query' en lugar de 'db.query'
    const result = await pool.query(
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

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Avistamiento no encontrado' });
    }

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

    // Usa 'pool.query' en lugar de 'db.query'
    const result = await pool.query(
      'DELETE FROM avistamiento WHERE id_avistamiento = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Avistamiento no encontrado' });
    }

    res.status(200).json({
      success: true,
      message: 'Avistamiento eliminado correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar el avistamiento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Función para obtener avistamientos por ubicación
export const getSightingsByLocation = async (req, res) => {
  try {
    const { longitude, latitude, distance } = req.query;

    if (!longitude || !latitude || !distance) {
      return res.status(400).json({ success: false, error: 'Faltan parámetros: longitud, latitud y distancia son requeridos' });
    }

    const result = await pool.query(
      `
      SELECT * FROM avistamiento 
      WHERE ST_DWithin(ubicacion, ST_SetSRID(ST_MakePoint($1, $2), 4326), $3);
      `,
      [longitude, latitude, distance]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No se encontraron avistamientos cerca de esta ubicación' });
    }

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al obtener avistamientos por ubicación:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};