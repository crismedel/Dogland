import { z } from 'zod';

/**
 * Schema base reutilizable para historial médico
 * Contiene todos los campos comunes entre crear y actualizar
 */
const medicalHistoryBaseSchema = z.object({
  fecha_evento: z
    .string({
      required_error: 'La fecha del evento es obligatoria'
    })
    .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Fecha inválida, debe ser YYYY-MM-DD o ISO 8601')
    .or(z.date()),

  tipo_evento: z
    .string({
      required_error: 'El tipo de evento es obligatorio',
      invalid_type_error: 'El tipo de evento debe ser texto'
    })
    .min(1, 'El tipo de evento no puede estar vacío')
    .max(100, 'El tipo de evento no puede exceder los 100 caracteres')
    .trim(),

  diagnostico: z
    .union([
      z.string().max(500).trim(),
      z.null()
    ])
    .optional(),

  detalles: z
    .union([
      z.string().max(1000).trim(),
      z.null()
    ])
    .optional(),

  nombre_veterinario: z
    .union([
      z.string().max(200).trim(),
      z.null()
    ])
    .optional()
});

/**
 * Esquema de validacion para crear evento médico
 */
export const createMedicalHistorySchema = z.object({
  params: z.object({
    animalId: z
      .string()
      .regex(/^\d+$/, 'El ID del animal debe ser un número válido')
      .transform(Number)
  }),
  body: medicalHistoryBaseSchema
});

/**
 * Esquema de validacion para actualizar evento médico
 * Todos los campos son opcionales
 */
export const updateMedicalHistorySchema = z.object({
  params: z.object({
    animalId: z
      .string()
      .regex(/^\d+$/, 'El ID del animal debe ser un número válido')
      .transform(Number),
    historyId: z
      .string()
      .regex(/^\d+$/, 'El ID del historial debe ser un número válido')
      .transform(Number)
  }),
  body: medicalHistoryBaseSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'Debe proporcionar al menos un campo para actualizar'
    }
  )
});

/**
 * Esquema de validacion para obtener historial médico de un animal
 */
export const getMedicalHistoryByAnimalSchema = z.object({
  params: z.object({
    animalId: z
      .string()
      .regex(/^\d+$/, 'El ID del animal debe ser un número válido')
      .transform(Number)
  })
});

/**
 * Esquema de validacion para obtener detalle de un evento médico
 */
export const getMedicalHistoryDetailSchema = z.object({
  params: z.object({
    animalId: z
      .string()
      .regex(/^\d+$/, 'El ID del animal debe ser un número válido')
      .transform(Number),
    historyId: z
      .string()
      .regex(/^\d+$/, 'El ID del historial debe ser un número válido')
      .transform(Number)
  })
});

/**
 * Esquema de validacion para eliminar evento médico
 */
export const deleteMedicalHistorySchema = z.object({
  params: z.object({
    animalId: z
      .string()
      .regex(/^\d+$/, 'El ID del animal debe ser un número válido')
      .transform(Number),
    historyId: z
      .string()
      .regex(/^\d+$/, 'El ID del historial debe ser un número válido')
      .transform(Number)
  })
});

/**
 * Esquema de validacion para listar todo el historial médico (admin)
 */
export const getAllMedicalHistorySchema = z.object({
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
      .optional()
  })
});
