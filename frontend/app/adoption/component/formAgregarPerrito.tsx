import { AppText, fontWeightBold } from '@/src/components/AppText';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// 👇 Importamos desde los archivos con los nuevos nombres
import { createFullAnimal } from '@/src/api/envioAnimalesAdop';
import { fetchHealthStates } from '@/src/api/historialMedicoAdopt';
import { fetchRaces } from '@/src/api/razaAnimalesAdop';

const initialState = {
  nombre_animal: '',
  edad_animal: '',
  size: '',
  id_raza: '',
  id_estado_salud: '',
  descripcion_adopcion: '',
  foto_url: '',
  historial_medico: {
    diagnostico: '',
    tratamiento: '',
    fecha_examen: new Date().toISOString().split('T')[0],
  },
};

const FormAgregarPerrito = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [razas, setRazas] = useState<any[]>([]);
  const [estadosSalud, setEstadosSalud] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [racesData, healthStatesData] = await Promise.all([
          fetchRaces(),
          fetchHealthStates(),
        ]);
        setRazas(racesData);
        setEstadosSalud(healthStatesData);
      } catch (error) {
        console.error('Error cargando opciones:', error);
        Alert.alert('Error de Carga', 'No se pudieron obtener los datos. Revisa la consola o el estado del servidor.');
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  const handleChange = (field: string, value: any) => {
    if (field.startsWith('historial_medico.')) {
      const subField = field.split('.')[1];
      setForm(prevForm => ({ ...prevForm, historial_medico: { ...prevForm.historial_medico, [subField]: value } }));
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const handleSubmit = async () => {
    if (!form.nombre_animal || !form.id_raza || !form.id_estado_salud || !form.size) {
      Alert.alert('Campos Incompletos', 'Por favor, completa la información general del animal marcada con *.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        edad_animal: form.edad_animal ? parseInt(form.edad_animal, 10) : null,
      };
      const response = await createFullAnimal(payload);

      if (response.success) {
        Alert.alert('¡Éxito!', 'Animal agregado correctamente 🎉');
        setForm(initialState);
      } else {
        Alert.alert('Error al Guardar', response.message || 'Ocurrió un error en el servidor.');
      }
    } catch (error: any) {
      console.error('❌ Error en handleSubmit:', error);
      Alert.alert('Error de Conexión', error.message || 'No se pudo contactar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingOptions) {
    return <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 50 }} />;
  }

  // El JSX y los estilos se mantienen exactamente igual
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
      <AppText style={styles.sectionTitle}>Información General</AppText>

      <TextInput
        style={styles.input}
        placeholder="Nombre del animal *"
        value={form.nombre_animal}
        onChangeText={(text) => handleChange('nombre_animal', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Edad (meses)"
        keyboardType="numeric"
        value={form.edad_animal}
        onChangeText={(text) => handleChange('edad_animal', text)}
      />

      {/* Picker de raza */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={form.id_raza}
          onValueChange={(value) => handleChange('id_raza', value)}
        >
          <Picker.Item label="Selecciona raza *" value="" />
          {razas.map((raza) => (
            <Picker.Item key={raza.id_raza} label={raza.nombre_raza} value={raza.id_raza} />
          ))}
        </Picker>
      </View>
        
      {/* Picker de estado de salud */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={form.id_estado_salud}
          onValueChange={(value) => handleChange('id_estado_salud', value)}
        >
          <Picker.Item label="Selecciona estado de salud *" value="" />
          {estadosSalud.map((estado) => (
            <Picker.Item key={estado.id_estado_salud} label={estado.nombre_estado} value={estado.id_estado_salud} />
          ))}
        </Picker>
      </View>
        
      <TextInput
        style={styles.textArea}
        placeholder="Descripción de adopción"
        multiline
        value={form.descripcion_adopcion}
        onChangeText={(text) => handleChange('descripcion_adopcion', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="URL de la foto"
        value={form.foto_url}
        onChangeText={(text) => handleChange('foto_url', text)}
      />

      <AppText style={styles.sectionTitle}>Historial Médico</AppText>
        
      <TextInput
        style={styles.input}
        placeholder="Diagnóstico"
        value={form.historial_medico.diagnostico}
        onChangeText={(text) => handleChange('historial_medico.diagnostico', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Tratamiento"
        value={form.historial_medico.tratamiento}
        onChangeText={(text) => handleChange('historial_medico.tratamiento', text)}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <AppText style={styles.buttonText}>
          {loading ? 'Guardando...' : 'Guardar'}
        </AppText>
      </TouchableOpacity>
    </View>
        
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  scroll: { 
    padding: 16, 
    backgroundColor: '#f0f4f8' 
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 20, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: fontWeightBold, 
    marginTop: 20, 
    marginBottom: 12, 
    color: '#333', 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
    paddingBottom: 6, 
  },
  input: { 
    backgroundColor: '#f9f9f9', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    fontSize: 16, 
  },
  pickerContainer: { 
    backgroundColor: '#f9f9f9', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    marginBottom: 12, 
    justifyContent: 'center', 
  },
  textArea: { 
    backgroundColor: '#f9f9f9', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    fontSize: 16, 
    height: 100, 
    textAlignVertical: 'top', 
  },
  button: { 
    backgroundColor: '#1976d2', 
    paddingVertical: 14, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 20, 
  },
  buttonDisabled: { 
    backgroundColor: '#a0c0e0', 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: fontWeightBold, 
    fontSize: 16, 
  },
});

export default FormAgregarPerrito;