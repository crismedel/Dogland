import React, { useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  TextStyle,
  ViewStyle,
  View,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: keyof typeof Ionicons.glyphMap;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 5,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.button,
          styles[variant],
          styles.shadow3D,
          disabled && styles.disabled,
          style,
          pressed && styles.pressedState,
        ]}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.content}>
            {icon && (
              <Ionicons
                name={icon}
                size={20}
                color={
                  variant === 'primary'
                    ? '#2c3e50'
                    : variant === 'secondary'
                    ? '#f2e2c4'
                    : '#f7b500'
                }
                style={{ marginRight: 6 }}
              />
            )}
            <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
              {title}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 180, // ancho uniforme
    alignSelf: 'center',
  },

  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /** ---- VARIANTES ---- */
  primary: {
    backgroundColor: '#f7b500',
    borderWidth: 2,
    borderColor: '#2c3e50',
  },
  primaryText: {
    color: '#2c3e50',
    fontWeight: '800',
    fontSize: 16,
    textAlign: 'center',
  },

  secondary: {
    backgroundColor: '#3a7d44',
    borderWidth: 2,
    borderColor: '#8b5e3c',
  },
  secondaryText: {
    color: '#f2e2c4',
    fontWeight: '800',
    fontSize: 16,
    textAlign: 'center',
  },

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#f7b500',
  },
  outlineText: {
    color: '#f7b500',
    fontWeight: '800',
    fontSize: 16,
    textAlign: 'center',
  },

  disabled: {
    opacity: 0.5,
  },

  text: {
    textAlign: 'center',
    letterSpacing: 0.3,
    color: '#2c3e50',
  },

  /** ---- SOMBRA MATERIAL / EFECTO 3D ---- */
  shadow3D: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4.5,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  pressedState: {
    transform: [{ translateY: 1 }],
  },
});

export default CustomButton;
