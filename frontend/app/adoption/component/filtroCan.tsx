// app/adoption/components/filtroCan.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Ionicons } from '@expo/vector-icons';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

interface FiltroCanProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    ageRange: number[];
    selectedBreeds: string[];
    selectedHealth: string[];
    selectedSizes: string[];
  }) => void;
  animals: any[];
}

const FiltroCan: React.FC<FiltroCanProps> = ({
  visible,
  onClose,
  onApply,
  animals,
}) => {
  const maxAge =
    animals.length > 0 ? Math.max(...animals.map((a) => a.age)) : 10;
  const [ageRange, setAgeRange] = useState<[number, number]>([0, maxAge]);

  // Obtener opciones únicas de los datos
  const breeds = [...new Set(animals.map((animal) => animal.breed))].sort();
  const healthStatus = [
    ...new Set(animals.map((animal) => animal.health)),
  ].sort();
  const sizes = [...new Set(animals.map((animal) => animal.size))].sort();

  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [selectedHealth, setSelectedHealth] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      // Resetear filtros cuando se abre el modal
      setAgeRange([0, maxAge]);
      setSelectedBreeds([]);
      setSelectedHealth([]);
      setSelectedSizes([]);
    }
  }, [visible, maxAge]);

  const toggleBreed = (breed: string) => {
    setSelectedBreeds((prev) =>
      prev.includes(breed) ? prev.filter((b) => b !== breed) : [...prev, breed],
    );
  };

  const toggleHealth = (health: string) => {
    setSelectedHealth((prev) =>
      prev.includes(health)
        ? prev.filter((h) => h !== health)
        : [...prev, health],
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const handleApply = () => {
    onApply({
      ageRange,
      selectedBreeds,
      selectedHealth,
      selectedSizes,
    });
  };

  const handleReset = () => {
    setAgeRange([0, maxAge]);
    setSelectedBreeds([]);
    setSelectedHealth([]);
    setSelectedSizes([]);
  };

  const getSelectedCount = () => {
    let count = 0;
    if (ageRange[0] > 0 || ageRange[1] < maxAge) count++;
    count += selectedBreeds.length;
    count += selectedHealth.length;
    count += selectedSizes.length;
    return count;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <AppText style={styles.modalTitle}>Filtrar Animales</AppText>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Filtro por Edad */}
                <View style={styles.filterSection}>
                  <AppText style={styles.sectionTitle}>Edad (meses)</AppText>
                  <AppText style={styles.rangeText}>
                    {ageRange[0]} - {ageRange[1]} meses
                  </AppText>
                  <MultiSlider
                    values={ageRange}
                    min={0}
                    max={maxAge}
                    step={1}
                    onValuesChange={(values) =>
                      setAgeRange([values[0], values[1]])
                    }
                    selectedStyle={{ backgroundColor: '#4A90E2' }}
                    markerStyle={{
                      backgroundColor: '#4A90E2',
                      height: 20,
                      width: 20,
                    }}
                    trackStyle={{ height: 4 }}
                  />
                </View>

                {/* Filtro por Raza */}
                <View style={styles.filterSection}>
                  <AppText style={styles.sectionTitle}>Raza</AppText>
                  <View style={styles.chipContainer}>
                    {breeds.map((breed) => (
                      <TouchableOpacity
                        key={breed}
                        style={[
                          styles.chip,
                          selectedBreeds.includes(breed) && styles.chipSelected,
                        ]}
                        onPress={() => toggleBreed(breed)}
                      >
                        <AppText
                          style={[
                            styles.chipText,
                            selectedBreeds.includes(breed) &&
                              styles.chipTextSelected,
                          ]}
                        >
                          {breed}
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Filtro por Estado de Salud */}
                <View style={styles.filterSection}>
                  <AppText style={styles.sectionTitle}>Estado de Salud</AppText>
                  <View style={styles.chipContainer}>
                    {healthStatus.map((health) => (
                      <TouchableOpacity
                        key={health}
                        style={[
                          styles.chip,
                          selectedHealth.includes(health) &&
                            styles.chipSelected,
                        ]}
                        onPress={() => toggleHealth(health)}
                      >
                        <AppText
                          style={[
                            styles.chipText,
                            selectedHealth.includes(health) &&
                              styles.chipTextSelected,
                          ]}
                        >
                          {health}
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Filtro por Tamaño */}
                <View style={styles.filterSection}>
                  <AppText style={styles.sectionTitle}>Tamaño</AppText>
                  <View style={styles.chipContainer}>
                    {sizes.map((size) => (
                      <TouchableOpacity
                        key={size}
                        style={[
                          styles.chip,
                          selectedSizes.includes(size) && styles.chipSelected,
                        ]}
                        onPress={() => toggleSize(size)}
                      >
                        <AppText
                          style={[
                            styles.chipText,
                            selectedSizes.includes(size) &&
                              styles.chipTextSelected,
                          ]}
                        >
                          {size}
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              {/* Botones de acción */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.resetButton]}
                  onPress={handleReset}
                >
                  <AppText style={styles.buttonTextReset}>Reiniciar</AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.applyButton]}
                  onPress={handleApply}
                >
                  <AppText style={styles.buttonText}>
                    Aplicar{' '}
                    {getSelectedCount() > 0 && `(${getSelectedCount()})`}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: fontWeightBold,
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    maxHeight: 400,
  },
  filterSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: fontWeightBold,
    marginBottom: 15,
    color: '#333',
  },
  rangeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  chipSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: fontWeightBold,
  },
  buttonRow: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  applyButton: {
    backgroundColor: '#4A90E2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: fontWeightBold,
  },
  buttonTextReset: {
    color: '#666',
    fontSize: 16,
    fontWeight: fontWeightBold,
  },
});

export default FiltroCan;
