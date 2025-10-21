import { z } from 'zod';

/** 
 * Schema base reutilizable para usuario
 * Contiene todos los campos comunes entre crear y actualizar
 */
const userBaseSchema = z.object({
  nombre_usuario: z
    .string({
      required_error: 'El nombre de usuario es obligatorio',
      invalid_type_error: 'El nombre de usuario debe ser texto'
    })
    .min(1, 'El nombre de usuario no puede estar vacío')
    .max(50, 'El nombre de usuario no puede exceder los 50 caracteres')
    .trim(),

  apellido_paterno: z
    .string({
      required_error: 'El apellido paterno es obligatorio'
    })
    .min(1, 'El apellido paterno no puede estar vacío')
    .max(30, 'El apellido paterno no puede exceder los 30 caracteres')
    .trim(),

  apellido_materno: z
    .string()
    .max(30, 'El apellido materno no puede exceder los 30 caracteres')
    .trim()
    .optional()
    .nullable(),

  id_sexo: z
    .number({
      required_error: 'El sexo es obligatorio',
      invalid_type_error: 'El ID del sexo debe ser un número'
    })
    .int('El ID del sexo debe ser un número entero')
    .positive('El ID del sexo debe ser un número positivo'),

  fecha_nacimiento: z
    .string({
      required_error: 'La fecha de nacimiento es obligatoria'
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha de nacimiento inválida, debe ser YYYY-MM-DD'),

  telefono: z
    .string()
    .min(9, 'El teléfono debe tener al menos 9 dígitos')
    .max(20, 'El teléfono no puede tener más de 20 dígitos')
    .regex(/^[+]?[\d\s()-]+$/, 'Formato de teléfono inválido')
    .trim()
    .optional()
    .nullable(),

  email: z
    .email('Formato de email inválido')
    .max(100, 'El email no puede exceder los 100 caracteres')
    .toLowerCase()
    .trim(),

  password_hash: z
    .string({
      required_error: 'La contraseña es obligatoria'
    })
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(255, 'La contraseña no puede exceder los 255 caracteres'),

  id_ciudad: z
    .number({
      required_error: 'La ciudad es obligatoria',
      invalid_type_error: 'El ID de ciudad debe ser un número'
    })
    .int('El ID de ciudad debe ser un número entero')
    .positive('El ID de ciudad debe ser un número positivo'),

  id_organizacion: z
    .number({
      invalid_type_error: 'El ID de organización debe ser un número'
    })
    .int('El ID de organización debe ser un número entero')
    .positive('El ID de organización debe ser un número positivo')
    .nullable()
    .optional(),

  id_rol: z
    .number({
      required_error: 'El rol es obligatorio',
      invalid_type_error: 'El ID de rol debe ser un número'
    })
    .int('El ID de rol debe ser un número entero')
    .positive('El ID de rol debe ser un número positivo')
});

/** 
 * Esquema de validacion para crear usuario
 * Utilizado para verificar el tipo, tamaño de los datos, etc
 */
export const createUserSchema = z.object({
  body: userBaseSchema
});

/** 
 * Esquema de validacion para actualizar usuario
 * Todos los campos son opcionales
 */
export const updateUserSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  }),
  body: userBaseSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'Debe proporcionar al menos un campo para actualizar'
    }
  )
});

/** 
 * Esquema de validacion para obtener usuario por ID
 */
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  })
});

/** 
 * Esquema de validacion para eliminar usuario
 */
export const deleteUserSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  })
});

/** 
 * Esquema de validacion para listar usuarios
 * Incluye parametros de paginacion, filtros y busqueda
 */
export const getAllUsersSchema = z.object({
  query: z.object({
    limit: z
      .string()
      .regex(/^\d+$/, 'El límite debe ser un número')
      .transform(Number)
      .refine((val) => val > 0 && val <= 100, {
        message: 'El límite debe estar entre 1 y 100'
      })
      .default('50')
      .optional(),

    offset: z
      .string()
      .regex(/^\d+$/, 'El offset debe ser un número')
      .transform(Number)
      .refine((val) => val >= 0, {
        message: 'El offset debe ser mayor o igual a 0'
      })
      .default('0')
      .optional(),

    activo: z
      .enum(['true', 'false'], {
        errorMap: () => ({ message: 'El valor de activo debe ser true o false' })
      })
      .optional(),

    id_organizacion: z
      .string()
      .regex(/^\d+$/, 'El ID de organización debe ser un número')
      .transform(Number)
      .optional(),

    search: z
      .string()
      .min(1, 'La búsqueda debe tener al menos 1 carácter')
      .max(100, 'La búsqueda no puede exceder 100 caracteres')
      .trim()
      .optional()
  })
});

/** 
 * Esquema de validacion para guardar token de notificaciones push
 */
export const savePushTokenSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  }),
  body: z.object({
    token: z
      .string({
        required_error: 'El token es obligatorio'
      })
      .min(1, 'El token no puede estar vacío')
      .max(500, 'El token no puede exceder los 500 caracteres'),

    plataforma: z.enum(['ios', 'android', 'web'], {
      required_error: "La plataforma es obligatoria (valores permitidos: 'ios', 'android', 'web')",
      invalid_type_error: "La plataforma debe ser 'ios', 'android' o 'web'"
    })
  })
});

/** 
 * Esquema de validacion para login de usuario
 */
export const loginSchema = z.object({
  body: z.object({
    email: z
      .email('Formato de email inválido')
      .toLowerCase()
      .trim(),

    password_hash: z
      .string({
        required_error: 'La contraseña es obligatoria'
      })
      .min(1, 'La contraseña no puede estar vacía')
  })
});
