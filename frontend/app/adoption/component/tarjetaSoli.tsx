import React from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { fontWeightBold, AppText } from '@/src/components/AppText';
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm'; // Importa DynamicForm y FormField
// 1. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

interface TarjetaSoliProps {
  formData: Record<string, any>;
  loading: boolean;
  handleValueChange: (name: string, value: any) => void;
  handleSubmit: () => void;
  imageUrl?: string;
  fields: FormField[];
  loadingFields?: Record<string, boolean>;
}

const TarjetaSoli: React.FC<TarjetaSoliProps> = ({
  formData,
  loading,
  handleValueChange,
  handleSubmit,
  imageUrl,
  fields,
  loadingFields = {},
}) => {
  // 2. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Información del Animal */}
      {formData.nombreAnimal ? (
        <View style={styles.animalSection}>
          <AppText style={styles.sectionTitle}>
            Perrito en busca de un hogar
          </AppText>

          <View style={styles.animalInfo}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.animalImage} />
            ) : null}

            <View style={styles.animalDetails}>
              <AppText style={styles.animalName}>
                {formData.nombreAnimal}
              </AppText>
              <AppText style={styles.animalBreed}>{formData.breed}</AppText>
              <AppText style={styles.animalAge}>{formData.age} meses</AppText>
            </View>
          </View>
        </View>
      ) : null}

      <AppText style={styles.note}>* Campos obligatorios</AppText>
      <View style={{ marginBottom: 30 }}>
        {/* DynamicForm en lugar de inputs manuales */}
        <DynamicForm
          fields={fields}
          values={formData}
          onValueChange={handleValueChange}
          onSubmit={handleSubmit}
          loading={loading}
          loadingFields={loadingFields}
          buttonText="Enviar Solicitud"
        />
      </View>
    </ScrollView>
  );
};

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 15,
      backgroundColor: colors.background, // Dinámico
    },
    animalSection: {
      backgroundColor: colors.cardBackground, // Dinámico
      padding: 15,
      borderWidth: 1,
      borderColor: colors.secondary,
      borderRadius: 10,
      marginBottom: 35,
      elevation: 2,
    },
    animalInfo: { flexDirection: 'row', alignItems: 'center' },
    animalImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 15,
      borderWidth: 1,
      borderColor: colors.secondary,
    },
    animalDetails: { flex: 1 },
    animalName: {
      fontSize: 18,
      fontWeight: fontWeightBold,
      color: colors.text,
    },
    animalBreed: { fontSize: 14, color: colors.text },
    animalAge: { fontSize: 12, color: colors.gray }, // Dinámico
    sectionTitle: {
      fontSize: 16,
      fontWeight: fontWeightBold,
      marginBottom: 10,
      color: colors.secondary,
    },
    note: {
      textAlign: 'center',
      color: colors.danger,
      fontSize: 12,
    },
  });

export default TarjetaSoli;
