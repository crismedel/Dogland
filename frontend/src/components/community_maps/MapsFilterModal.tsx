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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  obtenerNombreEspecie,
  obtenerNombreEstadoSalud,
} from '../../types/report';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';
import CustomPicker from '@/src/components/UI/CustomPicker';

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
  hasActiveFilters: boolean;
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
  hasActiveFilters = false,
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

  // Convertir opciones al formato { label, value } para CustomPicker
  const especieOptions = [
    { label: 'Todas las especies', value: '' },
    ...ESPECIE_OPTIONS.map((opt) => ({ label: opt.nombre, value: opt.id })),
  ];

  const estadoSaludOptions = [
    { label: 'Todos los estados', value: '' },
    ...ESTADOS_SALUD_OPTIONS.map((opt) => ({
      label: opt.nombre,
      value: opt.id,
    })),
  ];

  const zonaOptions = [
    { label: 'Todas las zonas', value: '' },
    ...ZONAS_EJEMPLO.map((opt) => ({ label: opt.nombre, value: opt.id })),
  ];

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
          <CustomPicker
            options={especieOptions}
            selectedValue={selectedEspecie}
            onValueChange={setSelectedEspecie}
            placeholder="Seleccionar especie"
            icon="paw"
          />

          <AppText style={styles.inputLabel}>
            Estado de Salud del Animal:
          </AppText>
          <CustomPicker
            options={estadoSaludOptions}
            selectedValue={selectedEstadoSalud}
            onValueChange={setSelectedEstadoSalud}
            placeholder="Seleccionar estado de salud"
            icon="heart"
          />

          <AppText style={styles.inputLabel}>Zona/Región:</AppText>
          <CustomPicker
            options={zonaOptions}
            selectedValue={selectedZona}
            onValueChange={setSelectedZona}
            placeholder="Seleccionar zona"
            icon="location"
          />
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.cardBackground,
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
    borderBottomColor: Colors.gray || '#E0E0E0',
    paddingBottom: 10,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: fontWeightSemiBold,
    color: Colors.text || '#333',
  },
  scrollContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: fontWeightMedium,
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.gray || '#E0E0E0',
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
    backgroundColor: Colors.primary || '#007AFF',
    marginLeft: 10,
  },
  clearButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.secondary,
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: fontWeightSemiBold,
    color: Colors.text || '#333',
  },
});

export default MapsFilterModal;