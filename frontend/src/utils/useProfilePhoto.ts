import { useState, useEffect } from 'react';
import apiClient from '@/src/api/client';
import { useNotification } from '@/src/components/notifications';

interface ProfilePhotoMeta {
  id_usuario: number;
  has_photo: boolean;
  foto_perfil_mime: string | null;
  foto_perfil_updated_at: string | null;
  foto_perfil_api_url: string | null;
}

export function useProfilePhoto(userId: number) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { showError, showSuccess } = useNotification();

  const buildPhotoUrl = (meta: ProfilePhotoMeta | null) => {
    if (!meta?.has_photo || !meta.foto_perfil_api_url) return null;
    const ts = meta.foto_perfil_updated_at
      ? new Date(meta.foto_perfil_updated_at).getTime()
      : Date.now();
    return `${meta.foto_perfil_api_url}?v=${ts}`;
  };

  const fetchPhoto = async () => {
    if (!userId) {
      return;
    }

    try {
      setLoading(true);

      const res = await apiClient.get<{
        success: boolean;
        data: ProfilePhotoMeta;
      }>(`/user/profile-image/${userId}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (res.data?.success) {
        const url = buildPhotoUrl(res.data.data);
        setPhotoUrl(url);
      }
    } catch (error: any) {
      console.error(
        '❌ Error fetchPhoto:',
        error?.response?.data || error?.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (imageUri: string): Promise<boolean> => {
    try {
      setUploading(true);

      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const fileName =
        imageUri.split('/').pop() || `profile-${Date.now()}.${fileType}`;
      const mimeType =
        fileType === 'png'
          ? 'image/png'
          : fileType === 'webp'
          ? 'image/webp'
          : 'image/jpeg';

      const formData = new FormData();

      // ⬅️ CRÍTICO: Formato correcto para React Native
      formData.append('image', {
        uri: imageUri,
        type: mimeType,
        name: fileName,
      } as any);

      // ⬅️ USAR apiClient con configuración especial para FormData
      const res = await apiClient.post(
        `/user/profile-image/upload/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          // ⬅️ IMPORTANTE: No transformar FormData
          transformRequest: (data, headers) => {
            return data;
          },
          timeout: 60000, // 60 segundos
        },
      );

      if (res.data?.success) {
        await fetchPhoto();
        showSuccess('Listo', 'Foto de perfil actualizada.');
        return true;
      } else {
        throw new Error(res.data?.error || 'Error al subir la imagen');
      }
    } catch (error: any) {
      console.error('❌ Error completo:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      showError(
        'Error',
        error?.response?.data?.error ||
          error?.message ||
          'No se pudo subir la imagen',
      );
      return false;
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await apiClient.delete(`/user/profile-image/${userId}`);
      if (res.data?.success) {
        setPhotoUrl(null);
        showSuccess('Listo', 'Foto de perfil eliminada.');
        return true;
      } else {
        throw new Error(res.data?.error || 'Error al eliminar la imagen');
      }
    } catch (error: any) {
      showError(
        'Error',
        error?.response?.data?.error ||
          error?.message ||
          'No se pudo eliminar la imagen',
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId > 0) fetchPhoto();
  }, [userId]);

  return { photoUrl, loading, uploading, fetchPhoto, uploadPhoto, deletePhoto };
}
