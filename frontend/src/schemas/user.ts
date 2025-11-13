import { z } from 'zod';

/**
 * Schema base de usuario para el frontend
 * Version simplificada adaptada para React Native/Expo
 */
export const userSchema = z.object({
  id_usuario: z.number().int().positive(),

  nombre_usuario: z
    .string()
    .min(1, 'El nombre no puede estar vacío')
    .max(50, 'El nombre no puede exceder los 50 caracteres'),

  apellido_paterno: z
    .string()
    .min(1, 'El apellido paterno no puede estar vacío')
    .max(30, 'El apellido paterno no puede exceder los 30 caracteres'),

  apellido_materno: z
    .string()
    .max(30, 'El apellido materno no puede exceder los 30 caracteres')
    .nullable()
    .optional(),

  email: z
    .string()
    .email('Formato de email inválido')
    .max(100, 'El email no puede exceder los 100 caracteres'),

  telefono: z
    .string()
    .nullable()
    .optional(),

  fecha_nacimiento: z
    .string()
    .nullable()
    .optional(),

  id_sexo: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  id_ciudad: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  id_organizacion: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  id_rol: z
    .number()
    .int()
    .positive(),

  activo: z.boolean().optional(),

  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

/**
 * Tipo inferido del schema de usuario
 */
export type User = z.infer<typeof userSchema>;

/**
 * Schema para respuesta de usuario del API
 */
export const userResponseSchema = z.object({
  success: z.boolean(),
  data: userSchema,
  message: z.string().optional()
});

/**
 * Tipo inferido de la respuesta del API
 */
export type UserResponse = z.infer<typeof userResponseSchema>;

/**
 * Schema para lista de usuarios del API
 */
export const usersListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(userSchema),
  pagination: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number()
  }).optional(),
  message: z.string().optional()
});

/**
 * Tipo inferido de la lista de usuarios
 */
export type UsersListResponse = z.infer<typeof usersListResponseSchema>;
