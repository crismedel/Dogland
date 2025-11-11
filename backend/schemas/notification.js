import { z } from 'zod';

/**
 * Schema base para notificaciones
 */
const notificationBaseSchema = z.object({
  title: z
    .string({
      required_error: 'El título es obligatorio',
      invalid_type_error: 'El título debe ser texto'
    })
    .min(1, 'El título no puede estar vacío')
    .max(200, 'El título no puede exceder los 200 caracteres')
    .trim(),

  body: z
    .string({
      required_error: 'El cuerpo es obligatorio',
      invalid_type_error: 'El cuerpo debe ser texto'
    })
    .min(1, 'El cuerpo no puede estar vacío')
    .max(1000, 'El cuerpo no puede exceder los 1000 caracteres')
    .trim(),

  type: z
    .string({
      required_error: 'El tipo es obligatorio'
    })
    .min(1, 'El tipo no puede estar vacío')
    .max(50, 'El tipo no puede exceder los 50 caracteres'),

  data: z
    .record(z.any())
    .optional()
    .nullable()
});

/**
 * Esquema de validacion para marcar notificación como leída
 */
export const markNotificationReadSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  })
});

/**
 * Esquema de validacion para borrar notificación
 */
export const deleteNotificationSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  })
});

/**
 * Esquema de validacion para actualizar estado de alerta
 */
export const updateAlertStatusSchema = z.object({
  params: z.object({
    id_alerta: z
      .string()
      .regex(/^\d+$/, 'El ID de alerta debe ser un número válido')
      .transform(Number)
  }),
  body: z.object({
    estado: z
      .string({
        required_error: 'El estado es obligatorio'
      })
      .min(1, 'El estado no puede estar vacío')
  })
});

/**
 * Esquema de validacion para actualizar preferencias de token
 */
export const updateTokenPreferencesSchema = z.object({
  body: z.object({
    push_token: z
      .string({
        required_error: 'El token push es obligatorio'
      })
      .min(1, 'El token push no puede estar vacío'),

    preferences: z.object({
      alertas_activadas: z
        .boolean({
          invalid_type_error: 'alertas_activadas debe ser verdadero o falso'
        })
        .optional(),

      avistamientos_activados: z
        .boolean({
          invalid_type_error: 'avistamientos_activados debe ser verdadero o falso'
        })
        .optional(),

      adopciones_activadas: z
        .boolean({
          invalid_type_error: 'adopciones_activadas debe ser verdadero o falso'
        })
        .optional(),

      notificaciones_generales: z
        .boolean({
          invalid_type_error: 'notificaciones_generales debe ser verdadero o falso'
        })
        .optional()
    }).refine(
      (data) => Object.keys(data).length > 0,
      {
        message: 'Debe proporcionar al menos una preferencia para actualizar'
      }
    )
  })
});

/**
 * Esquema de validacion para registrar push token
 */
export const registerPushTokenSchema = z.object({
  body: z.object({
    push_token: z
      .string({
        required_error: 'El token push es obligatorio'
      })
      .min(1, 'El token push no puede estar vacío')
      .max(500, 'El token push no puede exceder los 500 caracteres'),

    platform: z
      .enum(['ios', 'android', 'web'], {
        required_error: "La plataforma es obligatoria (valores permitidos: 'ios', 'android', 'web')",
        invalid_type_error: "La plataforma debe ser 'ios', 'android' o 'web'"
      }),

    device_id: z
      .string()
      .max(255, 'El device_id no puede exceder los 255 caracteres')
      .optional()
      .nullable()
  })
});

/**
 * Esquema de validacion para eliminar push token
 */
export const deletePushTokenSchema = z.object({
  body: z.object({
    push_token: z
      .string({
        required_error: 'El token push es obligatorio'
      })
      .min(1, 'El token push no puede estar vacío')
  })
});

/**
 * Esquema de validacion para enviar notificación de prueba
 */
export const sendTestNotificationSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: 'El título es obligatorio'
      })
      .min(1, 'El título no puede estar vacío')
      .max(200, 'El título no puede exceder los 200 caracteres'),

    body: z
      .string({
        required_error: 'El cuerpo es obligatorio'
      })
      .min(1, 'El cuerpo no puede estar vacío')
      .max(1000, 'El cuerpo no puede exceder los 1000 caracteres'),

    data: z
      .record(z.any())
      .optional()
  })
});

/**
 * Esquema de validacion para enviar notificación a usuario específico
 */
export const sendNotificationToUserSchema = z.object({
  body: z.object({
    userId: z
      .number({
        required_error: 'El ID de usuario es obligatorio',
        invalid_type_error: 'El ID de usuario debe ser un número'
      })
      .int()
      .positive(),

    title: z
      .string({
        required_error: 'El título es obligatorio'
      })
      .min(1, 'El título no puede estar vacío')
      .max(200, 'El título no puede exceder los 200 caracteres'),

    body: z
      .string({
        required_error: 'El cuerpo es obligatorio'
      })
      .min(1, 'El cuerpo no puede estar vacío')
      .max(1000, 'El cuerpo no puede exceder los 1000 caracteres'),

    type: z
      .string()
      .max(50, 'El tipo no puede exceder los 50 caracteres')
      .optional(),

    data: z
      .record(z.any())
      .optional()
  })
});

/**
 * Esquema de validacion para obtener historial de notificaciones
 */
export const getNotificationHistorySchema = z.object({
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

    read: z
      .enum(['true', 'false'], {
        errorMap: () => ({ message: 'El valor de read debe ser true o false' })
      })
      .optional()
  })
});
