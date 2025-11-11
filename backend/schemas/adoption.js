import { z } from 'zod';

/**
 * Schema base reutilizable para adopciones
 * Contiene todos los campos comunes
 */
const adoptionRequestBaseSchema = z.object({
  id_adopcion: z
    .number({
      required_error: 'El ID de adopción es obligatorio',
      invalid_type_error: 'El ID de adopción debe ser un número'
    })
    .int('El ID de adopción debe ser un número entero')
    .positive('El ID de adopción debe ser un número positivo'),

  id_usuario: z
    .number({
      required_error: 'El ID de usuario es obligatorio',
      invalid_type_error: 'El ID de usuario debe ser un número'
    })
    .int('El ID de usuario debe ser un número entero')
    .positive('El ID de usuario debe ser un número positivo')
    .optional(), // Optional porque puede venir del token

  id_estado_solicitud: z
    .number({
      invalid_type_error: 'El ID de estado debe ser un número'
    })
    .int('El ID de estado debe ser un número entero')
    .positive('El ID de estado debe ser un número positivo')
    .optional()
});

/**
 * Esquema de validacion para crear solicitud de adopción
 */
export const createAdoptionRequestSchema = z.object({
  body: z.object({
    id_adopcion: z
      .number({
        required_error: 'El ID de adopción es obligatorio',
        invalid_type_error: 'El ID de adopción debe ser un número'
      })
      .int('El ID de adopción debe ser un número entero')
      .positive('El ID de adopción debe ser un número positivo')
  })
});

/**
 * Esquema de validacion para actualizar solicitud de adopción
 * Principalmente para cambiar el estado
 */
export const updateAdoptionRequestSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  }),
  body: z.object({
    id_estado_solicitud: z
      .number({
        required_error: 'El ID de estado de solicitud es obligatorio',
        invalid_type_error: 'El ID de estado debe ser un número'
      })
      .int('El ID de estado debe ser un número entero')
      .positive('El ID de estado debe ser un número positivo')
  })
});

/**
 * Esquema de validacion para obtener solicitud por ID
 */
export const getAdoptionRequestByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  })
});

/**
 * Esquema de validacion para eliminar solicitud de adopción
 */
export const deleteAdoptionRequestSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  })
});

/**
 * Esquema de validacion para listar solicitudes de adopción
 */
export const getAllAdoptionRequestsSchema = z.object({
  query: z.object({
    limit: z
      .string()
      .regex(/^\d+$/, 'El límite debe ser un número')
      .transform(Number)
      .refine((val) => val > 0 && val <= 100, {
        message: 'El límite debe estar entre 1 y 100'
      })
      .optional(),

    offset: z
      .string()
      .regex(/^\d+$/, 'El offset debe ser un número')
      .transform(Number)
      .refine((val) => val >= 0, {
        message: 'El offset debe ser mayor o igual a 0'
      })
      .optional(),

    id_estado_solicitud: z
      .string()
      .regex(/^\d+$/, 'El ID de estado debe ser un número')
      .transform(Number)
      .optional()
  })
});
