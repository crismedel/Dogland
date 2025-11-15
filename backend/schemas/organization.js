import { z } from 'zod';

/** 
 * Schema base reutilizable para organizacion
 * Contiene todos los campos comunes entre crear y actualizar
 */
const organizationBaseSchema = z.object({
  nombre_organizacion: z
    .string({
      required_error: 'El nombre de la organización es requerido',
      invalid_type_error: 'El nombre debe ser un texto'
    })
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim(),
  
  telefono_organizacion: z
    .string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .regex(/^[+]?[\d\s()-]+$/, 'Formato de teléfono inválido')
    .trim()
    .optional()
    .nullable(),
  
  email_organizacion: z
    .email('El formato del email es inválido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .toLowerCase()
    .trim()
    .optional()
    .nullable(),
  
  direccion: z
    .string()
    .max(100, 'La dirección no puede exceder 100 caracteres')
    .trim()
    .optional()
    .nullable(),
  
  id_ciudad: z
    .number({
      invalid_type_error: 'El ID de ciudad debe ser un número'
    })
    .int('El ID de ciudad debe ser un número entero')
    .positive('El ID de ciudad debe ser positivo')
    .optional()
    .nullable()
});

/** 
 * Esquema de validacion para crear organizacion
 * Utilizado para verificar el tipo, tamaño de los datos, etc
 */
export const createOrganizationSchema = z.object({
  body: organizationBaseSchema
});

/** 
 * Esquema de validacion para actualizar organizacion
 * Todos los campos son opcionales
 */
export const updateOrganizationSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  }),
  
  body: organizationBaseSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'Debe proporcionar al menos un campo para actualizar'
    }
  )
});

/** 
 * Esquema de validacion para obtener organizacion por ID
 */
export const getOrganizationByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  })
});

/** 
 * Esquema de validacion para eliminar organizacion
 */
export const deleteOrganizationSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  })
});

/** 
 * Esquema de validacion para listar organizaciones
 * Incluye parametros de paginacion y busqueda
 */
export const getAllOrganizationsSchema = z.object({
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

    search: z
      .string()
      .min(1, 'La búsqueda debe tener al menos 1 carácter')
      .max(100, 'La búsqueda no puede exceder 100 caracteres')
      .trim()
      .optional()
  })
});

/** 
 * Esquema de validacion para obtener usuarios de una organizacion
 */
export const getOrganizationUsersSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'El ID debe ser un número válido')
      .transform(Number)
  }),
  
  query: z.object({
    activo: z
      .enum(['true', 'false'], {
        errorMap: () => ({ message: 'El valor de activo debe ser true o false' })
      })
      .optional()
  })
});