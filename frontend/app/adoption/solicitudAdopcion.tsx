import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import TarjetaSoli from './component/tarjetaSoli';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { Colors } from '@/src/constants/colors';
import { useNotification } from '@/src/components/notifications';

const SolicitudAdopcion = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { showError, showSuccess, confirm } = useNotification();

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
      showError(
        'Campos incompletos',
        'Por favor completa todos los campos obligatorios',
      );
      return;
    }

    confirm({
      title: 'Confirmar Envío',
      message: `¿Deseas enviar la solicitud para adoptar a ${formData.nombreAnimal}?`,
      confirmLabel: 'Enviar',
      cancelLabel: 'Cancelar',
      destructive: false,
      onConfirm: async () => {
        setLoading(true);
        try {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // simulación API

          showSuccess(
            '¡Solicitud Enviada!',
            `Tu solicitud para adoptar a ${formData.nombreAnimal} ha sido enviada correctamente.`,
          );

          router.back(); // se vuelve atrás automáticamente
        } catch {
          showError(
            'Error',
            'No se pudo enviar la solicitud. Intenta nuevamente.',
          );
        } finally {
          setLoading(false);
        }
      },
    });
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

      {/* Tarjeta con formulario */}
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
