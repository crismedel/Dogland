// 1. Quitar la importación estática de Colors
// import { Colors } from '../constants/colors';

// 2. Importar el TIPO de los colores, no el hook
import { ColorsType } from "@/src/constants/colors";

// Tipos fijos (Estos se mantienen igual)
export type AlertType =
  | "Jauria"
  | "Accidente"
  | "Robo"
  | "Animal Perdido"
  | "Otro";

export type RiskLevel = "Bajo" | "Medio" | "Alto" | "Crítico";

export interface Alert {
  id_alerta: number;
  titulo: string;
  descripcion: string;
  fecha_creacion: string;
  fecha_expiracion: string | null;
  direccion: string | null;
  activa: boolean;
  reportes: number;

  tipo: AlertType; // viene en string desde la BD
  nivel_riesgo: RiskLevel; // viene en string desde la BD
  creado_por: string; // viene en string desde la BD

  latitude?: number | null;
  longitude?: number | null;
}

// Filtros (Estos se mantienen igual)
export interface FilterOptions {
  type: AlertType | "todos";
  riskLevel: RiskLevel | "todos";
  status: "activas" | "archivadas" | "todas";
  timeRange: "recientes" | "semana" | "mes" | "todas";
}

// 3. Convertir 'alertStyles' en una FUNCIÓN que recibe los colores
export const getAlertStyles = (
  colors: ColorsType
): Record<AlertType, { card: object; badge: object }> => ({
  Jauria: {
    // Original: #FF6B6B / #FFF5F5
    card: {
      borderLeftColor: colors.danger,
      backgroundColor: `${colors.danger}15`,
    },
    badge: { backgroundColor: colors.danger },
  },
  Accidente: {
    // Original: #FFB347 / #FFF8F0
    card: {
      borderLeftColor: colors.warning,
      backgroundColor: `${colors.warning}15`,
    },
    badge: { backgroundColor: colors.warning },
  },
  Robo: {
    // Original: #4ECDC4 / #F0FFFE
    card: {
      borderLeftColor: colors.info,
      backgroundColor: `${colors.info}15`,
    },
    badge: { backgroundColor: colors.info },
  },
  "Animal Perdido": {
    // Original: #45B7D1 / #F0F8FF
    card: {
      borderLeftColor: colors.accent,
      backgroundColor: `${colors.accent}15`,
    },
    badge: { backgroundColor: colors.accent },
  },
  Otro: {
    // Original: #96CEB4 / #F8FFF8 (Verde)
    card: {
      borderLeftColor: colors.success,
      backgroundColor: `${colors.success}15`,
    },
    badge: { backgroundColor: colors.success },
  },
});

// 4. Convertir 'riskStyles' en una FUNCIÓN que recibe los colores
export const getRiskStyles = (
  colors: ColorsType
): Record<RiskLevel, { color: string; backgroundColor: string }> => ({
  Bajo: {
    color: colors.success,
    backgroundColor: `${colors.success}20`, // Original: #d4edda
  },
  Medio: {
    color: colors.warning,
    backgroundColor: `${colors.warning}20`, // Original: #fff3cd
  },
  Alto: {
    color: colors.secondary, // Mantenemos secondary si así estaba
    backgroundColor: `${colors.danger}20`, // Original: #f8d7da
  },
  Crítico: {
    color: colors.danger,
    backgroundColor: `${colors.danger}20`, // Original: #f8d7da
  },
});
