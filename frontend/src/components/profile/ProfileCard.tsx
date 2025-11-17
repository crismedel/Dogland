// ProfileCard.tsx
import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import {
  fontWeightBold,
  fontWeightSemiBold,
  AppText,
} from '@/src/components/AppText';
import CustomButton from '@/src/components/UI/CustomButton';

interface ProfileCardProps {
  user: any;
  fullName: string;
  handle: string;
  displayAvatar: string;
  uploading: boolean;
  onEditPhoto: () => void;
  onEditProfile: () => void;
  onOpenSettings: () => void;
}

export default function ProfileCard({
  user,
  fullName,
  handle,
  displayAvatar,
  uploading,
  onEditPhoto,
  onEditProfile,
  onOpenSettings,
}: ProfileCardProps) {
  return (
    <View style={styles.profileCard}>
      <View style={styles.avatarWrap}>
        <Pressable
          onPress={onEditPhoto}
          disabled={uploading}
          accessibilityLabel="Editar foto de perfil"
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
            { alignItems: 'center', justifyContent: 'center' },
          ]}
        >
          <Image source={{ uri: displayAvatar }} style={styles.avatar} />

          {uploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}

          <View style={{ position: 'absolute', right: 6, bottom: 6 }}>
            <Pressable
              onPress={onEditPhoto}
              disabled={uploading}
              style={({ pressed }) => [
                styles.editBadge,
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
            >
              <Ionicons
                name="create-outline"
                size={14}
                color={Colors.lightText}
              />
            </Pressable>
          </View>
        </Pressable>
      </View>

      <AppText style={styles.name}>{fullName}</AppText>
      <AppText style={styles.username}>@{handle}</AppText>

      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: user.activo
              ? 'rgba(22,163,74,0.12)'
              : 'rgba(220,38,38,0.10)',
            marginTop: 8,
          },
        ]}
      >
        <AppText
          style={[
            styles.statusText,
            { color: user.activo ? '#16A34A' : '#DC2626' },
          ]}
        >
          {user.activo ? '✓ Activo' : '✗ Inactivo'}
        </AppText>
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.buttonWrapper}>
          <CustomButton
            title="Editar perfil"
            onPress={onEditProfile}
            variant="primary"
            icon="create-outline"
            style={styles.buttonInner}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <CustomButton
            title="Ajustes"
            onPress={onOpenSettings}
            variant="secondary"
            icon="settings-outline"
            style={styles.buttonInner}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.secondary,
    shadowColor: '#000',
    shadowOpacity: 0.045,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    overflow: 'visible',
  },
  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: -6,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: 'rgba(251,191,36,0.12)',
    backgroundColor: '#FFF',
  },
  editBadge: {
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.32)',
    borderRadius: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: fontWeightBold,
    textAlign: 'center',
  },
  username: {
    color: Colors.darkGray,
    marginTop: 4,
    textAlign: 'center',
    fontSize: 13,
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 8,
  },
  statusText: {
    color: Colors.lightText,
    fontSize: 12,
    fontWeight: fontWeightSemiBold,
  },
  actionsRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    flexBasis: '50%',
  },
  buttonInner: {
    width: 'auto',
    minWidth: 150,
    marginHorizontal: 10,
  },
});
