import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

type ThemedButtonProps = {
  title: string;
  onPress: () => void;
  lightBackgroundColor?: string; // Cor de fundo para o tema claro
  darkBackgroundColor?: string; // Cor de fundo para o tema escuro
  lightTextColor?: string; // Cor do texto para o tema claro
  darkTextColor?: string; // Cor do texto para o tema escuro
};

export function ThemedButton({
  title,
  onPress,
  lightBackgroundColor,
  darkBackgroundColor,
  lightTextColor,
  darkTextColor,
}: ThemedButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark
    ? darkBackgroundColor || Colors.dark.tint
    : lightBackgroundColor || Colors.light.tint;

  const textColor = isDark
    ? darkTextColor || Colors.dark.text
    : lightTextColor || Colors.light.text;

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
