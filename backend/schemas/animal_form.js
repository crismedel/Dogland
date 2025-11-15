import { z } from 'zod';

// Esquema para la creación de un animal completo
export const createFullAnimalSchema = z.object({
  body: z.object({
    nombre_animal: z.string({
      required_error: 'El nombre del animal es requerido.',
    }).min(2, 'El nombre debe tener al menos 2 caracteres.'),

    edad_animal: z.number({
      required_error: 'La edad es requerida.',
      invalid_type_error: 'La edad debe ser un número.',
    }).int().positive('La edad debe ser un número positivo.'),

    edad_aproximada: z.boolean({
      required_error: 'Debe indicar si la edad es aproximada.',
      invalid_type_error: 'El valor de edad aproximada debe ser booleano.',
    }),

    id_raza: z.number({
      required_error: 'La raza es requerida.',
    }).int().positive('El ID de la raza debe ser un entero positivo.'),

    id_estado_salud: z.number({
      required_error: 'El estado de salud es requerido.',
    }).int().positive('El ID del estado de salud debe ser un entero positivo.'),

    descripcion_adopcion: z.string({
      required_error: 'La descripción es requerida.',
    }).min(10, 'La descripción debe tener al menos 10 caracteres.'),

    foto_url: z.string().url('La URL de la foto no es válida.').optional(),

    historial_medico: z.object({
      diagnostico: z.string().min(5, 'El diagnóstico debe tener al menos 5 caracteres.'),
      tratamiento: z.string().min(5, 'El tratamiento debe tener al menos 5 caracteres.'),
      fecha_examen: z.string().datetime('La fecha del examen no es válida.'),
      tipo_evento: z.string().optional(),
      nombre_veterinario: z.string().optional(),
    }).optional(),
  }),
});
