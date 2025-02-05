import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "../../src/context/AuthContext";

export default function Layout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen
          name="login" // Nome da tela
          options={{
            headerShown: false, // Desativa o cabeçalho
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
