export const obtenerColorMarcador = (idEstadoSalud: number) => {
  switch (idEstadoSalud) {
    case 1:
      return '#4CAF50'; // Saludable
    case 2:
      return '#FF9800'; // Herido
    case 3:
      return '#F44336'; // Grave
    default:
      return '#2196F3'; // Azul
  }
};

export const obtenerNombreEspecie = (id: number) => {
  const especies: { [key: number]: string } = {
    1: 'Perro',
    2: 'Gato',
    3: 'Otro',
  };
  return especies[id] || 'Desconocida';
};

export const obtenerNombreEstadoSalud = (id: number) => {
  const estados: { [key: number]: string } = {
    1: 'Saludable',
    2: 'Herido',
    3: 'Grave',
  };
  return estados[id] || 'Desconocido';
};
