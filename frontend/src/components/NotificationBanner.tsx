import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const NotificationBanner = ({
  title,
  message,
  color = '#0275d8',
}: {
  title?: string;
  message: string;
  color?: string;
}) => (
  <View style={[styles.box, { backgroundColor: color }]}>
    {title && <Text style={styles.title}>{title}</Text>}
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  box: {
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  title: { color: '#fff', fontWeight: 'bold' },
  text: { color: '#fff', fontSize: 14 },
});
