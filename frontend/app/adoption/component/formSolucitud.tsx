import React from 'react';
import { View, StyleSheet } from 'react-native';
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';

// 🔹 Props que recibe el formulario
interface FormSolicitudProps {
  formValues: any;
  onValueChange: (name: string, value: any) => void;
  raza: any[];
  especie: any[];
  estadoSalud: any[];
  onSubmit: () => void;
  isSubmitting: boolean;
}

const FormSolicitud: React.FC<FormSolicitudProps> = ({
  formValues,
  onValueChange,
  raza,
  especie,
  estadoSalud,
  onSubmit,
  isSubmitting,
}) => {

  // 🧩 Lista de campos del formulario
  const formFields: FormField[] = [
    // 🐾 Campo: Nombre del animal
    {
      name: 'nombre_animal',
      label: 'Nombre del Animal',
      type: 'text',
      placeholder: 'Ingresa el nombre del animal',
    },

    // 🐾 Campo: Edad del animal
    {
      name: 'edad_animal',
      label: 'Edad (en meses)',
      type: 'phone',
      placeholder: 'Ej: 12',
      keyboardType: 'numeric',
    },

    // 🧠 Sección: Estado de salud del animal
    {
      name: 'id_estado_salud',
      label: 'Estado de Salud',
      type: 'picker', // Menú desplegable
      placeholder: 'Selecciona el estado de salud',
      options: [
        { label: 'Selecciona un estado...', value: null },
        ...estadoSalud.map((estado) => ({
          label: estado.estado_salud,
          value: estado.id_estado_salud,
        })),
      ],
    },

    // 🧬 Sección: Especie
    {
      name: 'id_especie',
      label: 'Especie',
      type: 'picker',
      placeholder: 'Selecciona la especie',
      options: [
        { label: 'Selecciona una especie...', value: null },
        ...especie.map((esp) => ({
          label: esp.nombre_especie,
          value: esp.id_especie,
        })),
      ],
    },

    // 🐕 Sección: Raza (depende de la especie seleccionada)
    {
      name: 'id_raza',
      label: 'Raza',
      type: 'picker',
      placeholder: 'Selecciona la raza',
      options: [
        {
          label: formValues.id_especie
            ? 'Selecciona una raza...'
            : 'Primero selecciona una especie',
          value: null,
        },
        ...raza.map((r) => ({
          label: r.nombre_raza,
          value: r.id_raza,
        })),
      ],
    },
  ];

  // 🔹 Render principal del formulario dinámico
  return (
    <View style={styles.container}>
      <DynamicForm
        // Campos definidos arriba
        fields={formFields}
        // Valores actuales del formulario
        values={formValues}
        // Función para actualizar valores
        onValueChange={onValueChange}
        // Acción al presionar el botón de enviar
        onSubmit={onSubmit}
        // Texto y configuración del botón
        buttonText="Crear Adopción"
        buttonIcon="checkmark-circle-outline"
        // Estado de carga
        loading={isSubmitting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
});

export default FormSolicitud;
