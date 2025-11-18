import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';
// 1. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';
import { Ionicons } from '@expo/vector-icons'; // Importar Ionicons

interface TarjetaSoliProps {
  formData: any;
  loading: boolean;
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: () => void;
  imageUrl?: string;
}

const TarjetaSoli: React.FC<TarjetaSoliProps> = ({
  formData,
  loading,
  handleInputChange,
  handleSubmit,
  imageUrl,
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

      {/* Información Personal */}
      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Información Personal</AppText>

        <TextInput
          style={styles.input}
          placeholder="Nombre *"
          value={formData.nombreSolicitante}
          onChangeText={(text) => handleInputChange('nombreSolicitante', text)}
          placeholderTextColor={colors.darkGray}
        />

        <TextInput
          style={styles.input}
          placeholder="Apellido *"
          value={formData.apellidoSolicitante}
          onChangeText={(text) =>
            handleInputChange('apellidoSolicitante', text)
          }
          placeholderTextColor={colors.darkGray}
        />

        <TextInput
          style={styles.input}
          placeholder="Email *"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          placeholderTextColor={colors.darkGray}
        />

        <TextInput
          style={styles.input}
          placeholder="Teléfono *"
          keyboardType="phone-pad"
          value={formData.telefono}
          onChangeText={(text) => handleInputChange('telefono', text)}
          placeholderTextColor={colors.darkGray}
        />
      </View>

      {/* Dirección */}
      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>¿Dónde vives?</AppText>

        <TextInput
          style={styles.input}
          placeholder="Dirección completa *"
          value={formData.direccion}
          onChangeText={(text) => handleInputChange('direccion', text)}
          placeholderTextColor={colors.darkGray}
        />

        <TextInput
          style={styles.input}
          placeholder="Ciudad *"
          value={formData.ciudad}
          onChangeText={(text) => handleInputChange('ciudad', text)}
          placeholderTextColor={colors.darkGray}
        />
      </View>

      {/* Sobre la adopción */}
      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>¿Por qué quieres adoptar?</AppText>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="¿Qué te motivó? *"
          multiline
          numberOfLines={4}
          value={formData.motivoAdopcion}
          onChangeText={(text) => handleInputChange('motivoAdopcion', text)}
          placeholderTextColor={colors.darkGray}
        />
      </View>

      {/* Condiciones de vivienda */}
      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Condiciones de Vivienda</AppText>

        <TextInput
          style={styles.input}
          placeholder="¿Es vivienda propia o alquilada?"
          value={formData.viviendaPropia}
          onChangeText={(text) => handleInputChange('viviendaPropia', text)}
          placeholderTextColor={colors.darkGray}
        />

        <TextInput
          style={styles.input}
          placeholder="¿Tienes espacio exterior?"
          value={formData.espacioExterior}
          onChangeText={(text) => handleInputChange('espacioExterior', text)}
          placeholderTextColor={colors.darkGray}
        />

        <TextInput
          style={styles.input}
          placeholder="¿Tienes otras mascotas?"
          value={formData.otrasMascotas}
          onChangeText={(text) => handleInputChange('otrasMascotas', text)}
          placeholderTextColor={colors.darkGray}
        />
      </View>

      {/* Botón de envío */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          // 4. Usar colores del tema
          <ActivityIndicator
            color={isDark ? colors.lightText : colors.text}
          />
        ) : (
          <AppText style={styles.submitButtonText}>Enviar Solicitud</AppText>
        )}
      </TouchableOpacity>

      <AppText style={styles.note}>* Campos obligatorios</AppText>
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
      borderRadius: 10,
      marginBottom: 15,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.secondary, // Dinámico
    },
    animalInfo: { flexDirection: 'row', alignItems: 'center' },
    animalImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
    animalDetails: { flex: 1 },
    animalName: {
      fontSize: 18,
      fontWeight: fontWeightBold,
      color: colors.text, // Dinámico
    },
    animalBreed: { fontSize: 14, color: colors.darkGray }, // Dinámico
    animalAge: { fontSize: 12, color: colors.gray }, // Dinámico
    section: {
      backgroundColor: colors.cardBackground, // Dinámico
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.secondary, // Dinámico
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: fontWeightBold,
      marginBottom: 10,
      color: colors.primary, // Dinámico
    },
    input: {
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
      borderRadius: 8,
      padding: 12,
      marginBottom: 10,
      fontSize: 16,
      backgroundColor: colors.background, // Dinámico
      color: colors.text, // Dinámico
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    submitButton: {
      backgroundColor: colors.primary, // Dinámico
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginVertical: 20,
    },
    submitButtonDisabled: {
      backgroundColor: colors.darkGray, // Dinámico
      opacity: 0.7,
    },
    submitButtonText: {
      color: isDark ? colors.lightText : colors.text, // Dinámico
      fontSize: 18,
      fontWeight: fontWeightBold,
    },
    note: {
      textAlign: 'center',
      color: colors.darkGray, // Dinámico
      fontSize: 12,
      marginBottom: 20,
    },
  });

export default TarjetaSoli;