import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Colors } from '../../constants/colors';
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
              color={Colors.darkGray}
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
              dropdownIconColor={Colors.primary}
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
              dropdownIconColor={Colors.primary}
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
              dropdownIconColor={Colors.primary}
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
            <AppText style={[styles.buttonText, { color: Colors.lightText }]}>
              Aplicar Filtros
            </AppText>
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
    backgroundColor: Colors.lightText || '#ffffff',
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
  pickerWrapper: {
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  picker: {
    backgroundColor: '#f8f9fa',
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
    backgroundColor: Colors.background || '#F8F8F8',
    borderWidth: 1,
    borderColor: Colors.gray || '#E0E0E0',
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: fontWeightSemiBold,
    color: Colors.text || '#333',
  },
});

export default MapsFilterModal;
