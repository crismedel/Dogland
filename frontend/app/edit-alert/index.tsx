import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert as RNAlert,
  Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchAlertById, updateAlert } from '../../src/api/alerts';
import type { Alert as AlertTypeFromAPI } from '../../src/types/alert';

const MOCK_TIPOS_ALERTA = [
  { id: 1, nombre: 'Jauria' },
  { id: 2, nombre: 'Accidente' },
  { id: 3, nombre: 'Robo' },
  { id: 4, nombre: 'Animal Perdido' },
  { id: 5, nombre: 'Otro' },
];

const MOCK_NIVELES_RIESGO = [
  { id: 1, nombre: 'Bajo' },
  { id: 2, nombre: 'Medio' },
  { id: 3, nombre: 'Alto' },
  { id: 4, nombre: 'Crítico' },
];

export default function EditAlertScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [titulo, setTitulo] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [ubicacion, setUbicacion] = useState<string>('');

  const [tipoAlerta, setTipoAlerta] = useState<number | null>(null);
  const [nivelRiesgo, setNivelRiesgo] = useState<number | null>(null);

  const [fechaExpiracion, setFechaExpiracion] = useState<string | null>(null);
  const [activa, setActiva] = useState<boolean>(true);

  const [loading, setLoading] = useState(true);
  const [showDate, setShowDate] = useState(false);

  useEffect(() => {
    const loadAlert = async () => {
      try {
        setLoading(true);
        const alertData: AlertTypeFromAPI = await fetchAlertById(Number(id));

        setTitulo(alertData.titulo);
        setDescripcion(alertData.descripcion);
        setUbicacion(alertData.ubicacion || '');

        const tipoObj = MOCK_TIPOS_ALERTA.find(
          (t) => t.nombre === alertData.tipo,
        );
        const nivelObj = MOCK_NIVELES_RIESGO.find(
          (n) =>
            n.nombre.toLowerCase() === alertData.nivel_riesgo.toLowerCase(),
        );

        setTipoAlerta(tipoObj ? tipoObj.id : null);
        setNivelRiesgo(nivelObj ? nivelObj.id : null);

        setFechaExpiracion(alertData.fecha_expiracion || null);
        setActiva(alertData.activa);
      } catch (e) {
        RNAlert.alert('Error', 'No se pudo cargar la alerta');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    if (id) loadAlert();
  }, [id]);

  const handleSave = async () => {
    if (!tipoAlerta || !nivelRiesgo) {
      RNAlert.alert(
        'Error',
        'Debe seleccionar tipo de alerta y nivel de riesgo',
      );
      return;
    }

    const updatedData = {
      titulo,
      descripcion,
      ubicacion,
      id_tipo_alerta: tipoAlerta,
      id_nivel_riesgo: nivelRiesgo,
      fecha_expiracion: fechaExpiracion ?? undefined,
      activa,
      id_usuario: 2, // <-- Aquí agregas el id_usuario fijo
    };

    console.log('EditAlertScreen: ID de alerta a actualizar:', id);
    console.log(
      'EditAlertScreen: Datos a enviar para actualizar:',
      updatedData,
    );

    try {
      await updateAlert(Number(id), updatedData);
      RNAlert.alert('Éxito', 'Alerta actualizada');
      router.back();
    } catch (e: any) {
      console.error('EditAlertScreen: Error al actualizar alerta:', e);
      const message =
        e?.response?.data?.error || 'No se pudo actualizar la alerta';
      RNAlert.alert('Error', message);
    }
  };
  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando alerta...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.header}>Editar Alerta</Text>

      <Text style={styles.label}>Título *</Text>
      <TextInput value={titulo} onChangeText={setTitulo} style={styles.input} />

      <Text style={styles.label}>Descripción *</Text>
      <TextInput
        value={descripcion}
        onChangeText={setDescripcion}
        style={[styles.input, styles.textarea]}
        multiline
      />

      <Text style={styles.label}>Ubicación</Text>
      <TextInput
        value={ubicacion}
        onChangeText={setUbicacion}
        style={styles.input}
      />

      <Text style={styles.label}>Tipo de Alerta *</Text>
      <Picker
        selectedValue={tipoAlerta}
        onValueChange={(val) => setTipoAlerta(val)}
      >
        {MOCK_TIPOS_ALERTA.map((t) => (
          <Picker.Item key={t.id} label={t.nombre} value={t.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Nivel de Riesgo *</Text>
      <Picker
        selectedValue={nivelRiesgo}
        onValueChange={(val) => setNivelRiesgo(val)}
      >
        {MOCK_NIVELES_RIESGO.map((n) => (
          <Picker.Item key={n.id} label={n.nombre} value={n.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Fecha de Expiración</Text>
      <Button
        title={
          fechaExpiracion
            ? new Date(fechaExpiracion).toLocaleDateString()
            : 'Seleccionar fecha'
        }
        onPress={() => setShowDate(true)}
      />
      {showDate && (
        <DateTimePicker
          value={fechaExpiracion ? new Date(fechaExpiracion) : new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDate(false);
            if (date) setFechaExpiracion(date.toISOString());
          }}
        />
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 15,
        }}
      >
        <Text style={styles.label}>¿Activa?</Text>
        <Switch value={activa} onValueChange={setActiva} />
      </View>

      <Button title="Guardar Cambios" onPress={handleSave} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  contentContainer: { padding: 20 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  label: { fontWeight: '600', marginTop: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
