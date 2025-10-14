import pool from '../db/db.js';

// GET /animals/:id/medicalHistory - Obtener historial medico de un animal
export const getAnimalMedicalHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT * FROM historial_medico
      WHERE id_animal = $1
      ORDER BY fecha_evento DESC
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró historial médico para este animal'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// POST /animals/:id/medicalHistory - Crear nuevo evento medico
export const createMedicalHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fecha_evento, tipo_evento, diagnostico, detalles, nombre_veterinario } = req.body;

    // Validar que el animal existe
    const animalCheck = await pool.query(
      'SELECT id_animal FROM animal WHERE id_animal = $1',
      [id]
    );

    if (animalCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado'
      });
    }

    const query = `
      INSERT INTO historial_medico (id_animal, fecha_evento, tipo_evento, diagnostico, detalles, nombre_veterinario)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(query, [
      id,
      fecha_evento,
      tipo_evento,
      diagnostico || null,
      detalles || null,
      nombre_veterinario || null
    ]);

    res.status(201).json({
      success: true,
      message: 'Evento médico creado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// GET /animals/:id/medicalHistory/:historyId - Obtener detalle de un evento medico
export const getMedicalHistoryDetail = async (req, res, next) => {
  try {
    const { id, historyId } = req.params;

    const query = `
      SELECT * FROM historial_medico
      WHERE id_historial_medico = $1 AND id_animal = $2
    `;

    const result = await pool.query(query, [historyId, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Evento médico no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// PUT /animals/:id/medicalHistory/:historyId - Actualizar evento medico
export const updateMedicalHistory = async (req, res, next) => {
  try {
    const { id, historyId } = req.params;
    const { fecha_evento, tipo_evento, diagnostico, detalles, nombre_veterinario } = req.body;

    // Verificar que el evento pertenece al animal
    const checkQuery = `
      SELECT id_historial_medico FROM historial_medico
      WHERE id_historial_medico = $1 AND id_animal = $2
    `;

    const checkResult = await pool.query(checkQuery, [historyId, id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Evento médico no encontrado'
      });
    }

    const updateQuery = `
      UPDATE historial_medico
      SET fecha_evento = COALESCE($1, fecha_evento),
          tipo_evento = COALESCE($2, tipo_evento),
          diagnostico = COALESCE($3, diagnostico),
          detalles = COALESCE($4, detalles),
          nombre_veterinario = COALESCE($5, nombre_veterinario)
      WHERE id_historial_medico = $6 AND id_animal = $7
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      fecha_evento,
      tipo_evento,
      diagnostico,
      detalles,
      nombre_veterinario,
      historyId,
      id
    ]);

    res.status(200).json({
      success: true,
      message: 'Evento médico actualizado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /animals/:id/medicalHistory/:historyId - Eliminar evento medico
export const deleteMedicalHistory = async (req, res, next) => {
  try {
    const { id, historyId } = req.params;

    const query = `
      DELETE FROM historial_medico
      WHERE id_historial_medico = $1 AND id_animal = $2
      RETURNING *
    `;

    const result = await pool.query(query, [historyId, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Evento médico no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Evento médico eliminado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getAllMedicalHistory = async (req, res, next) => {
  try {
    const { animalId, tipo_evento, fecha_desde, fecha_hasta } = req.query;

    let query = 'SELECT * FROM historial_medico WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (animalId) {
      query += ` AND id_animal = $${paramCount}`;
      params.push(animalId);
      paramCount++;
    }

    if (tipo_evento) {
      query += ` AND tipo_evento = $${paramCount}`;
      params.push(tipo_evento);
      paramCount++;
    }

    if (fecha_desde) {
      query += ` AND fecha_evento >= $${paramCount}`;
      params.push(fecha_desde);
      paramCount++;
    }

    if (fecha_hasta) {
      query += ` AND fecha_evento <= $${paramCount}`;
      params.push(fecha_hasta);
      paramCount++;
    }

    query += ' ORDER BY fecha_evento DESC';

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      total: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};
