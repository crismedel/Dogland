import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { Colors } from '@/src/constants/colors';
import {
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';
import { useRole } from '@/src/hooks/useRole';
import apiClient from '@/src/api/client';
import Spinner from '@/src/components/UI/Spinner';

interface User {
  id_usuario: number;
  nombre_usuario: string;
  apellido_paterno: string;
  apellido_materno?: string;
  telefono?: string;
  email: string;
  fecha_nacimiento?: string;
  fecha_creacion: string;
  activo: boolean;
  nombre_rol: string;
  nombre_ciudad?: string;
  sexo?: string;
  nombre_organizacion?: string;
}

const UsersScreen = () => {
  const router = useRouter();
  const { isAdmin } = useRole();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar que solo Admin pueda acceder
  useEffect(() => {
    if (!isAdmin()) {
      router.replace('/home');
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setError(null);
      const response = await apiClient.get('/users');
      // Backend returns { success: true, data: [...], count: N }
      setUsers(response.data.data || response.data);
    } catch (err: any) {
      console.error('Error cargando usuarios:', err);
      setError(err.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const getRoleBadgeColor = (nombre_rol: string) => {
    switch (nombre_rol) {
      case 'Admin':
        return '#dc3545';
      case 'Trabajador':
        return '#17a2b8';
      case 'Usuario':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const renderUserCard = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <AppText style={styles.userName}>
            {item.nombre_usuario} {item.apellido_paterno}
          </AppText>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: getRoleBadgeColor(item.nombre_rol) },
            ]}
          >
            <AppText style={styles.roleBadgeText}>{item.nombre_rol}</AppText>
          </View>
        </View>
        <AppText style={styles.userEmail}>{item.email}</AppText>
        <View style={styles.userStatus}>
          <Ionicons
            name={item.activo ? 'checkmark-circle' : 'close-circle'}
            size={16}
            color={item.activo ? '#28a745' : '#dc3545'}
          />
          <AppText style={styles.statusText}>
            {item.activo ? 'Activo' : 'Inactivo'}
          </AppText>
        </View>
      </View>
      <TouchableOpacity style={styles.editButton}>
        <Ionicons name="create-outline" size={20} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return <Spinner />;
  }

  return (
    <View style={styles.container}>
      <CustomHeader
        title={`Usuarios (${users.length})`}
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              style={{ width: 24, height: 24, tintColor: '#fff' }}
            />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="person-add-outline" size={22} color="#fff" />
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        {error ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="cloud-offline-outline"
              size={56}
              color={Colors.primary}
            />
            <AppText style={styles.emptyTitle}>Error al cargar</AppText>
            <AppText style={styles.emptySubtitle}>{error}</AppText>
            <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
              <Ionicons name="refresh" size={18} color="#fff" />
              <AppText style={styles.retryText}>Reintentar</AppText>
            </TouchableOpacity>
          </View>
        ) : users.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={56} color={Colors.primary} />
            <AppText style={styles.emptyTitle}>No hay usuarios</AppText>
            <AppText style={styles.emptySubtitle}>
              No se encontraron usuarios en el sistema
            </AppText>
          </View>
        ) : (
          <FlatList
            data={users}
            renderItem={renderUserCard}
            keyExtractor={(item) => `user-${item.id_usuario}`}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
              />
            }
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>
    </View>
  );
};

export default UsersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 8,
    color: Colors.secondary,
  },
  addButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.secondary,
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: fontWeightSemiBold,
    color: Colors.text,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  userEmail: {
    fontSize: 13,
    color: Colors.secondary,
    marginBottom: 6,
  },
  userStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: fontWeightMedium,
  },
  editButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: fontWeightSemiBold,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: fontWeightMedium,
  },
});
