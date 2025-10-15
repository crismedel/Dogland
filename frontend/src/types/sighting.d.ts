export interface Sighting {
  id_avistamiento: number;
  descripcion: string;
  id_especie: number;
  id_estado_salud: number;
  fecha_creacion: string;
  fotos_url: string[]; // Lista de URLs de fotos asociadas al avistamiento
  nivel_riesgo: string; // Nivel de riesgo asociado al avistamiento
  activa: boolean; // Si el avistamiento está activo o archivado
  latitude?: number; // Latitud (opcional)
  longitude?: number; // Longitud (opcional)
  especie?: RelatedDetail;
estadoSalud?: RelatedDetail;
 direccion?: string;
}
