import pool from './db/db.js';

/**
 * Inicializa el ambiente de testing de integracion
 */

// Inicializar mocks
jest.mock('./mail/mail.service.js', () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  sendAccountConfirmationEmail: jest.fn().mockResolvedValue(true)
}));

// Cerrar pool al final
afterAll(async () => {
  await pool.end();
});