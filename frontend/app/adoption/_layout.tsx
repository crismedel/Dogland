import { Stack } from "expo-router";
import React from "react";

const AdopcionesLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      
      <Stack.Screen
        name="perfilCan"
        options={{
          title: "Perfil canino",
          headerStyle: { backgroundColor: "#4A90E2" },
          headerTintColor: "#fff",
          headerShown: true,
        }}
      />
    </Stack>
  );
};

export default AdopcionesLayout;
