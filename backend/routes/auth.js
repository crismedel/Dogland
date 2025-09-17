import { Router } from 'express';
import bcrypt from 'bcryptjs';

const router = Router();

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
        const existingUser = users.findUserByEmail(user => user.email === email);
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
        return res.status(500).json({ success: false, error: error.message });
    }
});

export default router;