import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView, // Importar ScrollView (aunque no se usa, estaba en el original)
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import TarjetaSoli from './component/tarjetaSoli';
import CustomHeader from '@/src/components/UI/CustomHeader';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import { useNotification } from '@/src/components/notifications';
// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';
import { FormField } from '@/src/components/UI/DynamicForm'; // Importa FormField

const SolicitudAdopcion = () => {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
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

  const handleValueChange = (field: string, value: string) => {
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

  // Definición de campos para DynamicForm
  const fields: FormField[] = [
    {
      name: 'nombreSolicitante',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Nombre',
      maxLength: 50,
      required: true,
    },
    {
      name: 'apellidoSolicitante',
      label: 'Apellido',
      type: 'text',
      placeholder: 'Apellido',
      maxLength: 50,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Email',
      keyboardType: 'email-address',
      required: true,
    },
    {
      name: 'telefono',
      label: 'Teléfono',
      type: 'phone',
      placeholder: 'Teléfono',
      keyboardType: 'phone-pad',
      required: true,
    },
    {
      name: 'direccion',
      label: 'Dirección completa',
      type: 'text',
      placeholder: 'Dirección completa',
      required: true,
    },
    { name: 'ciudad', label: 'Ciudad', type: 'text', placeholder: 'Ciudad' },
    {
      name: 'motivoAdopcion',
      label: '¿Por qué quieres adoptar?',
      type: 'text',
      placeholder: '¿Qué te motivó?',
      multiline: true,
      numberOfLines: 4,
      required: true,
    },
    {
      name: 'viviendaPropia',
      label: '¿Es vivienda propia o alquilada?',
      type: 'text',
      placeholder: '¿Es vivienda propia o alquilada?',
    },
    {
      name: 'espacioExterior',
      label: '¿Tienes espacio exterior?',
      type: 'text',
      placeholder: '¿Tienes espacio exterior?',
    },
    {
      name: 'otrasMascotas',
      label: '¿Tienes otras mascotas?',
      type: 'text',
      placeholder: '¿Tienes otras mascotas?',
    },
  ];

  return (
    <View style={styles.screen}>
      {/* Header */}
      <CustomHeader
        title="Solicitud de Adopción"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              // 4. Usar colores del tema (texto oscuro sobre fondo amarillo)
              style={{
                width: 24,
                height: 24,
                tintColor: isDark ? colors.lightText : colors.text,
              }}
            />
          </TouchableOpacity>
        }
      />

      {/* Tarjeta con formulario dinámico */}
      <TarjetaSoli
        formData={formData}
        loading={loading}
        handleValueChange={handleValueChange}
        handleSubmit={handleSubmit}
        imageUrl={params.imageUrl as string}
        fields={fields} // Aquí pasamos los campos
      />
    </View>
  );
};

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background, // Dinámico
    },
  });

export default SolicitudAdopcion;
