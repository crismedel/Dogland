// app/adoption/component/formAgregarPerrito.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

const FormAgregarPerrito = () => {
  const [form, setForm] = useState({
    nombre_animal: '',
    edad_animal: '',
    edad_aproximada: '',
    id_raza: '',
    id_especie: '',
    id_estado_salud: '',
    descripcion_estado_salud: '',
    disponible: true,
    descripcion_adopcion: '',
    diagnostico: '',
    tratamiento: '',
    foto_url: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      if (!form.nombre_animal || !form.id_especie || !form.id_raza) {
        Alert.alert('Error', 'Por favor, completa los campos obligatorios.');
        return;
      }

      const response = await fetch(
        'http://<TU_IP_O_DOMINIO>:3000/api/animals',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        },
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Animal agregado correctamente 🎉');
        setForm({
          nombre_animal: '',
          edad_animal: '',
          edad_aproximada: '',
          id_raza: '',
          id_especie: '',
          id_estado_salud: '',
          descripcion_estado_salud: '',
          disponible: true,
          descripcion_adopcion: '',
          diagnostico: '',
          tratamiento: '',
          foto_url: '',
        });
      } else {
        Alert.alert('Error', data.message || 'Error al agregar el animal');
      }
    } catch (error) {
      console.error('❌ Error en handleSubmit:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        <AppText style={styles.sectionTitle}>Información General</AppText>

        <TextInput
          style={styles.input}
          placeholder="Nombre del animal"
          value={form.nombre_animal}
          onChangeText={(text) => handleChange('nombre_animal', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Edad (en meses)"
          keyboardType="numeric"
          value={form.edad_animal}
          onChangeText={(text) => handleChange('edad_animal', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Edad aproximada (en meses)"
          keyboardType="numeric"
          value={form.edad_aproximada}
          onChangeText={(text) => handleChange('edad_aproximada', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Especie (ID o nombre)"
          value={form.id_especie}
          onChangeText={(text) => handleChange('id_especie', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Raza (ID o nombre)"
          value={form.id_raza}
          onChangeText={(text) => handleChange('id_raza', text)}
        />

        <AppText style={styles.sectionTitle}>Estado de Salud</AppText>
        <TextInput
          style={styles.input}
          placeholder="Estado de salud (ID o nombre)"
          value={form.id_estado_salud}
          onChangeText={(text) => handleChange('id_estado_salud', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Descripción de salud"
          value={form.descripcion_estado_salud}
          onChangeText={(text) =>
            handleChange('descripcion_estado_salud', text)
          }
        />

        <AppText style={styles.sectionTitle}>Adopción</AppText>
        <TextInput
          style={styles.input}
          placeholder="Descripción para adopción"
          value={form.descripcion_adopcion}
          onChangeText={(text) => handleChange('descripcion_adopcion', text)}
        />

        <AppText style={styles.sectionTitle}>Historial Médico</AppText>
        <TextInput
          style={styles.input}
          placeholder="Diagnóstico"
          value={form.diagnostico}
          onChangeText={(text) => handleChange('diagnostico', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Tratamiento"
          value={form.tratamiento}
          onChangeText={(text) => handleChange('tratamiento', text)}
        />

        <AppText style={styles.sectionTitle}>Fotografía</AppText>
        <TextInput
          style={styles.input}
          placeholder="URL de la imagen"
          value={form.foto_url}
          onChangeText={(text) => handleChange('foto_url', text)}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <AppText style={styles.buttonText}>Guardar Perrito</AppText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: fontWeightBold,
    marginTop: 15,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f4f6f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: fontWeightBold,
    fontSize: 16,
  },
});

export default FormAgregarPerrito;
