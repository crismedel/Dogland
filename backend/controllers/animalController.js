// backend/controllers/animalController.js
import pool from '../db/db.js';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../services/auditService.js';
import { getOldValuesForAudit } from '../utils/audit.js';

// ✅ Obtener todos los animales (Con fotos y nombres reales)
export const getAnimals = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id_animal,
        a.nombre_animal,
        a.edad_animal,
        a.edad_aproximada,
        a.tamaño,
        es.estado_salud,   
        r.nombre_raza,     
        e.nombre_especie,
        COALESCE(
          json_agg(json_build_object('id', af.id_foto, 'url', af.url)) 
          FILTER (WHERE af.id_foto IS NOT NULL), 
          '[]'
        ) AS fotos
      FROM animal a
      LEFT JOIN estado_salud es ON a.id_estado_salud = es.id_estado_salud
      LEFT JOIN raza r ON a.id_raza = r.id_raza
      LEFT JOIN especie e ON r.id_especie = e.id_especie
      LEFT JOIN animal_foto af ON a.id_animal = af.id_animal
      GROUP BY a.id_animal, es.id_estado_salud, r.id_raza, e.id_especie
      ORDER BY a.id_animal DESC
    `);
    res.json({ success: true, data: result.rows, count: result.rowCount });
  } catch (error) {
    next(error);
  }
};

// ✅ Obtener un animal específico por ID (Con fotos)
export const getAnimalById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        a.id_animal,
        a.nombre_animal,
        a.edad_animal,
        a.edad_aproximada,
        a.tamaño,
        es.estado_salud,
        r.nombre_raza,
        e.nombre_especie,
        COALESCE(
          json_agg(json_build_object('id', af.id_foto, 'url', af.url)) 
          FILTER (WHERE af.id_foto IS NOT NULL), 
          '[]'
        ) AS fotos
      FROM animal a
      LEFT JOIN estado_salud es ON a.id_estado_salud = es.id_estado_salud
      LEFT JOIN raza r ON a.id_raza = r.id_raza
      LEFT JOIN especie e ON r.id_especie = e.id_especie
      LEFT JOIN animal_foto af ON a.id_animal = af.id_animal
      WHERE a.id_animal = $1
      GROUP BY a.id_animal, es.id_estado_salud, r.id_raza, e.id_especie
    `,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Animal no encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// ✅ Obtener animales por organización (Con fotos)
export const getAnimalsByOrganization = async (req, res, next) => {
  try {
    const orgResult = await pool.query(
      `SELECT id_organizacion FROM usuario WHERE id_usuario = $1`,
      [req.params.id],
    );

    if (
      orgResult.rowCount === 0 ||
      orgResult.rows[0].id_organizacion === null
    ) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado o sin organización',
      });
    }

    const id_organizacion = orgResult.rows[0].id_organizacion;

    const result = await pool.query(
      `
     SELECT 
      a.id_animal,
      a.nombre_animal,
      a.edad_animal,
      a.tamaño,
      r.nombre_raza,
      s.estado_salud,
      o.nombre_organizacion,
      u.nombre_usuario,
      COALESCE(
          json_agg(json_build_object('id', af.id_foto, 'url', af.url)) 
          FILTER (WHERE af.id_foto IS NOT NULL), 
          '[]'
        ) AS fotos
     FROM animal a
     JOIN adopcion ad ON ad.id_animal = a.id_animal
     JOIN usuario u ON u.id_usuario = ad.id_usuario_rescatista
     JOIN organizacion o ON o.id_organizacion = u.id_organizacion
     LEFT JOIN raza r ON r.id_raza = a.id_raza
     LEFT JOIN estado_salud s ON s.id_estado_salud = a.id_estado_salud
     LEFT JOIN animal_foto af ON a.id_animal = af.id_animal
     WHERE o.id_organizacion = $1
     GROUP BY a.id_animal, o.id_organizacion, u.id_usuario, r.id_raza, s.id_estado_salud
    `,
      [id_organizacion],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se encontraron animales para esta organización',
      });
    }

    res.json({ success: true, data: result.rows, count: result.rowCount });
  } catch (error) {
    next(error);
  }
};

// ... (Las funciones createAnimal, updateAnimal, deleteAnimal, etc. se mantienen igual)
// ... Solo asegúrate de copiar el resto del archivo original debajo de esto.
export const createAnimal = async (req, res, next) => {
    // ... (Mantener código original)
    // NOTA: Copia aquí el resto de las funciones create, update, delete que ya tenías
    // para no borrarlas.
    const client = await pool.connect();

  try {
    const {
      nombre_animal,
      edad_animal,
      edad_aproximada,
      id_estado_salud,
      id_raza,
      tamaño,
    } = req.body;

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
      INSERT INTO animal (nombre_animal, edad_animal, edad_aproximada, id_estado_salud, id_raza, tamaño)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        nombre_animal,
        edad_animal,
        edad_aproximada,
        id_estado_salud,
        id_raza,
        tamaño,
      ],
    );

    const newAnimal = result.rows[0];

    // Auditar creacion
    await auditCreate(req, 'animal', newAnimal.id_animal, {
      nombre_animal: newAnimal.nombre_animal,
      edad_animal: newAnimal.edad_animal,
      edad_aproximada: newAnimal.edad_aproximada,
      id_estado_salud: newAnimal.id_estado_salud,
      id_raza: newAnimal.id_raza,
      tamaño: newAnimal.tamaño,
    });

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: newAnimal,
      message: 'Animal creado exitosamente',
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
    const {
      nombre_animal,
      edad_animal,
      edad_aproximada,
      id_estado_salud,
      id_raza,
      tamaño,
    } = req.body;

    // Obtener valores antiguos antes de actualizar
    const oldValues = await getOldValuesForAudit('animal', 'id_animal', id);

    if (!oldValues) {
      return res.status(404).json({
        success: false,
        error: 'Animal no encontrado',
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
          id_raza         = COALESCE($5, id_raza),
          tamaño          = COALESCE($6, tamaño)
      WHERE id_animal = $7
      RETURNING *
      `,
      [
        nombre_animal,
        edad_animal,
        edad_aproximada,
        id_estado_salud,
        id_raza,
        tamaño,
        id,
      ],
    );

    const updatedAnimal = result.rows[0];

    // Auditar actualizacion con valores antiguos y nuevos
    await auditUpdate(req, 'animal', id, oldValues, {
      nombre_animal: updatedAnimal.nombre_animal,
      edad_animal: updatedAnimal.edad_animal,
      edad_aproximada: updatedAnimal.edad_aproximada,
      id_estado_salud: updatedAnimal.id_estado_salud,
      id_raza: updatedAnimal.id_raza,
      tamaño: updatedAnimal.tamaño,
    });

    await client.query('COMMIT');

    res.json({
      success: true,
      data: updatedAnimal,
      message: 'Animal actualizado exitosamente',
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
        error: 'Animal no encontrado',
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
      data: result.rows[0],
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
      campo_modificado: 'estado_salud',
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
      [id],
    );

    if (animalCheck.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Animal no encontrado',
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
      [id],
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
      animal_id: id,
    });
  } catch (error) {
    next(error);
  }
};