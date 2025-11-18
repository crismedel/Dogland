import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { useRouter } from 'expo-router';
import FormAgregarPerrito from './component/formAgregarPerrito';

// 1. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

const AgregarPerrito = () => {
  // 2. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const router = useRouter();

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Agregar Nuevo Animal"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              // 3. Aplicar color dinámico
              style={{
                width: 24,
                height: 24,
                tintColor: isDark ? colors.lightText : colors.text,
              }}
            />
          </TouchableOpacity>
        }
      />

      {/* 👇 Aquí simplemente renderizamos el componente del formulario */}
      <FormAgregarPerrito />
    </View>
  );
};

// 4. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background, // 5. Aplicar color dinámico
    },
  });

export default AgregarPerrito;
