import React, { forwardRef } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../src/context/ThemeContext";

interface InputFormProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  autoFocus?: boolean;
  required?: boolean;
}

const InputForm = forwardRef<TextInput, InputFormProps>(
  ({ label, value, onChangeText, placeholder = "Digite...", error, secureTextEntry = false, autoFocus = false, required = false }, ref) => {
    const { theme } = useTheme();
    const colors = Colors[theme] || Colors.light;

    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}>
          <TextInput
            ref={ref} // Passando ref para o TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={placeholder}
            placeholderTextColor={colors.placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            autoFocus={autoFocus}
          />
        </View>
        {(error || (required && !value)) && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error || "Campo obrigatório"}
          </Text>
        )}
      </View>
    );
  }
);

export default InputForm;

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 3,
    marginLeft : 5,
  },
});
