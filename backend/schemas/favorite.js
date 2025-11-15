// schemas/favorite.js
import { z } from 'zod';

// acepta tanto string numérico como number y transforma a Number
const idNumber = z
  .union([
    z.string().regex(/^\d+$/, 'Debe ser un número').transform(Number),
    z.number().int().positive(),
  ])
  .transform((v) => Number(v));

export const addFavoriteSchema = z.object({
  body: z.object({
    animal_id: idNumber,
  }),
});

export const removeFavoriteSchema = z.object({
  params: z.object({
    animal_id: idNumber,
  }),
});

export const getUserFavoritesSchema = z.object({
  params: z.object({
    user_id: idNumber,
  }),
});
