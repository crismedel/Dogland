import { z } from 'zod';

/**
 * Schema para ubicación (coordenadas)
 */
const ubicacionSchema = z.object({
  latitude: z
    .number({
      required_error: 'La latitud es obligatoria',
      invalid_type_error: 'La latitud debe ser un número'
    })
    .min(-90, 'La latitud debe estar entre -90 y 90')
    .max(90, 'La latitud debe estar entre -90 y 90'),

  longitude: z
    .number({
      required_error: 'La longitud es obligatoria',
      invalid_type_error: 'La longitud debe ser un número'
    })
    .min(-180, 'La longitud debe estar entre -180 y 180')
    .max(180, 'La longitud debe estar entre -180 y 180')
});

/**
 * Schema base reutilizable para avistamiento
 * Contiene todos los campos comunes entre crear y actualizar
 */
const sightingBaseSchema = z.object({
  id_estado_avistamiento: z
    .number({
      required_error: 'El estado del avistamiento es obligatorio',
      invalid_type_error: 'El ID de estado debe ser un número'
    })
    .int('El ID de estado debe ser un número entero')
    .positive('El ID de estado debe ser positivo'),

  id_estado_salud: z
    .number({
      required_error: 'El estado de salud es obligatorio',
      invalid_type_error: 'El ID de estado de salud debe ser un número'
    })
    .int('El ID de estado de salud debe ser un número entero')
    .positive('El ID de estado de salud debe ser positivo'),

  id_especie: z
    .number({
      required_error: 'La especie es obligatoria',
      invalid_type_error: 'El ID de especie debe ser un número'
    })
    .int('El ID de especie debe ser un número entero')
    .positive('El ID de especie debe ser positivo'),

  descripcion: z
    .string()
    .max(1000, 'La descripción no puede exceder los 1000 caracteres')
    .trim()
    .optional()
    .nullable(),

  ubicacion: ubicacionSchema,

  direccion: z
    .string()
    .max(255, 'La dirección no puede exceder los 255 caracteres')
    .trim()
    .optional()
    .nullable(),

  url: z
    .string()
    .url('La URL de la foto no es válida')
    .optional()
    .nullable()
});

/**
 * Esquema de validacion para crear avistamiento
 */
export const createSightingSchema = z.object({
  body: sightingBaseSchema
});

/**
 * Esquema de validacion para actualizar avistamiento
 * Todos los campos son opcionales excepto el ID
 */
export const updateSightingSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  }),
  body: sightingBaseSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'Debe proporcionar al menos un campo para actualizar'
    }
  )
});

/**
 * Esquema de validacion para obtener avistamiento por ID
 */
export const getSightingByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  })
});

/**
 * Esquema de validacion para eliminar avistamiento
 */
export const deleteSightingSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  })
});

/**
 * Esquema de validacion para listar avistamientos
 */
export const getAllSightingsSchema = z.object({
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

    id_especie: z
      .string()
      .regex(/^\d+$/, 'El ID de especie debe ser un número')
      .transform(Number)
      .optional(),

    id_estado_salud: z
      .string()
      .regex(/^\d+$/, 'El ID de estado de salud debe ser un número')
      .transform(Number)
      .optional(),

    id_estado_avistamiento: z
      .string()
      .regex(/^\d+$/, 'El ID de estado de avistamiento debe ser un número')
      .transform(Number)
      .optional()
  })
});

/**
 * Esquema de validacion para filtrar avistamientos por ubicación
 */
export const getSightingsByLocationSchema = z.object({
  query: z.object({
    latitude: z
      .string()
      .regex(/^-?\d+(\.\d+)?$/, 'La latitud debe ser un número válido')
      .transform(Number)
      .refine((val) => val >= -90 && val <= 90, {
        message: 'La latitud debe estar entre -90 y 90'
      }),

    longitude: z
      .string()
      .regex(/^-?\d+(\.\d+)?$/, 'La longitud debe ser un número válido')
      .transform(Number)
      .refine((val) => val >= -180 && val <= 180, {
        message: 'La longitud debe estar entre -180 y 180'
      }),

    radius: z
      .string()
      .regex(/^\d+(\.\d+)?$/, 'El radio debe ser un número válido')
      .transform(Number)
      .refine((val) => val > 0, {
        message: 'El radio debe ser mayor a 0'
      })
      .optional()
  })
});
