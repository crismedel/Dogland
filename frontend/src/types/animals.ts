// src/types/animals.ts (versión unificada)

export interface Animal {
  id: string;
  name: string;
  age: number | string;
  edad_aproximada: string;
  imageUrl: string;
  size?: string;
  health?: string;
  estadoMedico?: number;
  breed: number | string;
  descripcionMedica?: string;
  species?: string;
  isFavorited?: boolean;
  id_estado_salud?: number;
  id_raza?: number;
}

// Tipos de Especie
export interface Especie {
  id_especie: number;
  nombre_especie: string;
}

// Tipos de Raza
export interface Raza {
  id_raza: number;
  nombre_raza: string;
}

// Tipos de Estado de Salud
export interface EstadoSalud {
  id_estado_salud: number;
  estado_salud: string;
}
