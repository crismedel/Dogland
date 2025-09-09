import express from "express";
import pool from "../db/db.js";
import bcrypt from "bcrypt";

const router = express.Router();

// PUT /api/password-reset-confirm - Confirmar recuperacion y actualizar contraseña
router.put("/password-reset-confirm", async (req, res) => {
  const { token, newPassword } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Buscar token en la tabla password_reset
    const resetResult = await client.query(
      `SELECT id_usuario, expires_at, used
       FROM password_reset
       WHERE token = $1 FOR UPDATE`,
      [token]
    );

    if (resetResult.rows.length === 0) {
      throw new Error("TOKEN_INVALID");
    }

    const reset = resetResult.rows[0];

    // Validar expiracion y uso
    if (reset.used) {
      throw new Error("TOKEN_USED");
    }
    if (new Date(reset.expires_at) < new Date()) {
      throw new Error("TOKEN_EXPIRED");
    }

    // Hashear nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña en usuario
    await client.query(
      `UPDATE usuario SET password_hash = $1 WHERE id_usuario = $2`,
      [hashedPassword, reset.id_usuario]
    );

    // Marcar token como usado
    await client.query(
      `UPDATE password_reset SET used = TRUE WHERE token = $1`,
      [token]
    );

    await client.query("COMMIT");
    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.message === "TOKEN_INVALID") {
      return res.status(400).json({ message: "Token no válido" });
    }
    if (error.message === "TOKEN_USED") {
      return res.status(400).json({ message: "Token ya fue utilizado" });
    }
    if (error.message === "TOKEN_EXPIRED") {
      return res.status(400).json({ message: "Token ha expirado" });
    }

    console.error("Error en password-reset-confirm:", error);
    res.status(500).json({ message: "Error en el servidor" });
  } finally {
    client.release();
  }
});

export default router;
