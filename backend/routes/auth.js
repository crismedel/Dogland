import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { UserCreate, findUserByEmail } from '../models/User.js';
import { blacklistToken, isTokenBlacklisted } from '../middleware/blacklist.js';
import authenticateToken from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

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
        const hashedPassword = await bcrypt.hash(password_has, 10);

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
            message: 'Usuario registrado exitosamente',
            userId: newUser.id
        });

    } catch (error) {
        console.error('Error en /register:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/auth/login - Iniciar sesión
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

        const token = JWT_SECRET.substring({userId: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({ success: true, message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        console.error('Error en /login:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
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


export default router;