// components/Pagination.tsx
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
import { Colors } from '@/src/constants/colors';

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
          color={currentPage === 1 ? '#bdbdbd' : '#424242'}
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
          color={currentPage === totalPages ? '#bdbdbd' : '#424242'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
    borderColor: '#ECEFF1',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlDisabled: {
    borderColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
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
    backgroundColor: '#FAFAFA',
    borderColor: '#ECEFF1',
  },
  pageActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.secondary,
  },
  pageText: {
    color: '#424242',
    fontWeight: '600',
    fontSize: 15,
  },
  pageTextActive: {
    color: '#FAFAFA',
    fontWeight: '700',
  },
  ellipsis: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    backgroundColor: '#FAFAFA',
  },
  ellipsisText: {
    color: '#9E9E9E',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Pagination;
