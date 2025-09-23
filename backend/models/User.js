import pool from '../db/db.js';

export const UserCreate = async (user, email, hashedPassword) => {
    const query = `
        INSERT INTO usuario (nombre_usuario, apellido_paterno, apellido_materno, id_sexo, fecha_nacimiento, telefono, email, password_hash, fecha_creacion, id_ciudad, id_organizacion, id_rol)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10, $11)
        RETURNING id, username, email, created_at
    `;
    const values = [user, email, hashedPassword];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const findUserByEmail = async (email) => {
    const query = `SELECT * FROM user WHERE enamil = $1 LIMIT 1;`;
    const result = await pool.query(query, [email]);
    return result.rows[0];
};