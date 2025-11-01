import React, { useState } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useProfilePhoto } from '../../utils/useProfilePhoto';
import { AppText } from '../AppText';
import { fontWeightMedium } from '../AppText';
import CustomButton from './CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '@/src/components/notifications/NotificationContext';
import { useRefresh } from '@/src/contexts/RefreshContext';
import { REFRESH_KEYS } from '@/src/constants/refreshKeys';

type Props = {
  userId: number;
  onUploadSuccess?: () => void;
};

export default function ProfileImagePicker({ userId, onUploadSuccess }: Props) {
  const { photoUrl, loading, uploading, uploadPhoto, deletePhoto } =
    useProfilePhoto(userId);
  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const { showError, confirm, showInfo } = useNotification();
  const { triggerRefresh } = useRefresh();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showInfo(
        'Permiso requerido',
        'Se necesita acceso a tu galería para seleccionar imágenes.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setSelectedUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!selectedUri) {
      showError('Falta imagen', 'Primero selecciona una imagen.');
      return;
    }

    const success = await uploadPhoto(selectedUri);

    if (success) {
      setSelectedUri(null);

      // Disparar evento global para actualizar foto en otras pantallas
      triggerRefresh(REFRESH_KEYS.USER_PHOTO);

      // Opcional: notificar al padre para que cierre el sheet / actualice inmediatamente
      setTimeout(() => {
        onUploadSuccess?.();
      }, 300);
    }
  };

  const handleDelete = async () => {
    confirm({
      title: 'Eliminar foto',
      message: '¿Estás seguro de eliminar tu foto de perfil?',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      destructive: true,
      onConfirm: async () => {
        const success = await deletePhoto();
        if (success) {
          setSelectedUri(null);

          // Disparar refresh global
          triggerRefresh(REFRESH_KEYS.USER_PHOTO);

          // Notificar al padre
          onUploadSuccess?.();
        }
      },
    });
  };

  const displayUri = selectedUri || photoUrl;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#CC5803" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.imagePreviewContainer}>
        {displayUri ? (
          <Image source={{ uri: displayUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera" size={30} color="#374151" />
            <AppText style={styles.placeholderText}>Sin foto</AppText>
          </View>
        )}
      </View>

      <AppText style={styles.description}>
        {selectedUri
          ? 'Nueva imagen seleccionada'
          : 'Selecciona una imagen de tu galería'}
      </AppText>

      <View style={styles.actionsContainer}>
        {!selectedUri ? (
          <>
            <CustomButton
              title="Seleccionar imagen"
              onPress={pickImage}
              variant="primary"
              icon="images-outline"
              style={styles.buttonStyle}
            />

            {photoUrl && (
              <CustomButton
                title="Eliminar actual"
                onPress={handleDelete}
                variant="secondary"
                icon="trash-outline"
                style={styles.buttonStyle}
              />
            )}
          </>
        ) : (
          <>
            <CustomButton
              title="Subir imagen"
              onPress={handleUpload}
              variant="primary"
              icon="cloud-upload-outline"
              disabled={uploading}
              loading={uploading}
              style={styles.buttonStyle}
            />

            <CustomButton
              title="Cancelar"
              onPress={() => setSelectedUri(null)}
              variant="secondary"
              icon="close-outline"
              disabled={uploading}
              style={styles.buttonStyle}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 8 },
  loadingContainer: { paddingVertical: 60, alignItems: 'center' },
  imagePreviewContainer: { marginBottom: 20 },
  image: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#F3F4F6',
    borderWidth: 3,
    borderColor: '#CC5803',
  },
  placeholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: fontWeightMedium,
  },
  description: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: fontWeightMedium,
  },
  actionsContainer: { width: '100%', gap: 12 },
  buttonStyle: { width: '100%', minWidth: '100%' },
});
