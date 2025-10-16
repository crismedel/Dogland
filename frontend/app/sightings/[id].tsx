// app/sightings/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Sighting } from '../../src/types/sighting';
import apiClient from '../../src/api/client';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

const { width } = Dimensions.get('window');

const ImageFallback = () => (
  <View style={[styles.headerImage, styles.noImagePlaceholder]}>
    <Ionicons name="image-outline" size={60} color={Colors.lightText} />
    <AppText style={styles.noImageTextLarge}>Sin Imagen Reportada</AppText>
  </View>
);

const SightingDetailScreen = () => {
  const { id } = useLocalSearchParams();
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

  // ⭐️ CORRECCIONES 3, 4, 5: Definición explícita de tipos para las props (icon, label, value)
  const DetailRow = ({
    icon,
    label,
    value,
  }: {
    icon: keyof typeof Ionicons.glyphMap | string; // Tipo para el nombre del ícono de Ionicons
    label: string;
    value: string;
  }) => (
    <View style={styles.detailRow}>
      {/* Usamos 'as any' para el nombre del ícono para evitar un error de tipo complejo con la librería */}
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
          <AppText style={styles.mainTitle}>{sighting.descripcion}</AppText>

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
                sighting.especie?.nombre ||
                `ID: ${sighting.id_especie || 'N/A'}`
              }
            />

            <DetailRow
              icon="medkit-outline"
              label="Estado de Salud"
              value={
                sighting.estadoSalud?.nombre ||
                `ID: ${sighting.id_estado_salud || 'N/A'}`
              }
            />
          </View>

          <View style={styles.infoCard}>
            <AppText style={styles.sectionTitle}>Ubicación</AppText>
            <DetailRow
              icon="location-outline"
              label="Dirección Reportada"
              value={sighting.direccion || 'Dirección no especificada'}
            />
            <DetailRow
              icon="navigate-circle-outline"
              label="Coordenadas"
              value={`Lat: ${sighting.latitude || 'N/A'}, Lon: ${
                sighting.longitude || 'N/A'
              }`}
            />
          </View>

          <View style={styles.infoCard}>
            <AppText style={styles.sectionTitle}>Descripción Completa</AppText>
            <AppText style={styles.fullDescriptionText}>
              {sighting.descripcion ||
                'No hay una descripción extendida para este avistamiento.'}
            </AppText>
          </View>
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

  // --- Header/Image Styles ---
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

  // --- Details Content Styles ---
  detailsScrollViewWrapper: { flex: 1 },
  detailsScrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: fontWeightBold,
    color: Colors.text,
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'left',
  },
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
