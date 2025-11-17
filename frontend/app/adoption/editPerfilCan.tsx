import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import CustomHeader from '@/src/components/UI/CustomHeader';
import { AppText } from '@/src/components/AppText';
import { Colors } from '@/src/constants/colors';

import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';

// 🔹 Listas temporales (reemplazables por tu API real)
const RAZAS = ['Pastor Alemán', 'Labrador', 'Poodle', 'Mezcla'];
const ESPECIES = ['Perro', 'Gato', 'Otros'];
const TAMANIOS = ['Pequeño', 'Mediano', 'Grande'];
const ESTADOS_SALUD = ['Sano', 'En Tratamiento', 'Crítico'];

export default function EditarPerfilCan() {
  const router = useRouter();
  const { data } = useLocalSearchParams();

  const parsedData = data ? JSON.parse(data as string) : null;

  // ---------------------------------------
  // Valores iniciales del formulario
  // ---------------------------------------
  const [formValues, setFormValues] = useState({
    nombre: parsedData?.name ?? '',
    raza: parsedData?.breed ?? '',
    especie: parsedData?.species ?? '',
    tamano: parsedData?.size ?? '',
    edad: parsedData?.age ? String(parsedData.age) : '',
    estadoSalud: parsedData?.estadoMedico ?? '',
    descripcionMedica: parsedData?.descripcionMedica ?? '',
  });

  const handleValueChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------------------------------
  // Campos del DynamicForm
  // ---------------------------------------
  const fields: FormField[] = useMemo(
    () => [
      {
        name: 'nombre',
        label: 'Nombre',
        type: 'text',
        icon: 'paw',
        placeholder: 'Nombre del animal',
      },
      {
        name: 'raza',
        label: 'Raza',
        type: 'picker',
        icon: 'list',
        options: RAZAS.map((r) => ({ label: r, value: r })),
      },
      {
        name: 'especie',
        label: 'Especie',
        type: 'picker',
        icon: 'logo-octocat',
        options: ESPECIES.map((r) => ({ label: r, value: r })),
      },
      {
        name: 'tamano',
        label: 'Tamaño',
        type: 'picker',
        icon: 'resize-outline',
        options: TAMANIOS.map((r) => ({ label: r, value: r })),
      },
      {
        name: 'edad',
        label: 'Edad (meses)',
        type: 'text',
        keyboardType: 'numeric',
        icon: 'time',
        placeholder: 'Ej: 12',
      },
      {
        name: 'estadoSalud',
        label: 'Estado de Salud',
        type: 'picker',
        icon: 'medkit',
        options: ESTADOS_SALUD.map((r) => ({ label: r, value: r })),
      },
      {
        name: 'descripcionMedica',
        label: 'Descripción Médica',
        type: 'text',
        icon: 'document-text',
        multiline: true,
        numberOfLines: 4,
        placeholder: 'Descripción del estado médico',
      },
    ],
    [],
  );

  // ---------------------------------------
  // Guardar cambios
  // ---------------------------------------
  const handleGuardar = () => {
    const updated = {
      ...parsedData,
      name: formValues.nombre,
      breed: formValues.raza,
      species: formValues.especie,
      size: formValues.tamano,
      age: formValues.edad,
      estadoMedico: formValues.estadoSalud,
      descripcionMedica: formValues.descripcionMedica,
    };

    router.push({
      pathname: '/adoption/perfilCan',
      params: { data: JSON.stringify(updated) },
    });
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Editar Perfil" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 🔹 Imagen no editable */}
        <View style={styles.imageContainer}>
          {parsedData?.imageUrl ? (
            <Image source={{ uri: parsedData.imageUrl }} style={styles.image} />
          ) : (
            <AppText>No hay imagen disponible</AppText>
          )}
        </View>

        {/* 🔹 Form dinámico */}
        <DynamicForm
          fields={fields}
          values={formValues}
          onValueChange={handleValueChange}
          onSubmit={handleGuardar}
          buttonText="Guardar Cambios"
          buttonIcon="save"
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// -----------------------------------
// Estilos
// -----------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 60,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 160,
    height: 160,
    borderRadius: 14,
    backgroundColor: '#ccc',
  },
});
