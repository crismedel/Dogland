// app/adoption/solicitudAdopcion.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SolicitudAdopcion = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    idAnimal: params.idAnimal || '',
    nombreAnimal: params.nombreAnimal || '',
    breed: params.breed || '',
    age: params.age || '',
    
    nombreSolicitante: '',
    apellidoSolicitante: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    motivoAdopcion: '',
    experienciaMascotas: '',
    viviendaPropia: '',
    espacioExterior: '',
    otrasMascotas: '',
    horasSolo: '',
  });

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  const cargarDatosUsuario = async () => {
    // Datos de ejemplo del usuario (en una app real vendrían de tu auth system)
    setFormData(prev => ({
      ...prev,
      nombreSolicitante: '', //nombre de ejemplo
      email: '', //correo de ejemplo
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.nombreSolicitante || !formData.email || !formData.telefono || !formData.direccion || !formData.motivoAdopcion) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    
    try {
      // Simulación de envío a la API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        '¡Solicitud Enviada!',
        `Tu solicitud para adoptar a ${formData.nombreAnimal} ha sido enviada correctamente. Nos pondremos en contacto contigo pronto.`,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la solicitud. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
 

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Información del Animal */}
        {formData.nombreAnimal && (
          <View style={styles.animalSection}>
            <Text style={styles.sectionTitle}>Animal a Adoptar</Text>
            <View style={styles.animalInfo}>
              {params.imageUrl && (
                <Image 
                  source={{ uri: params.imageUrl as string }} 
                  style={styles.animalImage} 
                />
              )}
              <View style={styles.animalDetails}>
                <Text style={styles.animalName}>{formData.nombreAnimal}</Text>
                <Text style={styles.animalBreed}>{formData.breed}</Text>
                <Text style={styles.animalAge}>{formData.age} meses</Text>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.subtitle}>
          Completa el formulario para solicitar la adopción
        </Text>

        {/* Información Personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Nombre *"
            value={formData.nombreSolicitante}
            onChangeText={(text) => handleInputChange('nombreSolicitante', text)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Apellido *"
            value={formData.apellidoSolicitante}
            onChangeText={(text) => handleInputChange('apellidoSolicitante', text)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email *"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Teléfono *"
            keyboardType="phone-pad"
            value={formData.telefono}
            onChangeText={(text) => handleInputChange('telefono', text)}
          />
        </View>

        {/* Dirección */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dirección</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Dirección completa *"
            value={formData.direccion}
            onChangeText={(text) => handleInputChange('direccion', text)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Ciudad *"
            value={formData.ciudad}
            onChangeText={(text) => handleInputChange('ciudad', text)}
          />
        </View>

        {/* Información de Adopción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre la Adopción</Text>
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="¿Por qué quieres adoptar? *"
            multiline
            numberOfLines={4}
            value={formData.motivoAdopcion}
            onChangeText={(text) => handleInputChange('motivoAdopcion', text)}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Experiencia previa con mascotas"
            multiline
            numberOfLines={3}
            value={formData.experienciaMascotas}
            onChangeText={(text) => handleInputChange('experienciaMascotas', text)}
          />
        </View>

        {/* Condiciones de Vivienda */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Condiciones de Vivienda</Text>
          
          <TextInput
            style={styles.input}
            placeholder="¿Es vivienda propia o alquilada?"
            value={formData.viviendaPropia}
            onChangeText={(text) => handleInputChange('viviendaPropia', text)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="¿Tienes espacio exterior?"
            value={formData.espacioExterior}
            onChangeText={(text) => handleInputChange('espacioExterior', text)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="¿Tienes otras mascotas?"
            value={formData.otrasMascotas}
            onChangeText={(text) => handleInputChange('otrasMascotas', text)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="¿Cuántas horas al día estaría solo?"
            value={formData.horasSolo}
            onChangeText={(text) => handleInputChange('horasSolo', text)}
          />
        </View>

        {/* Botón de enviar */}
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

        <Text style={styles.note}>
          * Campos obligatorios
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#dbe8d3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#4A90E2',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 15,
  },
  animalSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  animalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  animalImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  animalDetails: {
    flex: 1,
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  animalBreed: {
    fontSize: 14,
    color: '#666',
  },
  animalAge: {
    fontSize: 12,
    color: '#999',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4A90E2',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#a0c0e0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginBottom: 20,
  },
});

export default SolicitudAdopcion;