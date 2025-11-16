import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText, fontWeightBold } from '@/src/components/AppText';
import { Colors } from '@/src/constants/colors';

interface FiltroCanProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    ageRange: number[];
    selectedBreeds: string[];
    selectedHealth: string[];
    selectedSizes: string[];
    showFavorites?: boolean;
  }) => void;
  animals: any[];
  breedsMapping?: Record<number, string>;
  healthMapping?: Record<number, string>;
  sizesMapping?: Record<number | string, string>;
}

const normalizeField = (
  value: any,
  mapping?: Record<number | string, string>,
): string => {
  if (value == null || value === '') return 'Desconocido';
  if (typeof value === 'object') {
    if (value.name) return value.name;
    if (value.id && mapping?.[value.id]) return mapping[value.id];
    return String(value.id ?? 'Desconocido');
  }
  if (typeof value === 'number') return mapping?.[value] ?? `#${value}`;
  if (typeof value === 'string') return value.trim() || 'Desconocido';
  return 'Desconocido';
};

const FiltroCan: React.FC<FiltroCanProps> = ({
  visible,
  onClose,
  onApply,
  animals,
  breedsMapping = {},
  healthMapping = {},
  sizesMapping = {},
}) => {
  const maxAge = useMemo(
    () =>
      animals.length > 0
        ? Math.max(...animals.map((a) => Number(a.age) || 0))
        : 10,
    [animals],
  );

  const [ageRange, setAgeRange] = useState<[number, number]>([0, maxAge]);
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [selectedHealth, setSelectedHealth] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);

  const breeds = useMemo(() => {
    return [
      ...new Set(
        animals.map((a) => {
          const breedId = a.id_raza ?? a.breed;
          return (
            breedsMapping[breedId] || normalizeField(a.breed, breedsMapping)
          );
        }),
      ),
    ].filter((v) => v !== 'Desconocido');
  }, [animals, breedsMapping]);

  const healthStatus = useMemo(() => {
    return [
      ...new Set(
        animals.map((a) => {
          const healthId = a.id_estado_salud ?? a.estadoMedico;
          return (
            healthMapping[healthId] || normalizeField(a.health, healthMapping)
          );
        }),
      ),
    ].filter((v) => v !== 'Desconocido');
  }, [animals, healthMapping]);

  const sizes = useMemo(() => {
    return [
      ...new Set(
        animals.map((a) => {
          const sizeValue = a.size;
          return (
            sizesMapping[sizeValue as number | string] ||
            normalizeField(a.size, sizesMapping)
          );
        }),
      ),
    ]
      .filter((v) => v !== 'Desconocido')
      .sort();
  }, [animals, sizesMapping]);

  useEffect(() => {
    if (visible) {
      setAgeRange([0, maxAge]);
      setSelectedBreeds([]);
      setSelectedHealth([]);
      setSelectedSizes([]);
      setShowFavorites(false);
    }
  }, [visible, maxAge]);

  const toggleItem = useCallback(
    (value: string, setFn: React.Dispatch<React.SetStateAction<string[]>>) => {
      setFn((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value],
      );
    },
    [],
  );

  const handleApply = useCallback(() => {
    onApply({
      ageRange,
      selectedBreeds,
      selectedHealth,
      selectedSizes,
      showFavorites,
    });
  }, [
    ageRange,
    selectedBreeds,
    selectedHealth,
    selectedSizes,
    showFavorites,
    onApply,
  ]);

  const handleReset = useCallback(() => {
    setAgeRange([0, maxAge]);
    setSelectedBreeds([]);
    setSelectedHealth([]);
    setSelectedSizes([]);
    setShowFavorites(false);
  }, [maxAge]);

  const selectedCount =
    (ageRange[0] > 0 || ageRange[1] < maxAge ? 1 : 0) +
    selectedBreeds.length +
    selectedHealth.length +
    selectedSizes.length +
    (showFavorites ? 1 : 0);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <LinearGradient
                colors={[Colors.primary, Colors.primary]}
                style={styles.header}
              >
                <AppText style={styles.title}>Filtros de Búsqueda</AppText>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={26} color="#fff" />
                </TouchableOpacity>
              </LinearGradient>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                  <AppText style={styles.sectionTitle}>Preferencias</AppText>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setShowFavorites((s) => !s)}
                      style={[
                        styles.chip,
                        showFavorites && styles.chipSelected,
                        Platform.OS === 'ios' && styles.chipShadow,
                        { paddingHorizontal: 12 },
                      ]}
                    >
                      <AppText
                        style={[
                          styles.chipText,
                          showFavorites && styles.chipTextSelected,
                        ]}
                      >
                        <Ionicons
                          name={showFavorites ? 'heart' : 'heart-outline'}
                          size={14}
                          color={Colors.text}
                          style={{ marginRight: 10 }}
                        />
                        Solo favoritos
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.section}>
                  <AppText style={styles.sectionTitle}>Edad (meses)</AppText>
                  <AppText style={styles.range}>
                    {ageRange[0]} - {ageRange[1]} meses
                  </AppText>
                  <MultiSlider
                    values={ageRange}
                    min={0}
                    max={maxAge}
                    step={1}
                    onValuesChange={(v) => setAgeRange([v[0], v[1]])}
                    selectedStyle={{ backgroundColor: Colors.primary }}
                    markerStyle={{
                      backgroundColor: Colors.secondary,
                      height: 20,
                      width: 20,
                      borderRadius: 10,
                    }}
                    trackStyle={{ height: 5 }}
                  />
                </View>

                {breeds.length > 0 && (
                  <FilterGroup
                    title="Raza"
                    items={breeds}
                    selected={selectedBreeds}
                    onToggle={(v) => toggleItem(v, setSelectedBreeds)}
                  />
                )}

                {healthStatus.length > 0 && (
                  <FilterGroup
                    title="Estado de salud"
                    items={healthStatus}
                    selected={selectedHealth}
                    onToggle={(v) => toggleItem(v, setSelectedHealth)}
                  />
                )}

                {sizes.length > 0 && (
                  <FilterGroup
                    title="Tamaño"
                    items={sizes}
                    selected={selectedSizes}
                    onToggle={(v) => toggleItem(v, setSelectedSizes)}
                  />
                )}
              </ScrollView>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.reset]}
                  onPress={handleReset}
                >
                  <AppText style={styles.resetText}>Reiniciar</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.apply]}
                  onPress={handleApply}
                >
                  <AppText style={styles.applyText}>
                    Aplicar {selectedCount > 0 && `(${selectedCount})`}
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

const FilterGroup = ({
  title,
  items,
  selected,
  onToggle,
}: {
  title: string;
  items: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) => (
  <View style={styles.section}>
    <AppText style={styles.sectionTitle}>{title}</AppText>
    <View style={styles.chips}>
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          activeOpacity={0.7}
          style={[
            styles.chip,
            selected.includes(item) && styles.chipSelected,
            Platform.OS === 'ios' && styles.chipShadow,
          ]}
          onPress={() => onToggle(item)}
        >
          <AppText
            style={[
              styles.chipText,
              selected.includes(item) && styles.chipTextSelected,
            ]}
          >
            {item}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fafafa',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: fontWeightBold,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomColor: '#f2f2f2',
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: fontWeightBold,
    marginBottom: 10,
    color: '#333',
  },
  range: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 15,
    fontSize: 14,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.secondary,
  },
  chipShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  chipText: { color: Colors.text, fontSize: 14 },
  chipTextSelected: { color: Colors.text, fontWeight: fontWeightBold },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopColor: '#f2f2f2',
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  reset: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  apply: {
    backgroundColor: Colors.primary,
  },
  applyText: { color: Colors.text, fontWeight: fontWeightBold },
  resetText: { color: Colors.text, fontWeight: fontWeightBold },
});

export default FiltroCan;
