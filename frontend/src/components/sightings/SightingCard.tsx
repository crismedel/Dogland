import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Sighting } from '../../types/sighting';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors'; 

interface SightingCardProps {
  sighting: Sighting;
  onDeleteSuccess?: (id: number) => void;
}

const SightingCard: React.FC<SightingCardProps> = ({ sighting, onDeleteSuccess }) => {
  const router = useRouter();

  const riskLabel = 'Desconocido';

  const handlePressSighting = (sightingId: number) => {
    router.push({
      pathname: '/sightings/[id]',
      params: { id: sightingId.toString() },
    });
  };

  const handleDelete = () => {
    console.log('Eliminando avistamiento ID:', sighting.id_avistamiento);
    if (onDeleteSuccess) onDeleteSuccess(sighting.id_avistamiento);
  };

  const renderImage = () => {
    if (sighting.fotos_url && sighting.fotos_url.length > 0) {
      const imageUrl = sighting.fotos_url[0];
      return (
        <View style={styles.imageContainer}>
          <Text style={styles.imageText}>Imagen cargada</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.imageContainer}>
          <Text style={styles.noImageText}>Sin imagen disponible</Text>
        </View>
      );
    }
  };

  return (
    <TouchableOpacity
      onPress={() => handlePressSighting(sighting.id_avistamiento)}
      style={[styles.card, !sighting.activa && styles.archivedCard]}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{sighting.descripcion}</Text>
        <View style={styles.actions}>
          {/* Usamos Colors.danger para el ícono de eliminar */}
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.badgeContainer}>
        <Text style={styles.riskText}>{riskLabel}</Text>
      </View>

      <Text style={styles.description}>{sighting.descripcion}</Text>

      <View style={styles.alertInfo}>
        <Text style={styles.date}>
          📅 {new Date(sighting.fecha_creacion).toLocaleDateString()}
        </Text>

        {renderImage()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.lightText, // Blanco
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: Colors.primary, 
  },
  archivedCard: {
    opacity: 0.7,
    backgroundColor: Colors.background, // Fondo claro para archivados
    borderLeftColor: Colors.gray,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text, // Texto principal oscuro
    flex: 1,
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  riskText: {
    fontSize: 14,
    color: Colors.darkGray, // Gris oscuro
    fontStyle: 'italic',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    marginVertical: 8,
    color: Colors.text, // Texto principal
    lineHeight: 20,
  },
  alertInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  date: {
    fontSize: 12,
    color: Colors.darkGray, // Gris oscuro
  },
  imageContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray, // Gris claro para el fondo de imagen
    borderRadius: 8,
    marginTop: 8,
  },
  imageText: {
    fontSize: 14,
    color: Colors.text,
  },
  noImageText: {
    fontSize: 14,
    color: Colors.darkGray,
    textAlign: 'center',
  },
});

export default SightingCard;