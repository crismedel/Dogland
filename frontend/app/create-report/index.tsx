import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Text, // Asegúrate de que Text esté importado
  TextInput,
  Pressable, // Importar Pressable si se usa
} from 'react-native';
import { useRouter } from 'expo-router';
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';
import CustomHeader from '@/src/components/UI/CustomHeader';
import {
  AppText,
  fontWeightBold,
  fontWeightMedium,
  fontWeightSemiBold,
} from '@/src/components/AppText';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import { fetchUserProfile } from '@/src/api/users';
import { useAuth } from '@/src/contexts/AuthContext';
import { fetchNotifications } from '@/src/api/notifications';
import Spinner from '@/src/components/UI/Spinner';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import apiClient from '../../src/api/client';
import { useNotification } from '@/src/components/notifications';
import { useNetInfo } from '@react-native-community/netinfo';
import { useReportSync } from '../../src/hooks/useReportSync';
import { saveReportOffline } from '../../src/utils/offlineStorage';
import DropDownPicker from 'react-native-dropdown-picker';
import CustomButton from '../../src/components/UI/CustomButton';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

const { width } = Dimensions.get('window');

interface ErrorData {
  error?: string;
  message?: string;
}

const CreateReportScreen = () => {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const router = useRouter();
  const { showError, showSuccess, showInfo, confirm } = useNotification(); // Asegurarse de tener 'confirm'

  // --- HOOKS OFFLINE ---
  const netInfo = useNetInfo();
  useReportSync();
  // --- FIN HOOKS OFFLINE ---

  // ESTADOS DEL FORMULARIO
  const [descripcion, setDescripcion] = useState('');
  const [titulo, setTitulo] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // ESTADOS DE DROPDOWN
  const [especie, setEspecie] = useState<number | null>(null);
  const [openEspecie, setOpenEspecie] = useState(false);
  const [itemsEspecie, setItemsEspecie] = useState([
    { label: 'Perro', value: 1 },
    { label: 'Gato', value: 2 },
    { label: 'Ave', value: 3 },
    { label: 'Reptil', value: 4 },
    { label: 'Otro', value: 5 },
  ]);

  const [estadoSalud, setEstadoSalud] = useState<number | null>(null);
  const [openEstadoSalud, setOpenEstadoSalud] = useState(false);
  const [itemsEstadoSalud, setItemsEstadoSalud] = useState([
    { label: 'Saludable', value: 1 },
    { label: 'Herido', value: 2 },
    { label: 'Grave', value: 3 },
  ]);

  const [estadoAvistamiento, setEstadoAvistamiento] = useState<number | null>(
    null,
  );
  const [openEstadoAvistamiento, setOpenEstadoAvistamiento] = useState(false);
  const [itemsEstadoAvistamiento, setItemsEstadoAvistamiento] = useState([
    { label: 'Salud Pública', value: 1 },
    { label: 'Seguridad', value: 2 },
    { label: 'Rescate', value: 3 },
    { label: 'Perdido', value: 4 },
  ]);

  // ESTADOS DE UBICACIÓN
  const [ubicacion, setUbicacion] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mostrarMapa, setMostrarMapa] = useState(false);

  // --- LÓGICA DE UBICACIÓN (Modificada para no usar Alert) ---
  const obtenerUbicacionActual = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      showError('Permiso Denegado', 'No se puede acceder a la ubicación.');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setUbicacion(location.coords);
    showInfo('Ubicación Obtenida', 'Se ha usado tu ubicación actual.');
  };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setUbicacion(coordinate);
    // 5. Reemplazar Alert con showInfo
    showInfo(
      'Ubicación Seleccionada',
      `Lat: ${coordinate.latitude.toFixed(4)}, Lon: ${coordinate.longitude.toFixed(
        4,
      )}`,
    );
    setMostrarMapa(false);
  };

  // --- FUNCIÓN PARA LIMPIAR EL FORMULARIO ---
  const resetForm = () => {
    setDescripcion('');
    setTitulo('');
    setImageUrl('');
    setEspecie(null);
    setEstadoSalud(null);
    setEstadoAvistamiento(null);
    setUbicacion(null);
    setLoading(false);
  };

  // --- FUNCIÓN DE ENVÍO (MODIFICADA PARA OFFLINE Y SIN ALERTS) ---
  const handleCreateReport = async () => {
    // 1. Validaciones
    if (
      !titulo ||
      !descripcion ||
      especie === null ||
      estadoSalud === null ||
      estadoAvistamiento === null ||
      !ubicacion
    ) {
      // 5. Reemplazar Alert con showError
      showError(
        'Error',
        'Todos los campos (título, descripción, selecciones y ubicación) son obligatorios.',
      );
      return;
    }

    setLoading(true);

    // 2. Pre-procesamiento de la URL
    const finalImageUrl =
      imageUrl && imageUrl.startsWith('http') ? imageUrl : null;
    if (imageUrl && !finalImageUrl) {
      showInfo(
        'Advertencia',
        'La URL de la foto no parece ser válida. El reporte se enviará sin imagen.',
      );
    }

    // 3. Preparar los datos del reporte
    const reportData = {
      id_estado_avistamiento: estadoAvistamiento,
      id_estado_salud: estadoSalud,
      id_especie: especie,
      descripcion: descripcion,
      titulo: titulo,
      ubicacion: {
        longitude: ubicacion.longitude,
        latitude: ubicacion.latitude,
      },
      direccion: 'Ubicación seleccionada en el mapa',
      url: finalImageUrl,
    };

    // 4. Lógica Offline/Online
    const isOnline = netInfo.isConnected && netInfo.isInternetReachable;

    if (isOnline) {
      // --- INTENTO DE ENVÍO ONLINE ---
      try {
        const response = await apiClient.post('/sightings', reportData);
        if (response.status === 201) {
          showSuccess('Éxito', 'Reporte creado con éxito.');
          resetForm();
          router.back();
        } else {
          showError('Error', 'Hubo un problema al crear el reporte.');
          setLoading(false);
        }
      } catch (error) {
        // El envío online falló (ej. 500 o error de red)
        console.error(
          'Error al enviar online, preguntando para guardar offline:',
          error,
        );
        setLoading(false);
        // 5. Reemplazar Alert con confirm
        confirm({
          title: 'Error de Envío',
          message:
            'No pudimos subir el reporte. ¿Quieres guardarlo para intentarlo más tarde?',
          confirmLabel: 'Guardar Offline',
          cancelLabel: 'Cancelar',
          onConfirm: async () => {
            await saveReportOffline(reportData);
            resetForm();
            router.back();
          },
        });
      }
    } else {
      // --- MODO OFFLINE (SIN CONEXIÓN) ---
      try {
        await saveReportOffline(reportData);
        showSuccess(
          'Guardado Offline',
          'Reporte guardado. Se subirá automáticamente cuando recuperes la conexión.',
        );
        resetForm();
        router.back();
      } catch (saveError) {
        showError('Error', 'No se pudo guardar el reporte localmente.');
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <CustomHeader
        title="Crear Reporte"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              // 6. Usar colores del tema (texto oscuro sobre fondo amarillo)
              style={{
                width: 24,
                height: 24,
                tintColor: isDark ? colors.lightText : colors.text,
              }}
            />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity onPress={handleCreateReport}>
            {loading ? (
              <ActivityIndicator
                size="small"
                color={isDark ? colors.lightText : colors.text} // 6. Usar colores del tema
              />
            ) : (
              <Ionicons
                name="checkmark-done-outline"
                size={22}
                color={isDark ? colors.lightText : colors.text} // 6. Usar colores del tema
              />
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <AppText style={styles.inputLabel}>Título del Reporte:</AppText>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: Perro herido en Av. Principal"
              value={titulo}
              onChangeText={setTitulo}
              placeholderTextColor={colors.darkGray} // 6. Usar colores del tema
            />
          </View>

          <View style={styles.inputContainer}>
            <AppText style={styles.inputLabel}>
              Descripción del Reporte:
            </AppText>
            <TextInput
              style={[
                styles.textInput,
                { height: 100, textAlignVertical: 'top' },
              ]}
              placeholder="Detalles sobre el estado, ubicación y otros avistamientos"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              placeholderTextColor={colors.darkGray} // 6. Usar colores del tema
            />
          </View>

          <View
            style={[
              styles.inputContainer,
              Platform.OS === 'ios' && { zIndex: 5000 },
            ]}
          >
            <AppText style={styles.inputLabel}>Especie del Animal:</AppText>
            <DropDownPicker
              open={openEspecie}
              value={especie}
              items={itemsEspecie}
              setOpen={setOpenEspecie}
              setValue={setEspecie}
              setItems={setItemsEspecie}
              placeholder="Seleccionar Especie"
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropdownContainerStyle}
              placeholderStyle={styles.dropdownPlaceholder} // 6. Usar estilos
              textStyle={styles.dropdownText} // 6. Usar estilos
              theme={isDark ? 'DARK' : 'LIGHT'}
            />
          </View>

          <View
            style={[
              styles.inputContainer,
              Platform.OS === 'ios' && { zIndex: 4000 },
            ]}
          >
            <AppText style={styles.inputLabel}>
              Estado de Salud del Animal:
            </AppText>
            <DropDownPicker
              open={openEstadoSalud}
              value={estadoSalud}
              items={itemsEstadoSalud}
              setOpen={setOpenEstadoSalud}
              setValue={setEstadoSalud}
              setItems={setItemsEstadoSalud}
              placeholder="Seleccionar Estado de Salud"
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropdownContainerStyle}
              placeholderStyle={styles.dropdownPlaceholder} // 6. Usar estilos
              textStyle={styles.dropdownText} // 6. Usar estilos
              theme={isDark ? 'DARK' : 'LIGHT'}
            />
          </View>

          <View
            style={[
              styles.inputContainer,
              Platform.OS === 'ios' && { zIndex: 3000 },
            ]}
          >
            <AppText style={styles.inputLabel}>
              Estado del Avistamiento:
            </AppText>
            <DropDownPicker
              open={openEstadoAvistamiento}
              value={estadoAvistamiento}
              items={itemsEstadoAvistamiento}
              setOpen={setOpenEstadoAvistamiento}
              setValue={setEstadoAvistamiento}
              setItems={setItemsEstadoAvistamiento}
              placeholder="Seleccionar Estado del Avistamiento"
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropdownContainerStyle}
              placeholderStyle={styles.dropdownPlaceholder} // 6. Usar estilos
              textStyle={styles.dropdownText} // 6. Usar estilos
              theme={isDark ? 'DARK' : 'LIGHT'}
            />
          </View>

          <View style={[styles.inputContainer, { zIndex: 2000 }]}>
            <AppText style={styles.inputLabel}>
              URL de la Foto (Opcional):
            </AppText>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: https://tudominio.com/foto.jpg"
              value={imageUrl}
              onChangeText={setImageUrl}
              keyboardType="url"
              autoCapitalize="none"
              placeholderTextColor={colors.darkGray} // 6. Usar colores del tema
            />
            {imageUrl.startsWith('http') && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.imagePreview}
                  onError={() =>
                    console.log('Error al cargar la URL de previsualización')
                  }
                />
              </View>
            )}
          </View>

          {/* 5. Reemplazo de Alert por botones */}
          <View style={[styles.inputContainer, { zIndex: 1000 }]}>
            <AppText style={styles.inputLabel}>Ubicación:</AppText>
            <View style={styles.locationButtonRow}>
              <CustomButton
                title="Usar Actual"
                onPress={obtenerUbicacionActual}
                icon="navigate-outline"
                style={styles.locationButton}
                textStyle={styles.locationButtonText}
                variant="secondary"
              />
              <CustomButton
                title="Seleccionar"
                onPress={() => setMostrarMapa(true)}
                icon="map-outline"
                style={styles.locationButton}
                textStyle={styles.locationButtonText}
                variant="secondary"
              />
            </View>
            {ubicacion && (
              <AppText style={styles.locationText}>
                {`Lat: ${ubicacion.latitude.toFixed(
                  4,
                )}, Lon: ${ubicacion.longitude.toFixed(4)}`}
              </AppText>
            )}
          </View>

          {mostrarMapa && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: ubicacion?.latitude || -38.7369,
                  longitude: ubicacion?.longitude || -72.5994,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onPress={handleMapPress}
              >
                {ubicacion && (
                  <Marker
                    coordinate={ubicacion}
                    title="Ubicación Seleccionada"
                  />
                )}
              </MapView>
            </View>
          )}

          <CustomButton
            title="Generar Reporte"
            onPress={handleCreateReport}
            variant="primary"
            icon="checkmark-done-outline"
            loading={loading}
            disabled={loading}
            style={{ marginTop: 10 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- ESTILOS (sin cambios, excepto por un scroll más grande) ---
// 7. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background, // Dinámico
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background, // Dinámico
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: colors.primary, // Dinámico
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 30,
      paddingBottom: 150,
    },
    formContainer: {
      width: width * 0.9,
      maxWidth: 400,
      paddingHorizontal: 20,
      backgroundColor: colors.cardBackground, // Dinámico
      borderRadius: 16,
      paddingVertical: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.1, // Dinámico
      shadowRadius: 3.84,
      elevation: 5,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: fontWeightMedium,
      color: colors.text, // Dinámico
      marginBottom: 6,
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      fontSize: 16,
      color: colors.text, // Dinámico
      backgroundColor: colors.background, // Dinámico
      justifyContent: 'center',
      minHeight: 50, // Asegurar altura mínima
    },
    dropdownStyle: {
      backgroundColor: colors.background, // Dinámico
      borderColor: colors.gray, // Dinámico
      borderRadius: 12,
    },
    dropdownContainerStyle: {
      borderColor: colors.gray, // Dinámico
      borderRadius: 12,
      marginTop: 0,
    },
    dropdownText: {
      color: colors.text, // Dinámico
    },
    dropdownPlaceholder: {
      color: colors.darkGray, // Dinámico
    },
    mapContainer: {
      width: '100%',
      height: 300,
      marginVertical: 20,
    },
    map: {
      width: '100%',
      height: '100%',
    },
    imagePreviewContainer: {
      marginTop: 15,
      borderRadius: 12,
      overflow: 'hidden',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
    },
    imagePreview: {
      width: '100%',
      height: 200,
      resizeMode: 'cover',
    },
    // 5. Nuevos estilos para los botones de ubicación
    locationButtonRow: {
      flexDirection: 'row',
      gap: 10,
      zIndex: 1000,
    },
    locationButton: {
      flex: 1,
    },
    locationButtonText: {
      fontSize: 14,
    },
    locationText: {
      textAlign: 'center',
      marginTop: 12,
      color: colors.darkGray, // Dinámico
      fontSize: 14,
    },
  });

export default CreateReportScreen;