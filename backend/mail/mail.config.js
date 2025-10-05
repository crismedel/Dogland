// Configuracion del servicio de correo
import nodemailer from 'nodemailer';
import { NODE_ENV, EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } from '../config/env.js';

let transporter;

// MailHog para desarrollo y servicio real para produccion
if (NODE_ENV === 'production') {
    // Configuracion para produccion (ej. SendGrid)
    transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: false,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
    });
    console.log('[Mail] Nodemailer configurado para producción.');
} else {
    // Configuracion para dev (MailHog)
    transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
        secure: false,
    });
    if (NODE_ENV === 'development') {
        console.log('[Mail] Nodemailer configurado para desarrollo (MailHog).');
    }
}

export default transporter;
