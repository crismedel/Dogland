import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FilterOptions } from '../../types/alert';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

// Componente de filtros
const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onFiltersChange,
}) => {
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);

  const applyFilters = () => {
    onFiltersChange(tempFilters);
    onClose();
  };

  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
      type: 'todos',
      riskLevel: 'todos',
      status: 'activas',
      timeRange: 'todas',
    };
    setTempFilters(defaultFilters);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filtrar Alertas</Text>

          <ScrollView>
            <Text style={styles.filterLabel}>Tipo de Alerta:</Text>
            <Picker
              selectedValue={tempFilters.type}
              onValueChange={(value) =>
                setTempFilters({ ...tempFilters, type: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Todos" value="todos" />
              <Picker.Item label="Jauría" value="Jauria" />
              <Picker.Item label="Accidente" value="Accidente" />
              <Picker.Item label="Robo" value="Robo" />
              <Picker.Item label="Animal Perdido" value="Animal Perdido" />
              <Picker.Item label="Otro" value="Otro" />
            </Picker>

            <Text style={styles.filterLabel}>Nivel de Riesgo:</Text>
            <Picker
              selectedValue={tempFilters.riskLevel}
              onValueChange={(value) =>
                setTempFilters({ ...tempFilters, riskLevel: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Todos" value="todos" />
              <Picker.Item label="Bajo" value="bajo" />
              <Picker.Item label="Medio" value="medio" />
              <Picker.Item label="Alto" value="alto" />
            </Picker>

            <Text style={styles.filterLabel}>Estado:</Text>
            <Picker
              selectedValue={tempFilters.status}
              onValueChange={(value) =>
                setTempFilters({ ...tempFilters, status: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Solo Activas" value="activas" />
              <Picker.Item label="Solo Archivadas" value="archivadas" />
              <Picker.Item label="Todas" value="todas" />
            </Picker>

            <Text style={styles.filterLabel}>Período:</Text>
            <Picker
              selectedValue={tempFilters.timeRange}
              onValueChange={(value) =>
                setTempFilters({ ...tempFilters, timeRange: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Todas" value="todas" />
              <Picker.Item label="Últimas 24h" value="recientes" />
              <Picker.Item label="Última semana" value="semana" />
              <Picker.Item label="Último mes" value="mes" />
            </Picker>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Limpiar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    color: '#333',
  },
  picker: {
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  resetButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
