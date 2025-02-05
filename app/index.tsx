import React from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { useTheme } from '../src/context/ThemeContext'; // Importando o contexto de tema
import { Colors } from '../constants/Colors';  // Importando as cores

export default function IndexScreen() {
  const { theme } = useTheme(); // Obtém o tema do contexto
  const colors = Colors[theme] || Colors.light; // Garantir que sempre haja um fallback

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color="#ae2121" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
