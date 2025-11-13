import { z } from 'zod';

/**
 * Schema de validacion para el formulario de registro
 * Adaptado para React Native/Expo
 */
export const registerSchema = z.object({
  nombre_usuario: z
    .string({
      required_error: 'El nombre es obligatorio',
      invalid_type_error: 'El nombre debe ser texto'
    })
    .min(1, 'El nombre no puede estar vacío')
    .max(50, 'El nombre no puede exceder los 50 caracteres')
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
    .or(z.literal('')),

  telefono: z
    .string()
    .min(9, 'El teléfono debe tener al menos 9 dígitos')
    .max(20, 'El teléfono no puede tener más de 20 dígitos')
    .regex(/^[+]?[\d\s()-]+$/, 'Formato de teléfono inválido')
    .trim()
    .optional()
    .or(z.literal('')),

  fecha_nacimiento: z
    .date({
      required_error: 'La fecha de nacimiento es obligatoria',
      invalid_type_error: 'La fecha de nacimiento debe ser una fecha válida'
    }),

  id_sexo: z
    .number({
      required_error: 'El sexo es obligatorio',
      invalid_type_error: 'Debes seleccionar un sexo'
    })
    .int('Selecciona una opción válida')
    .positive('Selecciona una opción válida')
    .refine((val) => val !== 0, 'Debes seleccionar tu sexo'),

  id_ciudad: z
    .number()
    .int()
    .optional()
    .nullable()
    .refine((val) => val === null || val === undefined || val === 0 || val > 0,
      'Selecciona una ciudad válida'),

  email: z
    .string({
      required_error: 'El email es obligatorio'
    })
    .min(1, 'El email no puede estar vacío')
    .email('Formato de email inválido')
    .max(100, 'El email no puede exceder los 100 caracteres')
    .toLowerCase()
    .trim(),

  password: z
    .string({
      required_error: 'La contraseña es obligatoria'
    })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(255, 'La contraseña no puede exceder los 255 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),

  confirmPassword: z
    .string({
      required_error: 'Debes confirmar la contraseña'
    })
    .min(1, 'Debes confirmar la contraseña')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

/**
 * Tipo inferido del schema de registro
 */
export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Schema de validacion para el formulario de login
 */
export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'El email es obligatorio'
    })
    .min(1, 'El email no puede estar vacío')
    .email('Formato de email inválido')
    .toLowerCase()
    .trim(),

  password: z
    .string({
      required_error: 'La contraseña es obligatoria'
    })
    .min(1, 'La contraseña no puede estar vacía')
});

/**
 * Tipo inferido del schema de login
 */
export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Schema de validacion para actualizar perfil
 */
export const updateProfileSchema = z.object({
  nombre_usuario: z
    .string()
    .min(1, 'El nombre no puede estar vacío')
    .max(50, 'El nombre no puede exceder los 50 caracteres')
    .trim()
    .optional(),

  apellido_paterno: z
    .string()
    .min(1, 'El apellido paterno no puede estar vacío')
    .max(30, 'El apellido paterno no puede exceder los 30 caracteres')
    .trim()
    .optional(),

  apellido_materno: z
    .string()
    .max(30, 'El apellido materno no puede exceder los 30 caracteres')
    .trim()
    .optional()
    .nullable(),

  telefono: z
    .string()
    .min(9, 'El teléfono debe tener al menos 9 dígitos')
    .max(20, 'El teléfono no puede tener más de 20 dígitos')
    .regex(/^[+]?[\d\s()-]+$/, 'Formato de teléfono inválido')
    .trim()
    .optional()
    .nullable(),

  email: z
    .string()
    .min(1, 'El email no puede estar vacío')
    .email('Formato de email inválido')
    .max(100, 'El email no puede exceder los 100 caracteres')
    .toLowerCase()
    .trim()
    .optional(),

  fecha_nacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida, debe ser YYYY-MM-DD')
    .optional(),

  id_sexo: z
    .number()
    .int()
    .positive()
    .optional(),

  id_ciudad: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'Debe proporcionar al menos un campo para actualizar'
  }
);

/**
 * Tipo inferido del schema de actualizacion de perfil
 */
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
