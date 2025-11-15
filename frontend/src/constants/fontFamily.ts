import * as Font from 'expo-font';
import { useState, useEffect } from 'react';

const customFonts = {
  'Montserrat-SemiBold': require('../../assets/fonts/Montserrat-SemiBold.ttf'),
  'Nunito-Regular': require('../../assets/fonts/Nunito-Regular.ttf'),
  'Quicksand-Medium': require('../../assets/fonts/Quicksand-Medium.ttf'),
  'Roboto-Regular': require('../../assets/fonts/Roboto-Regular.ttf'),
  'Chewy-Regular': require('../../assets/fonts/Chewy-Regular.ttf'),
};

export function useCustomFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync(customFonts);
        setFontsLoaded(true);
      } catch (error) {
        console.warn('Error cargando fuentes:', error);
      }
    }
    loadFonts();
  }, []);

  return fontsLoaded;
}

export const fonts = {
  montserrat: 'Montserrat-SemiBold',
  nunito: 'Nunito-Regular',
  quicksand: 'Quicksand-Medium',
  roboto: 'Roboto-Regular',
  chewy: 'Chewy-Regular',
};
