export interface Alert {
  id_alerta: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  tipo: string;
  nivel_riesgo: string;
  fecha_creacion: string;
  fecha_expiracion: string;
  activa: boolean;
  reportes: number;
}
