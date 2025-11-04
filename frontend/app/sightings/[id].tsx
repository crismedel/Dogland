import {
  AppText,
  fontWeightBold,
  fontWeightMedium,
  fontWeightSemiBold,
} from '@/src/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router'; // 🚨 Importar useRouter
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import apiClient from '../../src/api/client';
import { Colors } from '../../src/constants/colors';
import { Sighting } from '../../src/types/sighting';

const { width } = Dimensions.get('window');

// 🚨 Asumo que la interfaz Sighting incluye los nombres (si no, el backend debe enviarlos)
// Si el backend solo envía IDs, esta pantalla ya debería estar usando
// las funciones de ayuda (ej. obtenerNombreEspecie) para mostrar los nombres.

const ImageFallback = () => (
  <View style={[styles.headerImage, styles.noImagePlaceholder]}>
    <Ionicons name="image-outline" size={60} color={Colors.lightText} />
    <AppText style={styles.noImageTextLarge}>Sin Imagen Reportada</AppText>
  </View>
);

const SightingDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter(); // 🚨 Hook de router
  const [sighting, setSighting] = useState<Sighting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSightingDetails = async () => {
      try {
        if (!id) {
          setError('ID de avistamiento no proporcionado.');
          return;
        }
        const response = await apiClient.get(`/sightings/${id}`);
        setSighting(response.data.data);
      } catch (err) {
        console.error('Error fetching sighting details:', err);
        Alert.alert(
          'Error',
          'No se pudo cargar la información del avistamiento.',
        );
        setError('No se pudo cargar la información del avistamiento.');
      } finally {
        setLoading(false);
      }
    };

    fetchSightingDetails();
  }, [id]);

  // 🚨 Función para navegar a la pantalla de edición
  const handleEdit = () => {
    // Navegar a la nueva pantalla de edición, pasando el ID
    router.push(`/sightings/edit/${id}`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <AppText style={styles.text}>Cargando detalles...</AppText>
      </View>
    );
  }

  if (error || !sighting) {
    return (
      <View style={styles.centered}>
        <AppText style={styles.errorText}>
          {error || 'Avistamiento no encontrado.'}
        </AppText>
      </View>
    );
  }

  const primaryImageUrl =
    sighting.fotos_url && sighting.fotos_url.length > 0
      ? sighting.fotos_url[0]
      : null;

  const showPlaceholder = !primaryImageUrl;

  const DetailRow = ({
    icon,
    label,
    value,
  }: {
    icon: keyof typeof Ionicons.glyphMap | string;
    label: string;
    value: string;
  }) => (
    <View style={styles.detailRow}>
      <Ionicons
        name={icon as any}
        size={20}
        color={Colors.darkGray}
        style={styles.detailIcon}
      />
      <View>
        <AppText style={styles.label}>{label}</AppText>
        <AppText style={styles.value}>{value}</AppText>
      </View>
    </View>
  );

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.text} />

      {/* 📸 SECCIÓN DE LA IMAGEN */}
      <View style={styles.imageHeaderContainer}>
        {showPlaceholder ? (
          <ImageFallback />
        ) : (
          <Image source={{ uri: primaryImageUrl }} style={styles.headerImage} />
        )}
      </View>

      <SafeAreaView style={styles.detailsScrollViewWrapper}>
        <ScrollView contentContainerStyle={styles.detailsScrollViewContent}>
          
          {/* 🚨 Contenedor del Título + Botón de Editar */}
          <View style={styles.titleContainer}>
            <AppText style={styles.mainTitle}>{sighting.descripcion}</AppText>
            {/* NOTA: Este botón se mostrará siempre. 
              La lógica de permisos que implementamos en el backend (Propietario o Admin) 
              se encargará de rechazar la edición si el usuario no tiene permisos.
            */}
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
                <Ionicons name="pencil-outline" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* ... (El resto de tus infoCard y DetailRow se mantiene igual) ... */}
          <View style={styles.infoCard}>
            <AppText style={styles.sectionTitle}>Información Clave</AppText>
            <DetailRow
              icon="calendar-outline"
              label="Fecha de Creación"
              value={new Date(sighting.fecha_creacion).toLocaleDateString()}
            />
            <DetailRow
              icon="bug-outline"
              label="Especie"
              value={
                // Asumiendo que el backend envía los nombres como en 'createSighting'
                (sighting as any).nombre_especie || 
                `ID: ${sighting.id_especie || 'N/A'}`
              }
            />
            <DetailRow
              icon="medkit-outline"
              label="Estado de Salud"
              value={
                (sighting as any).estado_salud ||
                `ID: ${sighting.id_estado_salud || 'N/A'}`
              }
            />
          </View>
          {/* ... (Resto de las infoCards) ... */}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // ... (tus estilos centered, text, errorText, etc.)
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightText,
  },
  text: { fontSize: 16, color: Colors.darkGray, marginTop: 10 },
  errorText: {
    fontSize: 18,
    color: Colors.danger,
    textAlign: 'center',
    fontWeight: fontWeightBold,
  },
  imageHeaderContainer: {
    width: width,
    height: width * 0.6,
    backgroundColor: Colors.text,
    marginBottom: -20,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.text,
  },
  noImageTextLarge: {
    color: Colors.lightText,
    fontSize: 18,
    marginTop: 10,
    fontWeight: '500',
  },
  detailsScrollViewWrapper: { flex: 1 },
  detailsScrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  // 🚨 NUEVOS ESTILOS
  titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 20,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: fontWeightBold,
    color: Colors.text,
    flex: 1, // Permite que el texto se ajuste
    marginRight: 10, // Espacio para el botón
  },
  editButton: {
      padding: 8,
  },
  // 🚨 FIN NUEVOS ESTILOS
  infoCard: {
    backgroundColor: Colors.lightText,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: fontWeightSemiBold,
    color: Colors.text,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
    paddingBottom: 8,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  detailIcon: { marginRight: 15 },
  label: {
    fontSize: 14,
    fontWeight: fontWeightMedium,
    color: Colors.darkGray,
  },
  value: { fontSize: 16, color: Colors.text, marginTop: 2, flexShrink: 1 },
  fullDescriptionText: { fontSize: 16, color: Colors.text, lineHeight: 24 },
});

export default SightingDetailScreen;