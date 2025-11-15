import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } from './env.js';
import pool from '../db/db.js';

// Configurar la estrategia de Google OAuth 2.0
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
      accessType: 'offline',
      prompt: 'consent'
    },
    async (accessToken, refreshToken, profile, done) => {
      const client = await pool.connect();

      try {
        // Extraer informacion del perfil de Google
        const googleAccountId = profile.id;
        const googleEmail = profile.emails[0].value;
        const nombreCompleto = profile.displayName;

        // Calcular expiry del token (1 hora desde ahora)
        const tokenExpiry = new Date(Date.now() + 3600 * 1000);

        // Buscar si ya existe una cuenta de Google vinculada
        const existingGoogleAccountResult = await client.query(
          'SELECT * FROM google_accounts WHERE google_account_id = $1',
          [googleAccountId]
        );
        const existingGoogleAccount = existingGoogleAccountResult.rows[0];

        let usuario;

        if (existingGoogleAccount) {
          // Si la cuenta de Google existe obtener el usuario y actualizar tokens
          const usuarioResult = await client.query(
            'SELECT * FROM usuario WHERE id_usuario = $1 AND activo = true AND deleted_at IS NULL',
            [existingGoogleAccount.id_usuario]
          );
          usuario = usuarioResult.rows[0];

          if (!usuario) {
            throw new Error('Usuario asociado a cuenta de Google no encontrado o inactivo');
          }

          // Actualizar tokens de la cuenta de Google
          await client.query(
            `UPDATE google_accounts
             SET access_token = $1,
                 refresh_token = COALESCE($2, refresh_token),
                 token_expiry = $3,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id_google_account = $4`,
            [accessToken, refreshToken, tokenExpiry, existingGoogleAccount.id_google_account]
          );

        } else {
          // Buscar si existe un usuario con ese email
          const usuarioResult = await client.query(
            'SELECT * FROM usuario WHERE email = $1 AND activo = true AND deleted_at IS NULL',
            [googleEmail]
          );
          usuario = usuarioResult.rows[0];

          if (usuario) {
            // Si el usuario existe, vincular la cuenta de Google
            await client.query(
              `INSERT INTO google_accounts
               (id_usuario, google_account_id, google_email, access_token, refresh_token, token_expiry)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [usuario.id_usuario, googleAccountId, googleEmail, accessToken, refreshToken, tokenExpiry]
            );
          } else {
            // Si no existe, crear un nuevo usuario
            // Nota: Ajusta los valores por defecto según tu sistema
            const nombres = nombreCompleto.split(' ');
            const nombre = nombres[0] || nombreCompleto;
            const apellidoPaterno = nombres[1] || null;

            const newUsuarioResult = await client.query(
              `INSERT INTO usuario
               (nombre_usuario, apellido_paterno, email, id_rol, id_sexo, id_ciudad, password_hash)
               VALUES ($1, $2, $3, $4, $5, $6, NULL)
               RETURNING *`,
              [
                nombre,
                apellidoPaterno,
                googleEmail,
                2, // id_rol por defecto
                1, // id_sexo por defecto
                null  // id_ciudad por defecto
              ]
            );
            usuario = newUsuarioResult.rows[0];

            // Crear la vinculacion con Google
            await client.query(
              `INSERT INTO google_accounts
               (id_usuario, google_account_id, google_email, access_token, refresh_token, token_expiry)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [usuario.id_usuario, googleAccountId, googleEmail, accessToken, refreshToken, tokenExpiry]
            );
          }
        }

        // Actualizar fecha de ultimo login
        await client.query(
          'UPDATE usuario SET fecha_ultimo_login = CURRENT_TIMESTAMP WHERE id_usuario = $1',
          [usuario.id_usuario]
        );

        client.release();
        return done(null, usuario);
      } catch (error) {
        client.release();
        console.error('Error en autenticación de Google:', error);
        return done(error, null);
      }
    }
  )
);

// Serializar usuario para la sesion
passport.serializeUser((user, done) => {
  done(null, user.id_usuario);
});

// Deserializar usuario desde la sesion
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      'SELECT * FROM usuario WHERE id_usuario = $1 AND activo = true AND deleted_at IS NULL',
      [id]
    );
    const user = result.rows[0];
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
