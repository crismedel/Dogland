// src/contexts/ThemeContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ColorsType } from '@/src/constants/colors';

type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextProps {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  colors: ColorsType;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const THEME_STORAGE_KEY = 'pref_theme';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme(); // 'light' | 'dark'
  const [themePreference, setThemePreference] =
    useState<ThemePreference>('system');

  // Cargar la preferencia guardada al iniciar
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const storedPref = (await AsyncStorage.getItem(
          THEME_STORAGE_KEY,
        )) as ThemePreference | null;
        if (storedPref) {
          setThemePreference(storedPref);
        }
      } catch (e) {
        console.error('Error cargando preferencia de tema:', e);
      }
    };
    loadPreference();
  }, []);

  // Guardar la preferencia cuando cambie
  const handleSetPreference = async (preference: ThemePreference) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
      setThemePreference(preference);
    } catch (e) {
      console.error('Error guardando preferencia de tema:', e);
    }
  };

  // Determinar el tema actual y la paleta de colores
  const { colors, isDark } = useMemo(() => {
    const currentTheme =
      themePreference === 'system' ? systemColorScheme : themePreference;

    if (currentTheme === 'dark') {
      return { colors: darkColors, isDark: true };
    }
    return { colors: lightColors, isDark: false };
  }, [themePreference, systemColorScheme]);

  return (
    <ThemeContext.Provider
      value={{
        themePreference,
        setThemePreference: handleSetPreference,
        colors,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe ser usado dentro de un ThemeProvider");
  }
  return context;
};