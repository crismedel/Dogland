import {
  AppText,
  fontWeightBold,
  fontWeightMedium,
  fontWeightSemiBold,
} from '@/src/components/AppText';
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import {
  obtenerNombreEspecie,
  obtenerNombreEstadoSalud,
} from '../../types/report';
// 1. Quitar la importación estática
// import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

interface FilterOption {
  id: number | string;
  nombre: string;
}

interface MapsFilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApplyFilter: (filters: {
    especieId?: number | string;
    estadoSaludId?: number | string;
    zona?: string;
  }) => void;
  currentFilters: {
    especieId?: number | string;
    estadoSaludId?: number | string;
    zona?: string;
  };
  hasActiveFilters: boolean; // Nuevo prop para saber si hay filtros activos
}

const ZONAS_EJEMPLO = [
  { id: 'norte', nombre: 'Zona Norte' },
  { id: 'centro', nombre: 'Zona Centro' },
  { id: 'sur', nombre: 'Zona Sur' },
];

const ESPECIE_OPTIONS: FilterOption[] = Object.keys({
  1: 'Perro',
  2: 'Gato',
  3: 'Otro',
}).map((id) => ({
  id: Number(id),
  nombre: obtenerNombreEspecie(Number(id)),
}));

const ESTADOS_SALUD_OPTIONS: FilterOption[] = Object.keys({
  1: 'Saludable',
  2: 'Herido',
  3: 'Grave',
}).map((id) => ({
  id: Number(id),
  nombre: obtenerNombreEstadoSalud(Number(id)),
}));

const MapsFilterModal: React.FC<MapsFilterModalProps> = ({
  isVisible,
  onClose,
  onApplyFilter,
  currentFilters = {},
  hasActiveFilters = false, // Valor por defecto
}) => {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [selectedEspecie, setSelectedEspecie] = useState<number | string>(
    currentFilters.especieId || '',
  );
  const [selectedEstadoSalud, setSelectedEstadoSalud] = useState<
    number | string
  >(currentFilters.estadoSaludId || '');
  const [selectedZona, setSelectedZona] = useState<string>(
    currentFilters.zona || '',
  );

  useEffect(() => {
    if (isVisible) {
      setSelectedEspecie(currentFilters.especieId || '');
      setSelectedEstadoSalud(currentFilters.estadoSaludId || '');
      setSelectedZona(currentFilters.zona || '');
    }
  }, [isVisible, currentFilters]);

  const handleApply = () => {
    onApplyFilter({
      especieId: selectedEspecie === '' ? undefined : selectedEspecie,
      estadoSaludId:
        selectedEstadoSalud === '' ? undefined : selectedEstadoSalud,
      zona: selectedZona === '' ? undefined : selectedZona,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedEspecie('');
    setSelectedEstadoSalud('');
    setSelectedZona('');
    onApplyFilter({});
    onClose();
  };

  if (!isVisible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <AppText style={styles.headerTitle}>Filtrar Avistamientos</AppText>
          <TouchableOpacity onPress={onClose}>
            <Ionicons
              name="close-circle-outline"
              size={30}
              color={colors.darkGray} // 4. Usar colores del tema
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <AppText style={styles.inputLabel}>Especie del Animal:</AppText>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedEspecie}
              onValueChange={(itemValue) => setSelectedEspecie(itemValue)}
              style={styles.picker}
              dropdownIconColor={colors.primary} // 4. Usar colores del tema
              itemStyle={styles.pickerItem} // Estilo para el texto en iOS
            >
              <Picker.Item label="Todas las especies" value="" />
              {ESPECIE_OPTIONS.map((opt) => (
                <Picker.Item key={opt.id} label={opt.nombre} value={opt.id} />
              ))}
            </Picker>
          </View>

          <AppText style={styles.inputLabel}>
            Estado de Salud del Animal:
          </AppText>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedEstadoSalud}
              onValueChange={(itemValue) => setSelectedEstadoSalud(itemValue)}
              style={styles.picker}
              dropdownIconColor={colors.primary} // 4. Usar colores del tema
              itemStyle={styles.pickerItem} // Estilo para el texto en iOS
            >
              <Picker.Item label="Todos los estados" value="" />
              {ESTADOS_SALUD_OPTIONS.map((opt) => (
                <Picker.Item key={opt.id} label={opt.nombre} value={opt.id} />
              ))}
            </Picker>
          </View>

          <AppText style={styles.inputLabel}>Zona/Región:</AppText>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedZona}
              onValueChange={(itemValue) => setSelectedZona(itemValue)}
              style={styles.picker}
              dropdownIconColor={colors.primary} // 4. Usar colores del tema
              itemStyle={styles.pickerItem} // Estilo para el texto en iOS
            >
              <Picker.Item label="Todas las zonas" value="" />
              {ZONAS_EJEMPLO.map((opt) => (
                <Picker.Item key={opt.id} label={opt.nombre} value={opt.id} />
              ))}
            </Picker>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={handleClear}
          >
            <AppText style={styles.buttonText}>Limpiar</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.applyButton]}
            onPress={handleApply}
          >
            <AppText style={styles.applyButtonText}>Aplicar Filtros</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.cardBackground, // Dinámico
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: '80%',
      minHeight: '60%',
    },
    scrollView: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.gray, // Dinámico
      paddingBottom: 10,
      marginBottom: 15,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: fontWeightSemiBold,
      color: colors.text, // Dinámico
    },
    scrollContent: {
      paddingBottom: 20,
      flexGrow: 1,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: fontWeightMedium,
      color: colors.text, // Dinámico
      marginTop: 20,
      marginBottom: 8,
      marginLeft: 4,
    },
    pickerWrapper: {
      marginBottom: 15,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: colors.background, // Dinámico
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
    },
    picker: {
      backgroundColor: colors.background, // Dinámico
      color: colors.text, // Dinámico (para Android)
      height: Platform.OS === 'ios' ? 140 : 50,
      ...Platform.select({
        ios: {
          marginVertical: -8,
        },
        android: {
          height: 50,
        },
      }),
    },
    pickerItem: {
      // Estilo para el texto del Picker en iOS
      color: colors.text,
      backgroundColor: colors.cardBackground,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: colors.gray, // Dinámico
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 5,
    },
    applyButton: {
      backgroundColor: colors.primary, // Dinámico
      marginLeft: 10,
    },
    clearButton: {
      backgroundColor: colors.backgroundSecon, // Dinámico
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
      marginRight: 10,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: fontWeightSemiBold,
      color: colors.text, // Dinámico
    },
    // Estilo específico para el botón de aplicar (fondo amarillo)
    applyButtonText: {
      fontSize: 16,
      fontWeight: fontWeightSemiBold,
      color: isDark ? colors.lightText : colors.text, // Dinámico
    },
  });

export default MapsFilterModal;