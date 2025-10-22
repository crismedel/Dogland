// app/adoption/component/Formulario.tsx
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

// 🔹 Estado inicial del formulario, con la estructura que necesita el backend
const initialState = {
  nombre_animal: '',
  edad_animal: '',
  size: '', // Campo requerido
  id_raza: '',
  id_estado_salud: '',
  descripcion_adopcion: '',
  foto_url: '',
  historial_medico: { // Objeto anidado para el historial
    diagnostico: '',
    tratamiento: '',
    fecha_examen: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
  },
};

const formAgregarPerrito = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  
  // 🔹 Estados para guardar las listas de opciones que vendrán de la API
  const [razas, setRazas] = useState<any[]>([]);
  const [estadosSalud, setEstadosSalud] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // 🔹 useEffect para cargar las razas y estados de salud desde el backend
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // NOTA: Reemplaza <TU_IP_O_DOMINIO> por la IP de tu servidor backend
        // Asegúrate de que tienes rutas GET para /races y /health-states
        const [razasRes, estadosSaludRes] = await Promise.all([
          fetch('http://<TU_IP_O_DOMINIO>:3000/api/races'),
          fetch('http://<TU_IP_O_DOMINIO>:3000/api/health-states'),
        ]);

        const razasData = await razasRes.json();
        const estadosSaludData = await estadosSaludRes.json();

        if (razasData.success) setRazas(razasData.data);
        if (estadosSaludData.success) setEstadosSalud(estadosSaludData.data);

      } catch (error) {
        console.error('Error cargando opciones:', error);
        Alert.alert('Error de Carga', 'No se pudieron obtener los datos para el formulario.');
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  // 🔹 Manejador de cambios que funciona con campos simples y anidados
  const handleChange = (field: string, value: any) => {
    if (field.startsWith('historial_medico.')) {
      const subField = field.split('.')[1];
      setForm(prevForm => ({
        ...prevForm,
        historial_medico: {
          ...prevForm.historial_medico,
          [subField]: value,
        },
      }));
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
      const response = await fetch('http://<TU_IP_O_DOMINIO>:3000/api/full-animal', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer <TU_TOKEN_JWT>',
        },
        body: JSON.stringify({
          ...form,
          edad_animal: form.edad_animal ? parseInt(form.edad_animal, 10) : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('¡Éxito!', 'Animal agregado correctamente 🎉');
        setForm(initialState);
      } else {
        Alert.alert('Error al Guardar', data.message || 'Ocurrió un error en el servidor.');
      }
    } catch (error) {
      console.error('❌ Error en handleSubmit:', error);
      Alert.alert('Error de Conexión', 'No se pudo contactar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingOptions) {
    return <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 50 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        {/* ... (Aquí va todo el JSX del formulario como lo teníamos antes) ... */}
        <AppText style={styles.sectionTitle}>Información General</AppText>

        <TextInput style={styles.input} placeholder="Nombre del animal *" value={form.nombre_animal} onChangeText={(text) => handleChange('nombre_animal', text)} />
        <TextInput style={styles.input} placeholder="Edad (en meses)" keyboardType="numeric" value={form.edad_animal} onChangeText={(text) => handleChange('edad_animal', text)} />
        
        <View style={styles.pickerContainer}>
          <Picker selectedValue={form.size} onValueChange={(itemValue) => handleChange('size', itemValue)}>
            <Picker.Item label="Selecciona un tamaño... *" value="" />
            <Picker.Item label="Pequeño" value="Pequeño" />
            <Picker.Item label="Mediano" value="Mediano" />
            <Picker.Item label="Grande" value="Grande" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker selectedValue={form.id_estado_salud} onValueChange={(itemValue) => handleChange('id_estado_salud', itemValue)}>
            <Picker.Item label="Selecciona el estado de salud... *" value="" />
            {estadosSalud.map((estado) => (<Picker.Item key={estado.id_estado_salud} label={estado.estado_salud} value={estado.id_estado_salud} />))}
          </Picker>
        </View>
        
        <View style={styles.pickerContainer}>
          <Picker selectedValue={form.id_raza} onValueChange={(itemValue) => handleChange('id_raza', itemValue)}>
            <Picker.Item label="Selecciona la raza... *" value="" />
            {razas.map((raza) => (<Picker.Item key={raza.id_raza} label={raza.nombre_raza} value={raza.id_raza} />))}
          </Picker>
        </View>

        <AppText style={styles.sectionTitle}>Adopción</AppText>
        <TextInput style={styles.textArea} placeholder="Describe su historia, personalidad, etc." multiline numberOfLines={4} value={form.descripcion_adopcion} onChangeText={(text) => handleChange('descripcion_adopcion', text)} />

        <AppText style={styles.sectionTitle}>Primer Historial Médico</AppText>
        <TextInput style={styles.input} placeholder="Diagnóstico inicial" value={form.historial_medico.diagnostico} onChangeText={(text) => handleChange('historial_medico.diagnostico', text)} />
        <TextInput style={styles.input} placeholder="Tratamiento inicial" value={form.historial_medico.tratamiento} onChangeText={(text) => handleChange('historial_medico.tratamiento', text)} />
        <TextInput style={styles.input} placeholder="Fecha de examen (YYYY-MM-DD)" value={form.historial_medico.fecha_examen} onChangeText={(text) => handleChange('historial_medico.fecha_examen', text)} />

        <AppText style={styles.sectionTitle}>Fotografía</AppText>
        <TextInput style={styles.input} placeholder="URL de la imagen principal" value={form.foto_url} onChangeText={(text) => handleChange('foto_url', text)} autoCapitalize="none" />

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <AppText style={styles.buttonText}>Guardar Animal</AppText>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// ... (Aquí van todos los estilos como los teníamos antes) ...
const styles = StyleSheet.create({
  scroll: { padding: 16, backgroundColor: '#f0f4f8' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, },
  sectionTitle: { fontSize: 18, fontWeight: fontWeightBold, marginTop: 20, marginBottom: 12, color: '#333', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 6, },
  input: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#ddd', fontSize: 16, },
  pickerContainer: { backgroundColor: '#f9f9f9', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 12, justifyContent: 'center', },
  textArea: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#ddd', fontSize: 16, height: 100, textAlignVertical: 'top', },
  button: { backgroundColor: '#1976d2', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20, },
  buttonDisabled: { backgroundColor: '#a0c0e0', },
  buttonText: { color: '#fff', fontWeight: fontWeightBold, fontSize: 16, },
});

export default formAgregarPerrito;