// Tipos fijos
export type AlertType =
  | 'Jauria'
  | 'Accidente'
  | 'Robo'
  | 'Animal Perdido'
  | 'Otro';

export type RiskLevel = 'Bajo' | 'Medio' | 'Alto' | 'Critico';

// Interfaz que refleja 100% lo que devuelve la BD
export interface Alert {
  id_alerta: number;
  titulo: string;
  descripcion: string;
  fecha_creacion: string;
  fecha_expiracion: string;
  ubicacion: string;
  activa: boolean;
  reportes: number;

  tipo: AlertType; // viene en string desde la BD
  nivel_riesgo: RiskLevel; // viene en string desde la BD
  creado_por: string; // viene en string desde la BD
}

// Filtros
export interface FilterOptions {
  type: AlertType | 'todos';
  riskLevel: RiskLevel | 'todos';
  status: 'activas' | 'archivadas' | 'todas';
  timeRange: 'recientes' | 'semana' | 'mes' | 'todas';
}

// Estilos por tipo de alerta
export const alertStyles: Record<AlertType, { card: object; badge: object }> = {
  Jauria: {
    card: { borderLeftColor: '#FF6B6B', backgroundColor: '#FFF5F5' },
    badge: { backgroundColor: '#FF6B6B' },
  },
  Accidente: {
    card: { borderLeftColor: '#FFB347', backgroundColor: '#FFF8F0' },
    badge: { backgroundColor: '#FFB347' },
  },
  Robo: {
    card: { borderLeftColor: '#4ECDC4', backgroundColor: '#F0FFFE' },
    badge: { backgroundColor: '#4ECDC4' },
  },
  'Animal Perdido': {
    card: { borderLeftColor: '#45B7D1', backgroundColor: '#F0F8FF' },
    badge: { backgroundColor: '#45B7D1' },
  },
  Otro: {
    card: { borderLeftColor: '#96CEB4', backgroundColor: '#F8FFF8' },
    badge: { backgroundColor: '#96CEB4' },
  },
};

// Estilos por nivel de riesgo
export const riskStyles: Record<
  RiskLevel,
  { color: string; backgroundColor: string }
> = {
  Bajo: { color: '#28a745', backgroundColor: '#d4edda' },
  Medio: { color: '#ffc107', backgroundColor: '#fff3cd' },
  Alto: { color: '#fd9800ff', backgroundColor: '#f8d7da' },
  Critico: { color: '#dc3545', backgroundColor: '#f8d7da' },
};
