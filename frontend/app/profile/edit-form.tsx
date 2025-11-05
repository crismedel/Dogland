import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import DynamicForm, { FormField } from '@/src/components/UI/DynamicForm';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { AppText } from '@/src/components/AppText';
import { Colors } from '@/src/constants/colors';
import { fetchUserProfile, updateUserProfile } from '@/src/api/users';
import { useNotification } from '@/src/components/notifications';
import { useRefresh } from '@/src/contexts/RefreshContext';
import { REFRESH_KEYS } from '@/src/constants/refreshKeys';

const EditProfileScreen = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();
  const { showError, showSuccess } = useNotification();
  const { triggerRefresh } = useRefresh();

  const [formValues, setFormValues] = useState({
    nombre_usuario: '',
    apellido_paterno: '',
    apellido_materno: '',
    telefono: '',
    fecha_nacimiento: new Date(),
    id_sexo: 0,
  });

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setInitialLoading(true);
      const userData = await fetchUserProfile();

      setFormValues({
        nombre_usuario: userData.nombre_usuario || '',
        apellido_paterno: userData.apellido_paterno || '',
        apellido_materno: userData.apellido_materno || '',
        telefono: userData.telefono || '',
        fecha_nacimiento: userData.fecha_nacimiento
          ? new Date(userData.fecha_nacimiento)
          : new Date(),
        id_sexo: userData.id_sexo || 0,
      });
    } catch (error: any) {
      showError(
        'Error',
        error.message ||
          'No se pudo cargar tu información. Intenta nuevamente.',
      );
      console.error('Error cargando datos:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  // Solo calendario: usa dateMode: 'date'
  // Puedes añadir minDate/maxDate (YYYY-MM-DD) para restringir
  const todayYYYYMMDD = new Date().toISOString().split('T')[0];

  const formFields: FormField[] = [
    {
      name: 'nombre_usuario',
      label: 'Nombre de Usuario',
      placeholder: 'Ingresa tu nombre de usuario',
      type: 'text',
      icon: 'person-outline',
      autoCapitalize: 'none',
    },
    {
      name: 'apellido_paterno',
      label: 'Apellido Paterno',
      placeholder: 'Ingresa tu apellido paterno',
      type: 'text',
      icon: 'person-outline',
      autoCapitalize: 'words',
    },
    {
      name: 'apellido_materno',
      label: 'Apellido Materno',
      placeholder: 'Ingresa tu apellido materno',
      type: 'text',
      icon: 'person-outline',
      autoCapitalize: 'words',
    },
    {
      name: 'telefono',
      label: 'Teléfono',
      placeholder: '+56 9 1234 5678',
      type: 'phone',
      keyboardType: 'phone-pad',
      icon: 'call-outline',
    },
    {
      name: 'fecha_nacimiento',
      label: 'Fecha de Nacimiento',
      placeholder: 'Selecciona tu fecha de nacimiento',
      type: 'date',
      icon: 'calendar-outline',
      dateMode: 'date', // <- Solo calendario (sin hora)
      calendarTheme: 'light', // opcional: 'dark' si quieres tema oscuro
      maxDate: todayYYYYMMDD, // opcional: no permitir fechas futuras
      // minDate: '1900-01-01',     // opcional: establece un límite inferior si quieres
    },
    {
      name: 'id_sexo',
      label: 'Sexo',
      type: 'picker',
      icon: 'male-female-outline',
      options: [
        { label: 'Selecciona tu sexo', value: 0 },
        { label: 'Masculino', value: 1 },
        { label: 'Femenino', value: 2 },
        { label: 'Otro', value: 3 },
      ],
    },
  ];

  const handleValueChange = (name: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (values: Record<string, any>) => {
    setLoading(true);

    try {
      const dataToSend = {
        nombre_usuario: values.nombre_usuario,
        apellido_paterno: values.apellido_paterno,
        apellido_materno: values.apellido_materno,
        telefono: values.telefono,
        // Enviar fecha como YYYY-MM-DD
        fecha_nacimiento:
          values.fecha_nacimiento instanceof Date
            ? values.fecha_nacimiento.toISOString().split('T')[0]
            : values.fecha_nacimiento,
        id_sexo: values.id_sexo,
      };

      await updateUserProfile(dataToSend);

      showSuccess('Éxito', 'Tu perfil ha sido actualizado correctamente');

      triggerRefresh(REFRESH_KEYS.USER);

      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error: any) {
      showError(
        'Error',
        error.message || 'No se pudo actualizar el perfil. Intenta nuevamente.',
      );
      console.error('Error al actualizar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de carga mientras obtiene datos
  if (initialLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <AppText style={styles.loadingText}>Cargando información...</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Editar Perfil"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              style={{ width: 24, height: 24, tintColor: '#fff' }}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={styles.subtitle}>
          Actualiza tu información personal
        </AppText>

        <DynamicForm
          fields={formFields}
          values={formValues}
          onValueChange={handleValueChange}
          onSubmit={handleSubmit}
          loading={loading}
          buttonText="Guardar Cambios"
          buttonIcon="checkmark-circle-outline"
        />
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280',
  },
});
