// app/adoption/agregarPerrito.tsx
import CustomHeader from '@/src/components/UI/CustomHeader';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import FormAgregarPerrito from './component/formAgregarPerrito';
import { Colors } from '@/src/constants/colors';

const AgregarPerrito = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Agregar Nuevo Animal"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              style={{ width: 24, height: 24, tintColor: '#fff' }}
            />
          </TouchableOpacity>
        }
      />

      {/* 👇 Aquí simplemente renderizamos el componente del formulario */}
      <FormAgregarPerrito />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // Un color de fondo consistente
  },
});

export default AgregarPerrito;
