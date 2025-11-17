import transporter from '../config/mailConfig.js';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

// Obtener el directorio para los templates
const __dirname = path.join(process.cwd(), 'mail');

/**
 * Función interna para cargar y compilar una plantilla de correo desde un archivo.
 * @param {string} templateName - El nombre del archivo .hbs en la carpeta /templates.
 * @param {object} data - Los datos a inyectar en la plantilla.
 * @returns {string} El HTML compilado listo para ser enviado.
 */
const compileTemplate = (templateName, data) => {
    const filePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    try {
        const source = fs.readFileSync(filePath, 'utf-8');
        const template = handlebars.compile(source);
        return template(data);
    } catch (error) {
        if (NODE_ENV === 'test') return true;
        if (NODE_ENV === 'development') {
            console.error(`Error al leer o compilar la plantilla de correo: ${templateName}`, error);
        }
        // Devuelve un HTML simple como fallback en caso de error
        return `<p>Ocurrió un error al generar este correo. Por favor, contacta a soporte.</p>`;
    }
};

/**
 * Envía un correo para restablecer la contraseña.
 * @param {object} user - Objeto del usuario (debe tener .email y .nombre_usuario).
 * @param {string} token - El token de un solo uso para el reseteo.
 */
export const sendPasswordResetEmail = async (user, token) => {
    // Deep link que abrira la aplicacion movil en la pantalla correcta
    // 'Dogland' es el 'scheme' configurado en app.json de Expo
    const resetLink = `Dogland://reset-password?token=${token}`;

    const htmlContent = compileTemplate('passwordReset', {
        name: user.nombre_usuario || 'usuario',
        link: resetLink,
    });

    await transporter.sendMail({
        from: '"Soporte de Dogland" <no-reply@dogland.com>',
        to: user.email,
        subject: 'Instrucciones para restablecer tu contraseña',
        html: htmlContent,
    });
};

/**
 * Envia un correo para confirmar una nueva cuenta de usuario.
 * @param {object} user - Objeto del usuario.
 * @param {string} confirmationCode - El código de confirmación.
 */
export const sendAccountConfirmationEmail = async (user, confirmationCode) => {
    const htmlContent = compileTemplate('accountConfirmation', {
        name: user.nombre_usuario,
        code: confirmationCode,
    });

    await transporter.sendMail({
        from: '"Bienvenido a Dogland" <no-reply@dogland.com>',
        to: user.email,
        subject: 'Confirma tu cuenta para empezar',
        html: htmlContent,
    });
};

/**
 * Envia un correo con un codigo 2FA.
 * @param {object} user - Objeto del usuario.
 * @param {string} code - El código 2FA de un solo uso.
 */
export const send2FACodeEmail = async (user, code) => {
    const htmlContent = compileTemplate('twoFactorAuth', {
        code: code,
    });

    await transporter.sendMail({
        from: '"Seguridad de Dogland" <no-reply@dogland.com>',
        to: user.email,
        subject: `Tu código de verificación es ${code}`,
        html: htmlContent,
    });
};

/**
 * Envia un correo de bienvenida al usuario recién registrado.
 * @param {object} user - Objeto del usuario (debe tener .email y .nombre_usuario).
 */
export const sendWelcomeEmail = async (user) => {
    const htmlContent = compileTemplate('welcome', {
        name: user.nombre_usuario || 'Usuario',
    });

    await transporter.sendMail({
        from: '"Dogland" <no-reply@dogland.com>',
        to: user.email,
        subject: '¡Bienvenido a Dogland! 🐕',
        html: htmlContent,
    });
};
