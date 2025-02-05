import React, { forwardRef } from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

type ThemedInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  inputStyle?: object;
};

export const ThemedInput = forwardRef<TextInput, ThemedInputProps>(
  ({ style, lightColor, darkColor, inputStyle, ...rest }, ref) => {
    const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
    const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
    const placeholderColor = useThemeColor({ light: '#888', dark: '#aaa' }, 'placeholder'); // Busca a cor do placeholder

    return (
      <TextInput
        ref={ref}
        style={[
          { backgroundColor, color: textColor },
          inputStyle,
          style,
        ]}
        placeholderTextColor={placeholderColor} // Cor dinâmica para o placeholder
        {...rest}
      />
    );
  }
);

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
});
