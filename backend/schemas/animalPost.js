import { z } from 'zod';

// Definimos el objeto 'body' por separado
const animalBodySchema = z.object({
  nombre_animal: z.string({
    // CAMBIO AQUÍ: Volvemos a 'required_error'
    // Esta es la clave que usa tu equipo para campos faltantes.
    required_error: 'El nombre es requerido', 
    invalid_type_error: 'El nombre debe ser un string', // Mensaje extra por si acaso
  }).min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(50, { message: 'El nombre no puede exceder los 50 caracteres' }),
  
  edad_animal: z.number().int().min(0).max(30).nullish(), 
  
  edad_aproximada: z.string().max(20).nullish(), 

  id_estado_salud: z.number({
    // CAMBIO AQUÍ: Volvemos a 'required_error'
    required_error: 'El estado de salud es requerido',
    invalid_type_error: 'El ID del estado de salud debe ser un número', // Mensaje extra
  }).int().positive(),

  id_raza: z.number().int().positive().nullish(), 

  fotos: z.array(
    z.string().url({ message: 'Las fotos deben ser URLs válidas' })
  ).optional(), 
});

// Esquema principal que usa el middleware 'validateSchema'
export const createAnimalSchema = z.object({
  body: animalBodySchema, 
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});