import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { AppText } from '@/src/components/AppText';
import { Ionicons } from '@expo/vector-icons';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';

// 2. Importar el hook y el tipo de 'theme'
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  buttonSize?: number;
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  buttonSize = 44,
}) => {
  // 3. Llamar al hook y generar los estilos DENTRO del componente
  const { colors } = useTheme();
  const styles = getStyles(colors);

  if (totalPages <= 1) return null;

  const delta = 1; // muestra 1 previo y 1 siguiente alrededor de la página actual

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    pages.push(1);

    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    if (left > 2) {
      pages.push('left-ellipsis');
    } else {
      for (let i = 2; i < left; i++) pages.push(i);
    }

    for (let i = left; i <= right; i++) pages.push(i);

    if (right < totalPages - 1) {
      pages.push('right-ellipsis');
    } else {
      for (let i = right + 1; i < totalPages; i++) pages.push(i);
    }

    if (totalPages > 1) pages.push(totalPages);

    return pages.filter((v, idx, arr) => arr.indexOf(v) === idx);
  };

  const pages = getPageNumbers();

  const onPrev = () => onPageChange(clamp(currentPage - 1, 1, totalPages));
  const onNext = () => onPageChange(clamp(currentPage + 1, 1, totalPages));

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        onPress={onPrev}
        disabled={currentPage === 1}
        style={[
          styles.control,
          currentPage === 1 && styles.controlDisabled,
          { width: buttonSize, height: buttonSize, borderRadius: 10 },
        ]}
        accessibilityLabel="Página anterior"
      >
        <Ionicons
          name="chevron-back"
          size={20}
          // 4. Usar colores del hook
          color={currentPage === 1 ? colors.darkGray : colors.text}
        />
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.pagesContainer,
          { flexGrow: 1, justifyContent: 'center' },
        ]}
      >
        {pages.map((p, idx) =>
          typeof p === 'number' ? (
            <TouchableOpacity
              key={String(p) + idx}
              onPress={() => onPageChange(p)}
              activeOpacity={0.8}
              style={[
                styles.page,
                currentPage === p ? styles.pageActive : styles.pageInactive,
                { width: buttonSize, height: buttonSize, borderRadius: 10 },
              ]}
              accessibilityLabel={`Página ${p}`}
            >
              <AppText
                style={[
                  styles.pageText,
                  currentPage === p && styles.pageTextActive,
                ]}
              >
                {p}
              </AppText>
            </TouchableOpacity>
          ) : (
            <View
              key={String(p) + idx}
              style={[
                styles.ellipsis,
                { width: buttonSize, height: buttonSize, borderRadius: 10 },
              ]}
            >
              <Text style={styles.ellipsisText}>…</Text>
            </View>
          ),
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={onNext}
        disabled={currentPage === totalPages}
        style={[
          styles.control,
          currentPage === totalPages && styles.controlDisabled,
          { width: buttonSize, height: buttonSize, borderRadius: 10 },
        ]}
        accessibilityLabel="Página siguiente"
      >
        <Ionicons
          name="chevron-forward"
          size={20}
          // 4. Usar colores del hook
          color={currentPage === totalPages ? colors.darkGray : colors.text}
        />
      </TouchableOpacity>
    </View>
  );
};

// 5. Convertir el StyleSheet en una función que acepte los colores
const getStyles = (colors: ColorsType) =>
  StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      gap: 10,
      backgroundColor: 'transparent',
    },
    control: {
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
      backgroundColor: colors.cardBackground, // Dinámico
      alignItems: 'center',
      justifyContent: 'center',
    },
    controlDisabled: {
      borderColor: colors.gray, // Dinámico
      backgroundColor: colors.cardBackground, // Dinámico
      // Puedes agregar un 'opacity: 0.7' si lo deseas
    },
    pagesContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      gap: 8,
    },
    page: {
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    pageInactive: {
      backgroundColor: colors.cardBackground, // Dinámico
      borderColor: colors.gray, // Dinámico
    },
    pageActive: {
      backgroundColor: colors.primary, // Dinámico
      borderColor: colors.secondary, // Dinámico
    },
    pageText: {
      color: colors.text, // Dinámico
      fontWeight: '600',
      fontSize: 15,
    },
    pageTextActive: {
      color: colors.text, // Dinámico (Texto oscuro sobre fondo primario)
      fontWeight: '700',
    },
    ellipsis: {
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
      backgroundColor: colors.cardBackground, // Dinámico
    },
    ellipsisText: {
      color: colors.darkGray, // Dinámico
      fontSize: 18,
      fontWeight: '600',
    },
  });

export default Pagination;