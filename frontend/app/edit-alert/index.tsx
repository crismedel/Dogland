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
import type { Alert, AlertType, RiskLevel } from '../../src/features/types'; // 👈 tu archivo de tipos

export default function EditAlertScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [titulo, setTitulo] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [ubicacion, setUbicacion] = useState<string>('');

  const [tipoAlerta, setTipoAlerta] = useState<AlertType | null>(null);
  const [nivelRiesgo, setNivelRiesgo] = useState<RiskLevel | null>(null);

  const [fechaExpiracion, setFechaExpiracion] = useState<string | null>(null); // 👈 string | null
  const [activa, setActiva] = useState<boolean>(true);

  const [loading, setLoading] = useState(true);
  const [showDate, setShowDate] = useState(false);

  // Opciones fijas
  const tiposAlerta: AlertType[] = [
    'Jauria',
    'Accidente',
    'Robo',
    'Animal Perdido',
    'Otro',
  ];
  const nivelesRiesgo: RiskLevel[] = ['Bajo', 'Medio', 'Alto', 'Critico'];

  useEffect(() => {
    const loadAlert = async () => {
      try {
        setLoading(true);
        const alertData: Alert = await fetchAlertById(Number(id));

        setTitulo(alertData.titulo);
        setDescripcion(alertData.descripcion);
        setUbicacion(alertData.ubicacion || '');
        setTipoAlerta(alertData.tipo);
        setNivelRiesgo(alertData.nivel_riesgo);
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
    try {
      await updateAlert(Number(id), {
        titulo,
        descripcion,
        ubicacion,
        tipo: tipoAlerta!,
        nivel_riesgo: nivelRiesgo!,
        fecha_expiracion: fechaExpiracion,
        activa,
      });
      RNAlert.alert('Éxito', 'Alerta actualizada');
      router.back();
    } catch (e) {
      RNAlert.alert('Error', 'No se pudo actualizar la alerta');
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

      {/* Tipo de alerta */}
      <Text style={styles.label}>Tipo de Alerta *</Text>
      <Picker
        selectedValue={tipoAlerta}
        onValueChange={(val) => setTipoAlerta(val)}
      >
        {tiposAlerta.map((t) => (
          <Picker.Item key={t} label={t} value={t} />
        ))}
      </Picker>

      {/* Nivel de Riesgo */}
      <Text style={styles.label}>Nivel de Riesgo *</Text>
      <Picker
        selectedValue={nivelRiesgo}
        onValueChange={(val) => setNivelRiesgo(val)}
      >
        {nivelesRiesgo.map((r) => (
          <Picker.Item key={r} label={r} value={r} />
        ))}
      </Picker>

      {/* Fecha Expiración (string <-> Date) */}
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
            if (date) setFechaExpiracion(date.toISOString()); // guarda como string ISO
          }}
        />
      )}

      {/* Activa */}
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
