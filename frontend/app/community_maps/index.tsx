// src/community_maps/index.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView from 'react-native-maps'; // Importa MapView desde react-native-maps
import { useNavigation } from '@react-navigation/native'; // Para la navegación

const CommunityMapScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -38.7359151, // Coordenada inicial (puedes ajustarla según tu ubicación)
          longitude: -72.5902460, // Coordenada inicial (puedes ajustarla según tu ubicación)
          latitudeDelta: 0.0922, // Nivel de zoom en el eje Y
          longitudeDelta: 0.0421, // Nivel de zoom en el eje X
        }}
      />
    </View>
  );
};

// Estilos para el mapa y la pantalla
const styles = StyleSheet.create({
  container: {
    flex: 1, // Hace que el contenedor ocupe todo el espacio disponible
  },
  map: {
    flex: 1, // Hace que el mapa ocupe todo el espacio disponible dentro del contenedor
  },
});

export default CommunityMapScreen;
