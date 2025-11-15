import pool from '../db/db.js';

/** 
 * Listar todas las organizaciones con paginacion y busqueda
 * GET /api/organizations
 */
export const getAllOrganizations = async (req, res) => {
  try {
    const { limit = 50, offset = 0, search } = req.query;

    let query = `
      SELECT 
        o.id_organizacion,
        o.nombre_organizacion,
        o.telefono_organizacion,
        o.email_organizacion,
        o.direccion,
        o.id_ciudad,
        c.nombre_ciudad,
        COUNT(u.id_usuario) FILTER (WHERE u.activo = true) as total_usuarios_activos,
        COUNT(u.id_usuario) as total_usuarios
      FROM organizacion o
      LEFT JOIN ciudad c ON o.id_ciudad = c.id_ciudad
      LEFT JOIN usuario u ON o.id_organizacion = u.id_organizacion
    `;

    const params = [];
    
    if (search) {
      query += ` WHERE o.nombre_organizacion ILIKE $1 OR o.email_organizacion ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += `
      GROUP BY o.id_organizacion, c.nombre_ciudad
      ORDER BY o.id_organizacion DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Contar total para paginacion
    let countQuery = 'SELECT COUNT(*) FROM organizacion o';
    const countParams = [];
    
    if (search) {
      countQuery += ` WHERE o.nombre_organizacion ILIKE $1 OR o.email_organizacion ILIKE $1`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });
  } catch (error) {
    console.error('Error al listar organizaciones:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener organizaciones',
      error: error.message 
    });
  }
};

/** 
 * Obtener una organizacion especifica por ID
 * GET /api/organizations/:id
 */
export const getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        o.id_organizacion,
        o.nombre_organizacion,
        o.telefono_organizacion,
        o.email_organizacion,
        o.direccion,
        o.id_ciudad,
        c.nombre_ciudad,
        r.nombre_region,
        COUNT(u.id_usuario) FILTER (WHERE u.activo = true) as usuarios_activos,
        COUNT(u.id_usuario) as total_usuarios
      FROM organizacion o
      LEFT JOIN ciudad c ON o.id_ciudad = c.id_ciudad
      LEFT JOIN region r ON c.id_region = r.id_region
      LEFT JOIN usuario u ON o.id_organizacion = u.id_organizacion
      WHERE o.id_organizacion = $1
      GROUP BY o.id_organizacion, c.nombre_ciudad, r.nombre_region
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Organizacion no encontrada' 
      });
    }

    res.json({ 
      success: true, 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error al obtener organizacion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener la organizacion',
      error: error.message 
    });
  }
};

/** 
 * Crear una nueva organizacion
 * POST /api/organizations
 */
export const createOrganization = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      nombre_organizacion,
      telefono_organizacion,
      email_organizacion,
      direccion,
      id_ciudad
    } = req.body;

    // Validar que la ciudad existe si se proporciona
    if (id_ciudad) {
      const ciudadExists = await client.query(
        'SELECT id_ciudad FROM ciudad WHERE id_ciudad = $1',
        [id_ciudad]
      );

      if (ciudadExists.rows.length === 0) {
        client.release();
        return res.status(400).json({
          success: false,
          message: 'La ciudad especificada no existe'
        });
      }
    }

    await client.query('BEGIN');

    const result = await client.query(
      `
      INSERT INTO organizacion (
        nombre_organizacion, 
        telefono_organizacion, 
        email_organizacion, 
        direccion,
        id_ciudad
      ) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        nombre_organizacion,
        telefono_organizacion,
        email_organizacion,
        direccion,
        id_ciudad
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({ 
      success: true, 
      message: 'Organizacion creada exitosamente',
      data: result.rows[0] 
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear organizacion:', error);

    // Error de email duplicado
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una organizacion con ese email'
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Error al crear la organizacion',
      error: error.message 
    });
  } finally {
    client.release();
  }
};

/** 
 * Actualizar una organizacion existente
 * PUT /api/organizations/:id
 */
export const updateOrganization = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const {
      nombre_organizacion,
      telefono_organizacion,
      email_organizacion,
      direccion,
      id_ciudad
    } = req.body;

    // Verificar que la organizacion existe
    const orgExists = await client.query(
      'SELECT id_organizacion FROM organizacion WHERE id_organizacion = $1',
      [id]
    );

    if (orgExists.rows.length === 0) {
      client.release();
      return res.status(404).json({
        success: false,
        message: 'Organizacion no encontrada'
      });
    }

    // Validar ciudad si se proporciona
    if (id_ciudad) {
      const ciudadExists = await client.query(
        'SELECT id_ciudad FROM ciudad WHERE id_ciudad = $1',
        [id_ciudad]
      );

      if (ciudadExists.rows.length === 0) {
        client.release();
        return res.status(400).json({
          success: false,
          message: 'La ciudad especificada no existe'
        });
      }
    }

    await client.query('BEGIN');

    const result = await client.query(
      `
      UPDATE organizacion
      SET 
        nombre_organizacion = COALESCE($1, nombre_organizacion),
        telefono_organizacion = COALESCE($2, telefono_organizacion),
        email_organizacion = COALESCE($3, email_organizacion),
        direccion = COALESCE($4, direccion),
        id_ciudad = COALESCE($5, id_ciudad)
      WHERE id_organizacion = $6
      RETURNING *
      `,
      [
        nombre_organizacion,
        telefono_organizacion,
        email_organizacion,
        direccion,
        id_ciudad,
        id
      ]
    );

    await client.query('COMMIT');

    res.json({ 
      success: true, 
      message: 'Organizacion actualizada exitosamente',
      data: result.rows[0] 
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar organizacion:', error);

    // Error de email duplicado
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe otra organizacion con ese email'
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar la organizacion',
      error: error.message 
    });
  } finally {
    client.release();
  }
};

/** 
 * Eliminar una organizacion
 * DELETE /api/organizations/:id
 */
export const deleteOrganization = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    // Verificar que existe
    const orgExists = await client.query(
      'SELECT id_organizacion, nombre_organizacion FROM organizacion WHERE id_organizacion = $1',
      [id]
    );

    if (orgExists.rows.length === 0) {
      client.release();
      return res.status(404).json({
        success: false,
        message: 'Organizacion no encontrada'
      });
    }

    // Verificar usuarios asociados
    const usuariosCheck = await client.query(
      'SELECT COUNT(*) as total FROM usuario WHERE id_organizacion = $1',
      [id]
    );

    const totalUsuarios = parseInt(usuariosCheck.rows[0].total);

    if (totalUsuarios > 0) {
      client.release();
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar la organizacion "${orgExists.rows[0].nombre_organizacion}" porque tiene ${totalUsuarios} usuario(s) asociado(s)`,
        usuarios_asociados: totalUsuarios
      });
    }

    await client.query('BEGIN');

    await client.query(
      'DELETE FROM organizacion WHERE id_organizacion = $1',
      [id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Organizacion eliminada correctamente'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar organizacion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar la organizacion',
      error: error.message 
    });
  } finally {
    client.release();
  }
};

/** 
 * Obtener usuarios de una organizacion especifica
 * GET /api/organizations/:id/users
 */
export const getOrganizationUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.query;

    let query = `
      SELECT 
        u.id_usuario,
        u.nombre_usuario,
        u.apellido_paterno,
        u.apellido_materno,
        u.email,
        u.telefono,
        u.activo,
        u.fecha_creacion,
        u.fecha_ultimo_login
      FROM usuario u
      WHERE u.id_organizacion = $1
    `;

    const params = [id];

    if (activo !== undefined) {
      query += ' AND u.activo = $2';
      params.push(activo === 'true');
    }

    query += ' ORDER BY u.nombre_usuario, u.apellido_paterno';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios de la organizacion',
      error: error.message
    });
  }
};
