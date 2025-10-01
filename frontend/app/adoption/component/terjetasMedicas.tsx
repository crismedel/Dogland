// app/adoption/component/tarjetasMedicas.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TarjetaMedicaProps {
  nombre: string;
  condicion: string;
}

const TarjetaMedica: React.FC<TarjetaMedicaProps> = ({ nombre, condicion }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{nombre}</Text>
      <Text style={styles.condition}>{condicion}</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  condition: { fontSize: 13, color: '#555', marginTop: 6 },
});

export default TarjetaMedica;
