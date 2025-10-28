import { View } from 'react-native';
import { Slot, Stack } from 'expo-router';
import React from 'react';

const _layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Todas las pantallas de (alerts) van sin header */}
    </Stack>
  );
};

export default _layout;
