import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db/db.js';
import { UserCreate, findUserByEmail } from '../models/User.js';
import { blacklistToken, isTokenBlacklisted } from '../middlewares/blacklist.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

let users = [];

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', async (req, res) => {
    try {
        const { nombre_usuario, apellido_paterno, apellido_materno, id_sexo, fecha_nacimiento, telefono,
            email, password_hash, id_ciudad } = req.body;

        if (!nombre_usuario || !apellido_paterno || !apellido_materno || !id_sexo || !fecha_nacimiento || !id_ciudad || !email || !password_hash) {
            return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
        }
        
        // Verificar si el usuario ya existe
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'El usuario ya existe' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password_hash, 10);

        // Crear nuevo usuario
        const newUser = await UserCreate({
            nombre_usuario,
            apellido_paterno,
            apellido_materno,
            id_sexo,
            fecha_nacimiento,
            telefono,
            id_ciudad,
            email,
            password_hash: hashedPassword,
            id_rol: 2 // Asignar rol por defecto (usuario estándar)
        });

        return res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            userId: newUser.id
        });

    } catch (error) {
        console.error('Error en /register:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
        }

        // Obtener el rol del usuario desde la base de datos
        const rolResult = await pool.query('SELECT nombre_rol FROM rol WHERE id_rol = $1', [user.id_rol]);
        const userRole = rolResult.rows[0].nombre_rol;

        // Incluir el ID de usuario y el rol en el token JWT
        const token = jwt.sign({ userId: user.id, email: user.email, role: userRole }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({ success: true, message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        console.error('Error en el endpoint de login:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/auth/logout - Cierre de sesión con lista negra
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    await blacklistToken(token);
    res.json({ success: true, message: 'Cierre de sesión exitoso. El token ha sido invalidado.' });
  } catch (error) {
    console.error('Error en el endpoint de logout:', error);
    res.status(500).json({ success: false, error: 'Error al cerrar la sesión' });
  }
});

// GET /api/auth/verify - Verificar la validez del token
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Token válido',
        user: req.user,
    });
});

// POST /api/auth/forgot-password - Solicitar recuperación de contraseña
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(200).json({ success: true, message: 'Si el correo electrónico existe, se ha enviado un enlace de restablecimiento de contraseña.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutos * 60 segundos * 1000 milisegundos

        await pool.query(
            `INSERT INTO password_reset (id_usuario, token, expires_at) VALUES ($1, $2, $3)`,
            [user.id, token, expiresAt]
        );

        console.log(`Token de recuperación de contraseña generado para ${email}: ${token}`);
        res.status(200).json({
            success: true,
            message: 'Si el correo electrónico existe, se ha enviado un enlace de restablecimiento de contraseña.',
            tokenDePrueba: token, 
        });

    } catch (error) {
        console.error('Error en el endpoint de forgot-password:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});


export default router;