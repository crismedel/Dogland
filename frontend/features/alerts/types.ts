export interface Alert {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'sanitario' | 'seguridad' | 'vacunacion' | 'adopcion' | 'perdida';
  riskLevel: 'bajo' | 'medio' | 'alto';
  location: string;
  isActive: boolean;
  expirationDate: string;
  reportCount: number;
}

export interface FilterOptions {
  type: Alert['type'] | 'todos';
  riskLevel: Alert['riskLevel'] | 'todos';
  status: 'activas' | 'archivadas' | 'todas';
  timeRange: 'recientes' | 'semana' | 'mes' | 'todas';
}

// Diccionario actualizado con niveles de riesgo
export const alertStyles: Record<
  Alert['type'],
  { card: object; badge: object }
> = {
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

// Estilos para niveles de riesgo
export const riskStyles = {
  bajo: { color: '#28a745', backgroundColor: '#d4edda' },
  medio: { color: '#ffc107', backgroundColor: '#fff3cd' },
  alto: { color: '#dc3545', backgroundColor: '#f8d7da' },
};
