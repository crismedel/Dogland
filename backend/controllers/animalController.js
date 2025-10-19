import pool from '../db/db.js';
import { auditCreate, auditUpdate, auditDelete } from '../services/auditService.js';
import { getOldValuesForAudit } from '../utils/audit.js';

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
    const orgResult = await pool.query(
      `SELECT id_organizacion FROM usuario WHERE id_usuario = $1`,
      [req.params.id],
    );

    if (orgResult.rowCount === 0 || orgResult.rows[0].id_organizacion === null) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado o sin organización'
      });
    }

    const id_organizacion = orgResult.rows[0].id_organizacion;

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
      [id_organizacion],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'No se encontraron animales para esta organización' 
      });
    }

    res.json({ success: true, data: result.rows, count: result.rowCount });
  } catch (error) {
    next(error);
  }
};

// ✅ Crear un nuevo animal
export const createAnimal = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { nombre_animal, edad_animal, edad_aproximada, id_estado_salud, id_raza } = req.body;

    // Validacion de campos requeridos
    if (!nombre_animal || !id_estado_salud || !id_raza) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: nombre_animal, id_estado_salud, id_raza',
      });
    }

    await client.query('BEGIN');

    // Insertar el animal
    const result = await client.query(
      `
      INSERT INTO animal (nombre_animal, edad_animal, edad_aproximada, id_estado_salud, id_raza)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [nombre_animal, edad_animal, edad_aproximada, id_estado_salud, id_raza],
    );

    const newAnimal = result.rows[0];

    // Auditar creacion
    await auditCreate(req, 'animal', newAnimal.id_animal, {
      nombre_animal: newAnimal.nombre_animal,
      edad_animal: newAnimal.edad_animal,
      edad_aproximada: newAnimal.edad_aproximada,
      id_estado_salud: newAnimal.id_estado_salud,
      id_raza: newAnimal.id_raza
    });

    await client.query('COMMIT');

    res.status(201).json({ 
      success: true, 
      data: newAnimal,
      message: 'Animal creado exitosamente'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// ✅ Actualizar un animal
export const updateAnimal = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { nombre_animal, edad_animal, edad_aproximada, id_estado_salud, id_raza } = req.body;

    // Obtener valores antiguos antes de actualizar
    const oldValues = await getOldValuesForAudit('animal', 'id_animal', id);

    if (!oldValues) {
      return res.status(404).json({
        success: false,
        error: 'Animal no encontrado'
      });
    }

    await client.query('BEGIN');

    // Actualizar el animal
    const result = await client.query(
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
      [nombre_animal, edad_animal, edad_aproximada, id_estado_salud, id_raza, id],
    );

    const updatedAnimal = result.rows[0];

    // Auditar actualizacion con valores antiguos y nuevos
    await auditUpdate(req, 'animal', id, oldValues, {
      nombre_animal: updatedAnimal.nombre_animal,
      edad_animal: updatedAnimal.edad_animal,
      edad_aproximada: updatedAnimal.edad_aproximada,
      id_estado_salud: updatedAnimal.id_estado_salud,
      id_raza: updatedAnimal.id_raza
    });

    await client.query('COMMIT');

    res.json({ 
      success: true,
      data: updatedAnimal,
      message: 'Animal actualizado exitosamente'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// ✅ Eliminar un animal
export const deleteAnimal = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    // Obtener valores antes de eliminar
    const oldValues = await getOldValuesForAudit('animal', 'id_animal', id);

    if (!oldValues) {
      return res.status(404).json({ 
        success: false, 
        error: 'Animal no encontrado' 
      });
    }

    await client.query('BEGIN');

    // Eliminar el animal
    const result = await client.query(
      'DELETE FROM animal WHERE id_animal = $1 RETURNING *',
      [id],
    );

    // Auditar Eliminacion
    await auditDelete(req, 'animal', id, oldValues);

    await client.query('COMMIT');

    res.json({ 
      success: true,
      message: 'Animal eliminado correctamente',
      data: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};


// Cambiar estado de salud de un animal
export const updateAnimalHealthStatus = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { id_estado_salud, observaciones } = req.body;

    if (!id_estado_salud) {
      return res.status(400).json({
        success: false,
        error: 'El campo id_estado_salud es requerido',
      });
    }

    // Obtener valores antiguos
    const oldValues = await getOldValuesForAudit('animal', 'id_animal', id);

    if (!oldValues) {
      return res.status(404).json({
        success: false,
        error: 'Animal no encontrado',
      });
    }

    await client.query('BEGIN');

    // Actualizar solo el estado de salud
    const result = await client.query(
      `
      UPDATE animal
      SET id_estado_salud = $1
      WHERE id_animal = $2
      RETURNING *
      `,
      [id_estado_salud, id],
    );

    const updatedAnimal = result.rows[0];

    // Auditar con información adicional
    await auditUpdate(req, 'animal', id, oldValues, {
      id_estado_salud: updatedAnimal.id_estado_salud,
      observaciones: observaciones || 'Cambio de estado de salud',
      campo_modificado: 'estado_salud'
    });

    await client.query('COMMIT');

    res.json({ 
      success: true,
      data: updatedAnimal,
      message: 'Estado de salud actualizado exitosamente',
    });

  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Obtener historial de cambios de un animal
export const getAnimalAuditHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que el animal existe
    const animalCheck = await pool.query(
      'SELECT id_animal FROM animal WHERE id_animal = $1',
      [id]
    );

    if (animalCheck.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Animal no encontrado' 
      });
    }

    // Obtener historial de auditoria
    const result = await pool.query(
      `
      SELECT 
        al.id_audit,
        al.action,
        al.old_values,
        al.new_values,
        al.created_at,
        al.ip_address,
        u.nombre_usuario as usuario_modificador,
        u.email_usuario
      FROM audit_logs al
      LEFT JOIN usuario u ON u.id_usuario = al.id_usuario
      WHERE al.table_name = 'animal' 
        AND al.record_id = $1
      ORDER BY al.created_at DESC
      `,
      [id]
    );

    res.json({ 
      success: true, 
      data: result.rows,
      count: result.rowCount,
      animal_id: id
    });

  } catch (error) {
    next(error);
  }
};
