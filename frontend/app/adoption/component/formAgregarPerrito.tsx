import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { fontWeightBold, AppText } from '@/src/components/AppText';

// 👇 Importamos desde los archivos con los nuevos nombres
import { fetchRaces } from '@/src/api/razaAnimalesAdop';
import { fetchHealthStates } from '@/src/api/historialMedicoAdopt';
import { createFullAnimal } from '@/src/api/envioAnimalesAdop';

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
       {/* ... Tu JSX del formulario (no necesita cambios) ... */}
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