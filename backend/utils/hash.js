import bcrypt from 'bcryptjs';

//Funciones utilitarias para hashing

const saltRounds = 10;

// Hashear la contrasena
export const hashPassword = async (password) => {
    return await bcrypt.hash(password, saltRounds);
};

// Comparar las contrasenas
export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};