// src/constants/colors.ts

// Paleta de colores para tema claro
export const lightColors = {
  primary: "#fbbf24", // Un amarillo vibrante
  secondary: "#d97706", // Un naranja oscuro
  accent: "#1976d2", // Un azul para acentos
  background: "#F2E2C4", // Fondo claro
  backgroundSecon: "#E0CDAF", // Fondo oscuro claro
  cardBackground: "#f4ecde",
  text: "#2c3e50", // Texto oscuro principal
  lightText: "#ffffff", // Texto claro (para fondos oscuros)
  gray: "#cccccc", // Gris claro
  darkGray: "#666666", // Gris oscuro
  success: "#28a745", // Verde para éxito
  danger: "#dc3545", // Rojo para peligro/error
  warning: "#ffc107", // Amarillo para advertencia
  info: "#17a2b8", // Azul claro para información
};

// Paleta de colores para tema oscuro
export const darkColors = {
  primary: "#fbbf24",
  secondary: "#f97706",
  accent: "#1976d2",
  background: "#1f2937",
  backgroundSecon: "#2c3e50",
  cardBackground: "#2c3e50",
  text: "#f3f4f6",
  lightText: "#1f2937",
  gray: "#4b5563",
  darkGray: "#9ca3af",
  success: "#28a745",
  danger: "#dc3545",
  warning: "#ffc107",
  info: "#17a2b8",
};

export type ColorsType = typeof lightColors;
