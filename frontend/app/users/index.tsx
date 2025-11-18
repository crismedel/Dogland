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
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import {
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';
import { useRole } from '@/src/hooks/useRole';
import apiClient from '@/src/api/client';
import Spinner from '@/src/components/UI/Spinner';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

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
  // 3. Llamar al hook y generar los estilos
  const { colors } = useTheme();
  const styles = getStyles(colors);

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

  // 4. Mover la función aquí para que acceda a 'colors'
  const getRoleBadgeColor = (nombre_rol: string) => {
    switch (nombre_rol) {
      case 'Admin':
        return colors.danger;
      case 'Trabajador':
        return colors.info;
      case 'Usuario':
        return colors.success;
      default:
        return colors.darkGray;
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
            // 5. Usar colores del tema
            color={item.activo ? colors.success : colors.danger}
          />
          <AppText style={styles.statusText}>
            {item.activo ? 'Activo' : 'Inactivo'}
          </AppText>
        </View>
      </View>
      <TouchableOpacity style={styles.editButton}>
        <Ionicons name="create-outline" size={20} color={colors.primary} />
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
              // 5. Usar colores del tema
              style={{ width: 24, height: 24, tintColor: colors.lightText }}
            />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity style={styles.addButton}>
            <Ionicons
              name="person-add-outline"
              size={22}
              color={colors.lightText} // 5. Usar colores del tema
            />
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        {error ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="cloud-offline-outline"
              size={56}
              color={colors.primary} // 5. Usar colores del tema
            />
            <AppText style={styles.emptyTitle}>Error al cargar</AppText>
            <AppText style={styles.emptySubtitle}>{error}</AppText>
            <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
              <Ionicons name="refresh" size={18} color={colors.lightText} />
              <AppText style={styles.retryText}>Reintentar</AppText>
            </TouchableOpacity>
          </View>
        ) : users.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={56}
              color={colors.primary} // 5. Usar colores del tema
            />
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
                tintColor={colors.primary} // 5. Usar colores del tema
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

// 6. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background, // Dinámico
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    addButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    userCard: {
      flexDirection: 'row',
      backgroundColor: colors.cardBackground, // Dinámico
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
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
      color: colors.text, // Dinámico
    },
    roleBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      // backgroundColor es dinámico
    },
    roleBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.lightText, // Dinámico
      textTransform: 'uppercase',
    },
    userEmail: {
      fontSize: 13,
      color: colors.secondary, // Dinámico
      marginBottom: 6,
    },
    userStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statusText: {
      fontSize: 12,
      color: colors.darkGray, // Dinámico
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
      color: colors.text, // Dinámico
      textAlign: 'center',
      marginTop: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.darkGray, // Dinámico
      textAlign: 'center',
      marginBottom: 12,
    },
    retryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primary, // Dinámico
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
    },
    retryText: {
      color: colors.lightText, // Dinámico
      fontWeight: fontWeightMedium,
    },
  });