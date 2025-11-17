import { z } from 'zod';

/**
 * Schema base reutilizable para animal
 * Contiene todos los campos comunes entre crear y actualizar
 */
const animalBaseSchema = z.object({
  nombre_animal: z
    .string({
      required_error: 'El nombre del animal es obligatorio',
      invalid_type_error: 'El nombre debe ser texto'
    })
    .min(1, 'El nombre del animal no puede estar vacío')
    .max(100, 'El nombre no puede exceder los 100 caracteres')
    .trim(),

  edad_animal: z
    .union([
      z.number().int().min(0).max(50),
      z.null()
    ])
    .optional(),

  edad_aproximada: z
    .union([
      z.string().max(20),
      z.null()
    ])
    .optional(),

id_estado_salud: z
    .number({
      required_error: 'El estado de salud es obligatorio',
      invalid_type_error: 'El ID de estado de salud debe ser un número'
    })
    .int('El ID de estado de salud debe ser un número entero')
    .positive('El ID de estado de salud debe ser positivo'),

  // CAMBIO AQUÍ: Agregamos .nullable() y .optional() para permitir animales sin raza
  id_raza: z
    .number({
      required_error: 'La raza es obligatoria',
      invalid_type_error: 'El ID de raza debe ser un número'
    })
    .int('El ID de raza debe ser un número entero')
    .positive('El ID de raza debe ser positivo')
    .nullable() 
    .optional() 
});

/**
 * Esquema de validacion para crear animal
 */
export const createAnimalSchema = z.object({
  body: animalBaseSchema
});

/**
 * Esquema de validacion para actualizar animal
 * Todos los campos son opcionales
 */
export const updateAnimalSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  }),
  body: animalBaseSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'Debe proporcionar al menos un campo para actualizar'
    }
  )
});

/**
 * Esquema de validacion para obtener animal por ID
 */
export const getAnimalByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  })
});

/**
 * Esquema de validacion para eliminar animal
 */
export const deleteAnimalSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  })
});

/**
 * Esquema de validacion para listar animales
 */
export const getAllAnimalsSchema = z.object({
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

    id_estado_salud: z
      .string()
      .regex(/^\d+$/, 'El ID de estado de salud debe ser un número')
      .transform(Number)
      .optional(),

    id_raza: z
      .string()
      .regex(/^\d+$/, 'El ID de raza debe ser un número')
      .transform(Number)
      .optional()
  })
});

/**
 * Esquema de validacion para obtener animales por organización
 */
export const getAnimalsByOrganizationSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  })
});