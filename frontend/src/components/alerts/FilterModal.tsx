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
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
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
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

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

  useEffect(() => {
    // Sincronizar los filtros temporales si los filtros externos cambian
    if (visible) {
      setTempFilters(filters);
    }
  }, [filters, visible]);

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
    // Aplicar inmediatamente al resetear
    onFiltersChange(defaultFilters);
    onClose();
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
    { label: 'Bajo', value: 'Bajo' },
    { label: 'Medio', value: 'Medio' },
    { label: 'Alto', value: 'Alto' },
    { label: 'Crítico', value: 'Crítico' },
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
              {/* 4. Usar colores del tema */}
              <Ionicons name="close" size={24} color={colors.darkGray} />
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
              {/* 4. Usar colores del tema */}
              <Ionicons name="refresh-outline" size={18} color={colors.lightText} />
              <AppText style={styles.resetButtonText}>Limpiar</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              {/* 4. Usar colores del tema */}
              <Ionicons
                name="close-circle-outline"
                size={18}
                color={colors.lightText}
              />
              <AppText style={styles.cancelButtonText}>Cancelar</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={applyFilters}
              activeOpacity={0.7}
            >
              {/* 4. Usar colores del tema */}
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={colors.lightText}
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
      backgroundColor: colors.gray, // Dinámico
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
      borderBottomColor: colors.gray, // Dinámico
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: fontWeightBold,
      color: colors.text, // Dinámico
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
      color: colors.text, // Dinámico
      marginBottom: 10,
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      paddingBottom: 20,
      borderTopWidth: 1,
      borderTopColor: colors.gray, // Dinámico
      backgroundColor: colors.cardBackground, // Dinámico
      gap: 10,
    },
    resetButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.darkGray, // Dinámico
      paddingVertical: 12,
      borderRadius: 12,
      gap: 6,
    },
    resetButtonText: {
      color: colors.lightText, // Dinámico
      fontSize: 14,
      fontWeight: fontWeightSemiBold,
    },
    cancelButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.danger, // Dinámico
      paddingVertical: 12,
      borderRadius: 12,
      gap: 6,
    },
    cancelButtonText: {
      color: colors.lightText, // Dinámico
      fontSize: 14,
      fontWeight: fontWeightSemiBold,
    },
    applyButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.success, // Dinámico
      paddingVertical: 12,
      borderRadius: 12,
      gap: 6,
    },
    applyButtonText: {
      color: colors.lightText, // Dinámico
      fontSize: 14,
      fontWeight: fontWeightSemiBold,
    },
  });