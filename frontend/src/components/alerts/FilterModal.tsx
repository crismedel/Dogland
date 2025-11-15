import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FilterOptions } from '../../types/alert';
import { Colors } from '@/src/constants/colors';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';
import CustomPicker from '@/src/components/UI/CustomPicker';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onFiltersChange,
}) => {
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

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

  const tipoAlertaOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Jauría', value: 'Jauria' },
    { label: 'Accidente', value: 'Accidente' },
    { label: 'Robo', value: 'Robo' },
    { label: 'Animal Perdido', value: 'Animal Perdido' },
    { label: 'Otro', value: 'Otro' },
  ];

  const nivelRiesgoOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Bajo', value: 'bajo' },
    { label: 'Medio', value: 'medio' },
    { label: 'Alto', value: 'alto' },
  ];

  const estadoOptions = [
    { label: 'Solo Activas', value: 'activas' },
    { label: 'Solo Archivadas', value: 'archivadas' },
    { label: 'Todas', value: 'todas' },
  ];

  const periodoOptions = [
    { label: 'Todas', value: 'todas' },
    { label: 'Últimas 24h', value: 'recientes' },
    { label: 'Última semana', value: 'semana' },
    { label: 'Último mes', value: 'mes' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>Filtrar Alertas</AppText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <ScrollView
            style={styles.filtersContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Tipo de Alerta */}
            <View style={styles.filterSection}>
              <AppText style={styles.filterLabel}>Tipo de Alerta</AppText>
              <CustomPicker
                options={tipoAlertaOptions}
                selectedValue={tempFilters.type}
                onValueChange={(value) =>
                  setTempFilters({ ...tempFilters, type: value })
                }
                placeholder="Seleccionar tipo"
                icon="alert-circle-outline"
              />
            </View>

            {/* Nivel de Riesgo */}
            <View style={styles.filterSection}>
              <AppText style={styles.filterLabel}>Nivel de Riesgo</AppText>
              <CustomPicker
                options={nivelRiesgoOptions}
                selectedValue={tempFilters.riskLevel}
                onValueChange={(value) =>
                  setTempFilters({ ...tempFilters, riskLevel: value })
                }
                placeholder="Seleccionar nivel"
                icon="warning-outline"
              />
            </View>

            {/* Estado */}
            <View style={styles.filterSection}>
              <AppText style={styles.filterLabel}>Estado</AppText>
              <CustomPicker
                options={estadoOptions}
                selectedValue={tempFilters.status}
                onValueChange={(value) =>
                  setTempFilters({ ...tempFilters, status: value })
                }
                placeholder="Seleccionar estado"
                icon="checkmark-circle-outline"
              />
            </View>

            {/* Período */}
            <View style={styles.filterSection}>
              <AppText style={styles.filterLabel}>Período</AppText>
              <CustomPicker
                options={periodoOptions}
                selectedValue={tempFilters.timeRange}
                onValueChange={(value) =>
                  setTempFilters({ ...tempFilters, timeRange: value })
                }
                placeholder="Seleccionar período"
                icon="calendar-outline"
              />
            </View>

            {/* Espaciado extra al final */}
            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetFilters}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={18} color="#FFF" />
              <AppText style={styles.resetButtonText}>Limpiar</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle-outline" size={18} color="#FFF" />
              <AppText style={styles.cancelButtonText}>Cancelar</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={applyFilters}
              activeOpacity={0.7}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#FFF"
              />
              <AppText style={styles.applyButtonText}>Aplicar</AppText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default FilterModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: fontWeightBold,
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: fontWeightSemiBold,
    color: '#111827',
    marginBottom: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFF',
    gap: 10,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: fontWeightSemiBold,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.danger,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: fontWeightSemiBold,
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: fontWeightSemiBold,
  },
});
