// /app/adoption/solicitudAdopcion.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Image, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import TarjetaSoli from './component/tarjetaSoli';

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
    // Simulación de carga de datos del usuario autenticado
    setFormData(prev => ({
      ...prev,
      nombreSolicitante: '',
      email: '',
    }));
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.nombreSolicitante ||
      !formData.email ||
      !formData.telefono ||
      !formData.direccion ||
      !formData.motivoAdopcion
    ) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // simulación API
      Alert.alert(
        '¡Solicitud Enviada!',
        `Tu solicitud para adoptar a ${formData.nombreAnimal} ha sido enviada correctamente.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('Error', 'No se pudo enviar la solicitud. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Header con estilo igual que index.tsx */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonHeader} onPress={() => router.back()}>
          <Image source={require('../../assets/images/volver.png')} style={styles.backIconHeader} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Solicitud de Adopción</Text>

        {/* Espaciador para centrar título */}
        <View style={{ width: 24 }} />
      </View>

      {/* Tarjeta con formulario (componente separado) */}
      <TarjetaSoli
        formData={formData}
        loading={loading}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        imageUrl={params.imageUrl as string}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 20,
  },
  backButtonHeader: { padding: 6 },
  backIconHeader: { width: 24, height: 24, tintColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center', flex: 1 },
});

export default SolicitudAdopcion;
