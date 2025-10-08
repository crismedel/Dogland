import { z } from 'zod';

/** 
 * Esquema de validacion para crear usuario
 * Utilizado para verificar el tipo, tamano de los datos,etc
 */
export const createUserSchema = z.object({
  nombre_usuario: z
    .string({
      required_error: 'El nombre de usuario es obligatorio.',
      invalid_type_error: 'El nombre de usuario debe ser texto.',
    })
    .min(1, { message: 'El nombre de usuario no puede estar vacio' })
    .max(50, { message: 'El nombre de usuario no puede exceder los 50 caracteres' }),
  apellido_paterno: z
    .string()
    .min(1, { message: 'El apellido paterno es obligatorio' })
    .max(30, { message: 'El apellido paterno no puede exceder los 30 caracteres' }),
  apellido_materno: z
    .string()
    .max(30, { message: 'El apellido materno no puede exceder los 30 caracteres' })
    .optional(),
  id_sexo: z
    .number({
      required_error: 'El ID del sexo es obligatorio.',
      invalid_type_error: 'El ID del sexo debe ser un número.',
    })
    .positive({ message: 'El ID del sexo debe ser un número positivo.' })
    .int({ message: 'El ID del sexo debe ser un número entero.' }),
  fecha_nacimiento: z
    .iso.date({
      message: 'Fecha de nacimiento inválida, debe ser YYYY-MM-DD',
    }),
  telefono: z
    .string()
    .min(9, { message: 'El teléfono debe tener al menos 9 dígitos' })
    .max(15, { message: 'El teléfono no puede tener más de 15 dígitos' })
    .optional(),
  email: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .email({ message: 'Email inválido' }),
  password_hash: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  id_ciudad: z
    .number({
      required_error: 'La selección de ciudad es obligatoria',
      invalid_type_error: 'El ID de ciudad debe ser un número',
    })
    .int({ message: 'El ID de ciudad debe ser un número entero' })
    .positive({ message: 'El ID de ciudad no es válido' }),
  id_organizacion: z
    .number({ invalid_type_error: 'El ID de organización debe ser un número' })
    .nullable()
    .optional(),
  id_rol: z.number({
      required_error: 'La selección de rol es obligatoria',
      invalid_type_error: 'El ID de rol debe ser un número',
    })
    .int()
    .positive(),
});


// Esquema para actualizacion con los campos del schema de creacion como opcionales.
export const updateUserSchema = createUserSchema.partial();

// Esquema para eliminar usuario
export const paramsSchema = z.object({
  id: z.coerce.number().int().positive({ message: 'El ID debe ser un número positivo.' })
});

// Esquema para notificaciones push
export const savePushTokenSchema = z.object({
  token: z.string({ required_error: 'El token es obligatorio.' }).min(1, 'El token no puede estar vacío'),
  plataforma: z.enum(['ios', 'android', 'web'], {
    required_error: "La plataforma ('ios', 'android', 'web') es obligatoria.",
  }),
});
