import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';

import TarjetaMedica from './component/terjetasMedicas';

// Auth
import { authStorage } from '@/src/utils/authStorage';
import { jwtDecode } from 'jwt-decode';

import CustomHeader from '@/src/components/UI/CustomHeader';
import CustomButton from '@/src/components/UI/CustomButton';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import Spinner from '@/src/components/UI/Spinner';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';
import { AppText } from '@/src/components/AppText'; // Importar AppText

// --- Opcional: Interfaz para el payload de tu token ---
interface TokenPayload {
  id: number;
  role: string;
  email: string;
  iat: number;
  exp: number;
}

const HistorialMedico = () => {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const router = useRouter();

  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 2. Estado para guardar el rol del usuario ---
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // --- 3. Creamos una función async para cargar todo ---
    const loadData = async () => {
      try {
        // --- Lógica para obtener el rol ---
        const token = await authStorage.getToken();
        let roleFromToken: string | null = null;

        if (token) {
          try {
            const decodedToken = jwtDecode<TokenPayload>(token);
            roleFromToken = decodedToken.role;
          } catch (decodeError) {
            console.error('Error al decodificar el token:', decodeError);
          }
        }
        setUserRole(roleFromToken);
        // --- Fin de la lógica del token ---

        // MOCK temporal
        const mockHistorial = [
          {
            id: '1',
            nombre: 'Luna',
            estadoMedico: 2,
            descripcion: 'Vacunada, en recuperación de cirugía menor',
          },
          {
            id: '2',
            nombre: 'Thor',
            estadoMedico: 1,
            descripcion: 'Sano, necesita chequeo dental',
          },
          {
            id: '3',
            nombre: 'Max',
            estadoMedico: 2,
            descripcion: 'Problemas en la piel, tratamiento en curso',
          },
        ];

        // Simulamos la carga
        setTimeout(() => {
          setHistorial(mockHistorial);
          setLoading(false); // --- Movemos esto aquí ---
        }, 600);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setLoading(false);
      }
      // --- El finally no es necesario si setTimeout maneja el setLoading ---
    };

    loadData();
  }, []);

  const handleAgregarHistorial = () => {
    // Aquí puedes navegar a la pantalla de agregar
    console.log('/adoption/agregarHistorial'); // Ejemplo de ruta
  };

  if (loading) {
    return <Spinner />;
  }

  // --- 4. Variable para chequear permisos ---
  const canManage = userRole === 'Admin' || userRole === 'Trabajador';

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Historial Médico"
        leftComponent={
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButtonHeader}
          >
            <Image
              source={require('../../assets/images/volver.png')}
              style={styles.backIconHeader} // 4. Usar estilos dinámicos
            />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={historial}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TarjetaMedica
            nombre={item.nombre}
            estadoMedico={item.estadoMedico}
            descripcion={item.descripcion}
            historialId={item.id}
            userRole={userRole}
          />
        )}
      />

      {/* --- 6. Botón condicional "Agregar historial" --- */}
      {/* Solo se muestra si 'canManage' es true */}
      {canManage && (
        <View>
          <CustomButton
            title="Agregar historial médico"
            onPress={handleAgregarHistorial}
            variant="primary"
            icon="add-circle"
            style={styles.floatingButton}
          />
        </View>
      )}
    </View>
  );
};

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background }, // Dinámico

    backButtonHeader: { padding: 6 },
    backIconHeader: {
      width: 24,
      height: 24,
      // 4. Usar colores del tema (texto oscuro sobre fondo amarillo)
      tintColor: isDark ? colors.lightText : colors.text,
    },

    listContent: {
      paddingTop: 10,
      paddingBottom: 80, // ⬅ espacio extra para que el botón flotante no tape nada
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    floatingButton: {
      position: 'absolute',
      bottom: 20,
      // Centrar horizontalmente
      left: '10%',
      right: '10%',
      width: '80%',
      zIndex: 10,
    },
  });

export default HistorialMedico;