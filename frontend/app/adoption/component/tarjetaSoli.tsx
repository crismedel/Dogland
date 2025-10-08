// /app/adoption/component/tarjetaSoli.tsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';

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
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Información del Animal */}
      {formData.nombreAnimal ? (
        <View style={styles.animalSection}>
          <Text style={styles.sectionTitle}>Perrito en busca de un hogar</Text>

          <View style={styles.animalInfo}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.animalImage} />
            ) : null}

            <View style={styles.animalDetails}>
              <Text style={styles.animalName}>{formData.nombreAnimal}</Text>
              <Text style={styles.animalBreed}>{formData.breed}</Text>
              <Text style={styles.animalAge}>{formData.age} meses</Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* Información Personal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre "
          value={formData.nombreSolicitante}
          onChangeText={text => handleInputChange('nombreSolicitante', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Apellido "
          value={formData.apellidoSolicitante}
          onChangeText={text => handleInputChange('apellidoSolicitante', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Email "
          keyboardType="email-address"
          value={formData.email}
          onChangeText={text => handleInputChange('email', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Teléfono "
          keyboardType="phone-pad"
          value={formData.telefono}
          onChangeText={text => handleInputChange('telefono', text)}
        />
      </View>

      {/* Dirección */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>¿Dónde vives?</Text>

        <TextInput
          style={styles.input}
          placeholder="Dirección completa "
          value={formData.direccion}
          onChangeText={text => handleInputChange('direccion', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Ciudad "
          value={formData.ciudad}
          onChangeText={text => handleInputChange('ciudad', text)}
        />
      </View>

      {/* Sobre la adopción */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>¿Por qué quieres adoptar?</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="¿Qué te motivó?"
          multiline
          numberOfLines={4}
          value={formData.motivoAdopcion}
          onChangeText={text => handleInputChange('motivoAdopcion', text)}
        />
      </View>

      {/* Condiciones de vivienda */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Condiciones de Vivienda</Text>

        <TextInput
          style={styles.input}
          placeholder="¿Es vivienda propia o alquilada?"
          value={formData.viviendaPropia}
          onChangeText={text => handleInputChange('viviendaPropia', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="¿Tienes espacio exterior?"
          value={formData.espacioExterior}
          onChangeText={text => handleInputChange('espacioExterior', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="¿Tienes otras mascotas?"
          value={formData.otrasMascotas}
          onChangeText={text => handleInputChange('otrasMascotas', text)}
        />
      </View>

      {/* Botón de envío */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Enviar Solicitud</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.note}>* Campos obligatorios</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  animalSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  animalInfo: { flexDirection: 'row', alignItems: 'center' },
  animalImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  animalDetails: { flex: 1 },
  animalName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  animalBreed: { fontSize: 14, color: '#666' },
  animalAge: { fontSize: 12, color: '#999' },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#4A90E2' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#4A90E2', padding: 15, borderRadius: 10, alignItems: 'center', marginVertical: 20 },
  submitButtonDisabled: { backgroundColor: '#a0c0e0' },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  note: { textAlign: 'center', color: '#666', fontSize: 12, marginBottom: 20 },
});

export default TarjetaSoli;
