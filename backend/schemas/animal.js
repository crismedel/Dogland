// backend/schemas/animal.js
import Joi from 'joi';

// Esquema para validar la creación de un nuevo animal
export const createAnimalSchema = Joi.object({
  // --- Datos de dogland.animal ---
  nombre_animal: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'El nombre es requerido',
    'string.min': 'El nombre debe tener al menos 2 caracteres',
  }),
  
  edad_animal: Joi.number().integer().min(0).max(30).allow(null), // Opcional, edad exacta
  
  edad_aproximada: Joi.string().max(20).allow(null, ''), // Opcional, ej: "Cachorro", "Adulto"

  id_estado_salud: Joi.number().integer().required().messages({
    'number.base': 'Debe seleccionar un estado de salud',
  }),

  id_raza: Joi.number().integer().allow(null), // Opcional

  // --- Datos de dogland.animal_foto ---
  fotos: Joi.array()
    .items(Joi.string().uri()) // Esperamos un array de URLs de fotos
    .min(1)
    .optional()
    .messages({
      'array.min': 'Debe subir al menos una foto',
      'string.uri': 'Las fotos deben ser URLs válidas',
    }),
});