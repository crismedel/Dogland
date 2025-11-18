import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native'; // <- TextInput nativo
import CustomHeader from '@/src/components/UI/CustomHeader';
import CustomButton from '@/src/components/UI/CustomButton';
import { AppText } from '@/src/components/AppText';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

export default function FeedbackScreen() {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);

  const [text, setText] = useState('');

  const send = async () => {
    // Aquí iría tu lógica para enviar el feedback
    setText('');
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Enviar feedback"
        leftComponent={
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {/* 4. Usar colores del tema (texto oscuro sobre fondo amarillo) */}
            <Ionicons
              name="chevron-back"
              size={24}
              color={isDark ? colors.lightText : colors.text}
            />
          </TouchableOpacity>
        }
      />
      <View style={styles.card}>
        <AppText style={styles.cardText}>
          Cuéntanos tu opinión o reporta un problema:
        </AppText>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Escribe aquí..."
          placeholderTextColor={colors.darkGray} // 4. Usar colores del tema
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        <View style={styles.buttonGroup}>
          <CustomButton title="Enviar" onPress={send} icon="send-outline" />
        </View>
      </View>
    </View>
  );
}

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background, // Dinámico
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
    card: {
      backgroundColor: colors.cardBackground, // Dinámico
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.secondary, // Dinámico
    },
    cardText: {
      color: colors.text,
      fontSize: 16,
    },
    input: {
      backgroundColor: colors.background, // Dinámico
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
      borderRadius: 8,
      padding: 12,
      paddingTop: 12,
      marginTop: 12,
      minHeight: 200,
      color: colors.text, // Dinámico
      fontSize: 16,
    },
    buttonGroup: {
      marginTop: 20,
    },
  });