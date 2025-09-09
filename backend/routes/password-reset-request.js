import express from "express";
import pool from "../db/db.js";
import crypto from "crypto";

const router = express.Router();

// POST /api/password-reset-request para solicitar recuperacion de contraseña
router.post("/password-reset-request", async (req, res) => {
  const { email } = req.body;

  try {
    //Buscar al usuario por email
    const userResult = await pool.query(
      "SELECT id_usuario FROM usuario WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const id_usuario = userResult.rows[0].id_usuario;

    // Generar token
    const token = crypto.randomBytes(32).toString("hex");

    // Expira en 1 hora
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Guardar en la tabla
    await pool.query(
      `INSERT INTO password_reset (id_usuario, token, expires_at)
       VALUES ($1, $2, $3)`,
      [id_usuario, token, expiresAt]
    );

    // Devolver token directamente para pruebas sin SMTP aún
    return res.json({
      message: "Solicitud de recuperación generada",
      token,
      expiresAt
    });

  } catch (error) {
    console.error("Error en password-reset-request:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

export default router;
