import jwt from 'jsonwebtoken';
import { JWT_SECRET, FRONTEND_URL } from '../config/env.js';
import { verifyGoogleToken } from '../services/googleAuthService.js';

/**
 * Maneja el callback de autenticacion web de Google.
 * Genera un JWT y redirige al frontend.
 */
export const handleGoogleCallbackWeb = (req, res) => {
  try {
    // Passport añade el usuario a req.user
    const token = jwt.sign(
      {
        id_usuario: req.user.id_usuario,
        email: req.user.email,
        nombre_usuario: req.user.nombre_usuario,
        id_rol: req.user.id_rol
      },
      JWT_SECRET,
      { expiresIn: '90d' }
    );

    // Redirigir al frontend web con el token
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);

  } catch (error) {
    console.error('Error generando token:', error);
    res.redirect(`${FRONTEND_URL}/login?error=token_generation_failed`);
  }
};

/**
 * Cierra la sesion web del usuario (basada en sesiones de Passport).
 */
export const logoutWeb = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Error al cerrar sesión'
      });
    }
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        return res.status(500).json({
          success: false,
          error: 'Error al destruir sesión'
        });
      }
      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    });
  });
};

/**
 * Obtiene el usuario actual de la sesion web.
 */
export const getCurrentUserWeb = (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      success: true,
      user: {
        id_usuario: req.user.id_usuario,
        email: req.user.email,
        nombre_usuario: req.user.nombre_usuario,
        apellido_paterno: req.user.apellido_paterno,
        apellido_materno: req.user.apellido_materno,
        id_rol: req.user.id_rol,
        telefono: req.user.telefono,
        id_organizacion: req.user.id_organizacion
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'No autenticado'
    });
  }
};

/**
 * Verifica si un email tiene una cuenta de Google vinculada.
 */
export const checkGoogleAccount = async (req, res) => {
  try {
    const { email } = req.params;
    const pool = (await import('../db/db.js')).default;

    const result = await pool.query(
      `SELECT ga.*
       FROM google_accounts ga
       INNER JOIN usuario u ON ga.id_usuario = u.id_usuario
       WHERE u.email = $1 AND u.activo = true AND u.deleted_at IS NULL`,
      [email]
    );
    const googleAccount = result.rows[0];

    res.json({
      success: true,
      hasGoogleAccount: !!googleAccount
    });
  } catch (error) {
    console.error('Error verificando cuenta de Google:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar cuenta de Google'
    });
  }
};

// --- Controladores Especificos para Movil ---

/**
 * Autentica a un usuario movil usando un idToken de Google.
 * Busca o crea el usuario y retorna un JWT.
 */
export const signInMobile = async (req, res) => {
  let dbClient; 
  
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'idToken requerido'
      });
    }

    // --- Logica de verificacion ---
    const payload = await verifyGoogleToken(idToken);

    const googleAccountId = payload.sub;
    const googleEmail = payload.email;
    const nombreCompleto = payload.name;

    // Buscar o crear usuario en la base de datos
    const pool = (await import('../db/db.js')).default;
    dbClient = await pool.connect(); // Asignar a la variable de alcance superior

    try {
      // Buscar si ya existe una cuenta de Google vinculada
      const existingGoogleAccountResult = await dbClient.query(
        'SELECT * FROM google_accounts WHERE google_account_id = $1',
        [googleAccountId]
      );
      const existingGoogleAccount = existingGoogleAccountResult.rows[0];

      let usuario;

      if (existingGoogleAccount) {
        // Si la cuenta de Google existe, obtener el usuario
        const usuarioResult = await dbClient.query(
          'SELECT * FROM usuario WHERE id_usuario = $1 AND activo = true AND deleted_at IS NULL',
          [existingGoogleAccount.id_usuario]
        );
        usuario = usuarioResult.rows[0];

        if (!usuario) {
          throw new Error('Usuario asociado a cuenta de Google no encontrado o inactivo');
        }

        // Actualizar ultima autenticacion
        await dbClient.query(
          'UPDATE google_accounts SET updated_at = CURRENT_TIMESTAMP WHERE id_google_account = $1',
          [existingGoogleAccount.id_google_account]
        );

      } else {
        // Buscar si existe un usuario con ese email
        const usuarioResult = await dbClient.query(
          'SELECT * FROM usuario WHERE email = $1 AND activo = true AND deleted_at IS NULL',
          [googleEmail]
        );
        usuario = usuarioResult.rows[0];

        if (usuario) {
          // Si el usuario existe vincular la cuenta de Google
          await dbClient.query(
            `INSERT INTO google_accounts (id_usuario, google_account_id, google_email)
             VALUES ($1, $2, $3)`,
            [usuario.id_usuario, googleAccountId, googleEmail]
          );
        } else {
          // Si no existe crear un nuevo usuario
          const nombres = nombreCompleto?.split(' ') || [];
          const nombre = nombres[0] || googleEmail.split('@')[0];
          const apellidoPaterno = nombres[1] || null;

          const newUsuarioResult = await dbClient.query(
            `INSERT INTO usuario
             (nombre_usuario, apellido_paterno, email, id_rol, id_sexo, id_ciudad, password_hash)
             VALUES ($1, $2, $3, $4, $5, $6, NULL)
             RETURNING *`,
            [
              nombre,
              apellidoPaterno,
              googleEmail,
              2, // id_rol por defecto (usuario normal)
              1, // id_sexo por defecto
              null  // id_ciudad por defecto
            ]
          );
          usuario = newUsuarioResult.rows[0];

          // Crear la vinculacion con Google
          await dbClient.query(
            `INSERT INTO google_accounts (id_usuario, google_account_id, google_email)
             VALUES ($1, $2, $3)`,
            [usuario.id_usuario, googleAccountId, googleEmail]
          );
        }
      }

      // Actualizar fecha de ultimo login
      await dbClient.query(
        'UPDATE usuario SET fecha_ultimo_login = CURRENT_TIMESTAMP WHERE id_usuario = $1',
        [usuario.id_usuario]
      );

      dbClient.release();

      // Generar JWT token
      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          email: usuario.email,
          nombre_usuario: usuario.nombre_usuario,
          id_rol: usuario.id_rol
        },
        JWT_SECRET,
        { expiresIn: '90d' }
      );

      // Retornar el JWT al cliente
      res.json({
        success: true,
        token,
        user: {
          id_usuario: usuario.id_usuario,
          email: usuario.email,
          nombre_usuario: usuario.nombre_usuario,
          apellido_paterno: usuario.apellido_paterno,
          apellido_materno: usuario.apellido_materno,
          id_rol: usuario.id_rol
        }
      });

    } catch (dbError) {
      if (dbClient) { // Asegurarse que dbClient existe antes de liberar
        dbClient.release();
      }
      console.error('Error en base de datos:', dbError);
      res.status(500).json({
        success: false,
        error: 'Error al procesar usuario'
      });
    }

  } catch (error) { // Atrapa errores de verifyGoogleToken
    console.error('Error en Google Sign-In o verificación:', error.message);
    res.status(401).json({
      success: false,
      error: error.message || 'Token de Google inválido' // Usar mensaje del servicio
    });
  }
};

/**
 * Obtiene la informacion del usuario movil actual (autenticado con JWT).
 */
export const getCurrentUserMobile = (req, res) => {
  // El middleware 'authenticateJWT' valido el token y adjunto 'req.user'
  res.json({
    success: true,
    user: {
      id_usuario: req.user.id_usuario,
      email: req.user.email,
      nombre_usuario: req.user.nombre_usuario,
      apellido_paterno: req.user.apellido_paterno,
      apellido_materno: req.user.apellido_materno,
      id_rol: req.user.id_rol,
      telefono: req.user.telefono,
      id_organizacion: req.user.id_organizacion,
      id_sexo: req.user.id_sexo,
      id_ciudad: req.user.id_ciudad,
      fecha_nacimiento: req.user.fecha_nacimiento,
      fecha_creacion: req.user.fecha_creacion,
      fecha_ultimo_login: req.user.fecha_ultimo_login
    }
  });
};

/**
 * Cierra la sesion movil (invalida el token del lado del cliente).
 */
export const logoutMobile = (req, res) => {
  // JWT es 'stateless', el servidor no necesita hacer nada.
  // El cliente es responsable de eliminar el token.
  res.json({
    success: true,
    message: 'Sesión cerrada. Elimina el token del almacenamiento local.'
  });
};

/**
 * Verifica la validez de un token JWT movil.
 */
export const verifyTokenMobile = (req, res) => {
  // El middleware 'authenticateJWT' hizo el trabajo.
  res.json({
    success: true,
    valid: true,
    user: {
      id_usuario: req.user.id_usuario,
      email: req.user.email,
      nombre_usuario: req.user.nombre_usuario,
      id_rol: req.user.id_rol
    },
    token_expires_at: req.tokenData.exp * 1000 // Convertir a timestamp de JS
  });
};

/**
 * Refresca los datos del perfil del usuario movil.
 */
export const refreshUserDataMobile = async (req, res) => {
  try {
    const pool = (await import('../db/db.js')).default;

    // Obtener datos frescos de la BD usando el ID del token verificado
    const result = await pool.query(
      'SELECT * FROM usuario WHERE id_usuario = $1 AND activo = true AND deleted_at IS NULL',
      [req.user.id_usuario]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(4404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user: {
        id_usuario: user.id_usuario,
        email: user.email,
        nombre_usuario: user.nombre_usuario,
        apellido_paterno: user.apellido_paterno,
        apellido_materno: user.apellido_materno,
        id_rol: user.id_rol,
        telefono: user.telefono,
        id_organizacion: user.id_organizacion,
        id_sexo: user.id_sexo,
        id_ciudad: user.id_ciudad,
        fecha_nacimiento: user.fecha_nacimiento
      }
    });
  } catch (error) {
    console.error('Error refrescando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al refrescar datos del usuario'
    });
  }
};
