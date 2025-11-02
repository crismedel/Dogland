import pool from '../db/db.js';

export const UserCreate = async (userData) => {
    const query = `
        INSERT INTO usuario (
            nombre_usuario, apellido_paterno, apellido_materno, id_sexo, 
            fecha_nacimiento, telefono, email, password_hash, 
            fecha_creacion, id_ciudad, id_organizacion, id_rol
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10, $11)
        RETURNING id_usuario, nombre_usuario, email, fecha_creacion
    `;

    const values = [
        userData.nombre_usuario,
        userData.apellido_paterno,
        userData.apellido_materno,
        userData.id_sexo,
        userData.fecha_nacimiento,
        userData.telefono,
        userData.email,
        userData.password_hash,
        userData.id_ciudad,
        userData.id_organizacion || null, // asegura que sea null si no viene
        userData.id_rol
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

export const findUserByEmail = async (email) => {
    const query = `
        SELECT id_usuario, password_hash, id_rol, email, has_2fa
        FROM usuario
        WHERE email = $1
        LIMIT 1;
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
};