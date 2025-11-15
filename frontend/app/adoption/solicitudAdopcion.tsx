import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  AppText,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import TarjetaSoli from './component/tarjetaSoli';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { Colors } from '@/src/constants/colors';

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
    setFormData((prev) => ({
      ...prev,
      nombreSolicitante: '',
      email: '',
    }));
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
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
      await new Promise((resolve) => setTimeout(resolve, 2000)); // simulación API
      Alert.alert(
        '¡Solicitud Enviada!',
        `Tu solicitud para adoptar a ${formData.nombreAnimal} ha sido enviada correctamente.`,
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch {
      Alert.alert(
        'Error',
        'No se pudo enviar la solicitud. Intenta nuevamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <CustomHeader
        title="Solicitud de Adopción"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              style={{ width: 24, height: 24, tintColor: '#fff' }}
            />
          </TouchableOpacity>
        }
      />

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
    backgroundColor: Colors.background,
  },
});

export default SolicitudAdopcion;
