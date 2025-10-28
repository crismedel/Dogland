// app/settings/feedback.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native'; // <- TextInput nativo
import CustomHeader from '@/src/components/UI/CustomHeader';
import CustomButton from '@/src/components/UI/CustomButton';
import { AppText } from '@/src/components/AppText';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';

export default function FeedbackScreen() {
  const [text, setText] = useState('');

  const send = async () => {
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
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />
      <View style={styles.card}>
        <AppText>Cuéntanos tu opinión o reporta un problema:</AppText>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Escribe aquí..."
          placeholderTextColor="#9C815F"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFDF4',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F2D8A7',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F2D8A7',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    minHeight: 200,
    color: '#7A5C3A',
  },
  buttonGroup: {
    marginTop: 20, // Espaciado consistente entre botones
  },
});
