import { z } from 'zod';

/**
 * Schema base reutilizable para alertas
 * Contiene todos los campos comunes entre crear y actualizar
 */
const alertBaseSchema = z.object({
  titulo: z
    .string({
      required_error: 'El título es obligatorio',
      invalid_type_error: 'El título debe ser texto'
    })
    .min(1, 'El título no puede estar vacío')
    .max(100, 'El título no puede exceder los 100 caracteres')
    .trim(),

  descripcion: z
    .string({
      required_error: 'La descripción es obligatoria',
      invalid_type_error: 'La descripción debe ser texto'
    })
    .min(1, 'La descripción no puede estar vacía')
    .max(1000, 'La descripción no puede exceder los 1000 caracteres')
    .trim(),

  id_tipo_alerta: z
    .number({
      required_error: 'El tipo de alerta es obligatorio',
      invalid_type_error: 'El ID del tipo de alerta debe ser un número'
    })
    .int('El ID del tipo de alerta debe ser un número entero')
    .positive('El ID del tipo de alerta debe ser positivo'),

  id_nivel_riesgo: z
    .number({
      required_error: 'El nivel de riesgo es obligatorio',
      invalid_type_error: 'El ID del nivel de riesgo debe ser un número'
    })
    .int('El ID del nivel de riesgo debe ser un número entero')
    .positive('El ID del nivel de riesgo debe ser positivo'),

  latitude: z
    .number({
      invalid_type_error: 'La latitud debe ser un número'
    })
    .min(-90, 'La latitud debe estar entre -90 y 90')
    .max(90, 'La latitud debe estar entre -90 y 90')
    .optional()
    .nullable(),

  longitude: z
    .number({
      invalid_type_error: 'La longitud debe ser un número'
    })
    .min(-180, 'La longitud debe estar entre -180 y 180')
    .max(180, 'La longitud debe estar entre -180 y 180')
    .optional()
    .nullable(),

  direccion: z
    .string()
    .max(255, 'La dirección no puede exceder los 255 caracteres')
    .trim()
    .optional()
    .nullable(),

  fecha_expiracion: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, 'Fecha inválida, debe ser YYYY-MM-DD o ISO 8601')
    .optional()
    .nullable(),

  activa: z
    .boolean({
      invalid_type_error: 'Activa debe ser verdadero o falso'
    })
    .optional()
});

/**
 * Esquema de validacion para crear alerta
 */
export const createAlertSchema = z.object({
  body: alertBaseSchema.omit({ activa: true })
});

/**
 * Esquema de validacion para actualizar alerta
 * Todos los campos son opcionales
 */
export const updateAlertSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  }),
  body: alertBaseSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'Debe proporcionar al menos un campo para actualizar'
    }
  )
});

/**
 * Esquema de validacion para obtener alerta por ID
 */
export const getAlertByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  })
});

/**
 * Esquema de validacion para eliminar alerta
 */
export const deleteAlertSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  })
});

/**
 * Esquema de validacion para listar alertas
 */
export const getAllAlertsSchema = z.object({
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

    activa: z
      .enum(['true', 'false'], {
        errorMap: () => ({ message: 'El valor de activa debe ser true o false' })
      })
      .optional(),

    id_tipo_alerta: z
      .string()
      .regex(/^\d+$/, 'El ID de tipo de alerta debe ser un número')
      .transform(Number)
      .optional(),

    id_nivel_riesgo: z
      .string()
      .regex(/^\d+$/, 'El ID de nivel de riesgo debe ser un número')
      .transform(Number)
      .optional()
  })
});