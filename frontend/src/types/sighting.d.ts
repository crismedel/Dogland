// frontend/src/types/sighting.d.ts

// (Asumo que RelatedDetail es algo como { id: number; nombre: string; })
export interface RelatedDetail {
  id: number;
  nombre: string;
}

export interface Sighting {
  // Campos que devuelve la consulta getSightingById
  id_avistamiento: number;
  id_usuario: number;
  id_estado_avistamiento: number; // <-- El campo que faltaba
  id_estado_salud: number;
  id_especie: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  descripcion: string;
  direccion: string;
  longitude: number;
  latitude: number;
  fotos_url: string[];

  activa?: boolean; 
  especie?: RelatedDetail;
  estadoSalud?: RelatedDetail;
}