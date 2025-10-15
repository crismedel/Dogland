// app/adoption/agregarPerrito.tsx
import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import CustomHeader from '@/src/components/UI/CustomHeader';
import FormAgregarPerrito from './component/formAgregarPerrito';

const AgregarPerrito = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Agregar Nuevo Perrito"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              style={{ width: 24, height: 24, tintColor: '#fff' }}
            />
          </TouchableOpacity>
        }
      />

      <FormAgregarPerrito />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
});

export default AgregarPerrito;
