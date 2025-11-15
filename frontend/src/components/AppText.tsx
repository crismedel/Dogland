import React from 'react';
import { Text, TextProps, StyleProp, TextStyle } from 'react-native';
import { fonts } from '../../src/constants/fontFamily';

interface AppTextProps extends TextProps {
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

export const fontWeightBold = '800';
export const fontWeightSemiBold = '700';
export const fontWeightMedium = '600';

export function AppText({ style, children, ...props }: AppTextProps) {
  return (
    <Text style={[{ fontFamily: fonts.montserrat }, style]} {...props}>
      {children}
    </Text>
  );
}
