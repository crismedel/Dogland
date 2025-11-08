// app/adoption/historialMedico.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
// import { Ionicons } from '@expo/vector-icons'; // No se usa en este archivo, se puede borrar
import { useRouter } from 'expo-router';
import TarjetaMedica from './component/terjetasMedicas';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

// --- 1. Importaciones para la autenticación ---
import { authStorage } from '@/src/utils/authStorage'; // Ajusta la ruta si es necesario
import { jwtDecode } from 'jwt-decode';

// --- Opcional: Interfaz para el payload de tu token ---
interface TokenPayload {
  id: number;
  role: string;
  email: string;
  iat: number;
  exp: number;
}

const HistorialMedico = () => {
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

        // Mock que incluye estadoMedico + descripcion (nuevo esquema)
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
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  // --- 4. Variable para chequear permisos ---
  const canManage = userRole === 'Admin' || userRole === 'Trabajador';

  return (
    <View style={styles.container}>
      {/* Header (no cambia) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButtonHeader}
        >
          <Image
            source={require('../../assets/images/volver.png')}
            style={styles.backIconHeader}
          />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Historial Médico</AppText>
      </View>

      {/* --- 5. Lista de tarjetas médicas (Pasamos props) --- */}
      <FlatList
        data={historial}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TarjetaMedica
            nombre={item.nombre}
            estadoMedico={item.estadoMedico}
            descripcion={item.descripcion}
            condicion={item.condicion}
            // --- Props nuevas para los roles ---
            historialId={item.id} // Para saber qué item editar/borrar
            userRole={userRole}
          />
        )}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
      />

      {/* --- 6. Botón condicional "Agregar historial" --- */}
      {/* Solo se muestra si 'canManage' es true */}
      {canManage && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAgregarHistorial}
        >
          <AppText style={styles.addButtonText}>
            + Agregar historial médico
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

// --- (Estilos no cambian) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#dbe8d3' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    padding: 12,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: fontWeightBold,
    color: '#fff',
    marginLeft: 16,
  },
  backButtonHeader: { padding: 6 },
  backIconHeader: { width: 24, height: 24, tintColor: '#fff' },

  addButton: {
    backgroundColor: '#fbbf24',
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: fontWeightBold,
  },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default HistorialMedico;