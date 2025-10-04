// Configuracion del servicio de correo
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config()

let transporter;

// MailHog para desarrollo y servicio real para produccion
if (process.env.NODE_ENV === 'production') {
    // Configuracion para produccion (ej. SendGrid)
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    console.log('[Mail] Nodemailer configurado para producción.');
} else {
    // Configuracion para dev (MailHog)
    transporter = nodemailer.createTransport({
        host: 'localhost',
        // 2. CORRECCIÓN DEL PUERTO
        // El puerto SMTP de MailHog es 1025, no 8025.
        port: 1025,
        secure: false,
    });
    console.log('[Mail] Nodemailer configurado para desarrollo (MailHog).');
}

export default transporter;
