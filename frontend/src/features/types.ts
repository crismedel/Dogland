// features/alerts/types.ts

// Tipos fijos que usas en filtros y estilos
export type AlertType =
  | 'sanitario'
  | 'seguridad'
  | 'vacunacion'
  | 'adopcion'
  | 'perdida';

export type RiskLevel = 'bajo' | 'medio' | 'alto';

// Interfaz adaptada con BD
export interface Alert {
  id_alerta: number;
  titulo: string;
  descripcion: string;
  fecha_creacion: string;
  fecha_expiracion: string;
  ubicacion: string;
  activa: boolean;
  reportes: number;

  id_tipo_alerta: number;
  id_nivel_riesgo: number;
  id_usuario: number;

  // opcionales si haces JOINs en el backend o map en frontend
  tipo?: AlertType; // "sanitario"
  nivelRiesgo?: RiskLevel; // "alto"
  creadoPor?: string; // nombre_usuario
}

// Filtros
export interface FilterOptions {
  type: AlertType | 'todos';
  riskLevel: RiskLevel | 'todos';
  status: 'activas' | 'archivadas' | 'todas';
  timeRange: 'recientes' | 'semana' | 'mes' | 'todas';
}

// Diccionario para traducir IDs de la BD → nombres legibles
export const tipoAlertas: Record<number, AlertType> = {
  1: 'sanitario',
  2: 'seguridad',
  3: 'vacunacion',
  4: 'adopcion',
  5: 'perdida',
};

export const nivelesRiesgo: Record<number, RiskLevel> = {
  1: 'bajo',
  2: 'medio',
  3: 'alto',
};

// Estilos por tipo de alerta
export const alertStyles: Record<AlertType, { card: object; badge: object }> = {
  sanitario: {
    card: { borderLeftColor: '#FF6B6B', backgroundColor: '#FFF5F5' },
    badge: { backgroundColor: '#FF6B6B' },
  },
  seguridad: {
    card: { borderLeftColor: '#FFB347', backgroundColor: '#FFF8F0' },
    badge: { backgroundColor: '#FFB347' },
  },
  vacunacion: {
    card: { borderLeftColor: '#4ECDC4', backgroundColor: '#F0FFFE' },
    badge: { backgroundColor: '#4ECDC4' },
  },
  adopcion: {
    card: { borderLeftColor: '#45B7D1', backgroundColor: '#F0F8FF' },
    badge: { backgroundColor: '#45B7D1' },
  },
  perdida: {
    card: { borderLeftColor: '#96CEB4', backgroundColor: '#F8FFF8' },
    badge: { backgroundColor: '#96CEB4' },
  },
};

// Estilos por nivel de riesgo
export const riskStyles: Record<
  RiskLevel,
  { color: string; backgroundColor: string }
> = {
  bajo: { color: '#28a745', backgroundColor: '#d4edda' },
  medio: { color: '#ffc107', backgroundColor: '#fff3cd' },
  alto: { color: '#dc3545', backgroundColor: '#f8d7da' },
};
