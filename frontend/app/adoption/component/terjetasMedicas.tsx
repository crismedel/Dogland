// app/adoption/component/tarjetasMedicas.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';
interface TarjetaMedicaProps {
  nombre?: string;
  condicion?: string; // formato antiguo
  estadoMedico?: number | string; // 1,2,3 (nuevo)
  descripcion?: string; // texto descriptivo (nuevo)
}

const getEstadoTexto = (valor?: number | string) => {
  const v = Number(valor);
  switch (v) {
    case 1:
      return { texto: 'Perrito sano', color: '#4CAF50' };
    case 2:
      return { texto: 'En tratamiento', color: '#FFC107' };
    case 3:
      return { texto: 'Recuperado de enfermedad', color: '#2196F3' };
    default:
      return { texto: 'Sin información médica', color: '#9E9E9E' };
  }
};

const TarjetaMedica: React.FC<TarjetaMedicaProps> = ({
  nombre,
  condicion,
  estadoMedico,
  descripcion,
}) => {
  const estado = getEstadoTexto(estadoMedico);
  // preferimos descripcion (nuevo), si no existe usamos condicion (legacy)
  const detalle = descripcion ?? condicion ?? 'No hay detalles del historial.';

  return (
    <View style={styles.card}>
      {nombre ? <AppText style={styles.title}>{nombre}</AppText> : null}
      <AppText style={[styles.estado, { color: estado.color }]}>
        {estado.texto}
      </AppText>
      <AppText style={styles.descripcion}>{detalle}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    marginHorizontal: 16,
    width: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: fontWeightBold,
    color: '#333',
    marginBottom: 6,
  },
  estado: {
    fontSize: 14,
    fontWeight: fontWeightSemiBold,
    marginBottom: 6,
  },
  descripcion: { fontSize: 13, color: '#555' },
});

export default TarjetaMedica;
