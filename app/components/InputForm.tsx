import React, { forwardRef, useState } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity, KeyboardTypeOptions, GestureResponderEvent } from "react-native";
import { Eye, EyeOff } from "lucide-react-native"; // Importando ícones
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../src/context/ThemeContext";

interface InputFormProps {
  label?: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  autoFocus?: boolean;
  required?: boolean;
  maskFunction?: (text: string) => string;
  keyboardType?: KeyboardTypeOptions; // Adicionando keyboardType
  editable?: boolean;
  onPressIn?: (event: GestureResponderEvent) => void;
  rightIcon?: React.ReactNode; // Nova propriedade para ícone à direita
  onFocus?: () => void;
}

const InputForm = forwardRef<TextInput, InputFormProps>(
  ({ 
    label, 
    value, 
    onChangeText, 
    placeholder = "Digite...", 
    error, 
    secureTextEntry = false, 
    autoFocus = false, 
    required = false, 
    maskFunction, 
    keyboardType = "default", 
    rightIcon,
    onFocus
  }, ref) => { 
    const { theme } = useTheme();
    const colors = Colors[theme] || Colors.light;
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
      <View style={styles.container}>
        {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
        <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}>
          <TextInput
            ref={ref}
            style={[styles.input, { color: colors.text }]}
            placeholder={placeholder}
            placeholderTextColor={colors.placeholder}
            value={value}
            onChangeText={(text) => onChangeText?.(maskFunction ? maskFunction(text) : text)}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            autoFocus={autoFocus}
            autoCapitalize="none"
            keyboardType={keyboardType}
            onFocus={onFocus}
          />
          {secureTextEntry && (
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              {isPasswordVisible ? (
                <Eye size={20} color={colors.icon} />
              ) : (
                <EyeOff size={20} color={colors.icon} />
              )}
            </TouchableOpacity>
          )}
          {rightIcon && (
            <TouchableOpacity
            onPress={onFocus}
            style={styles.iconContainer}>
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
        {(error || (required && !value)) && (
          <Text style={[styles.errorText, { color: colors.error }]}>{error || "Campo obrigatório"}</Text>
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
  iconContainer: {
    padding: 5, // Ajuste de espaço ao redor do ícone
  },
  errorText: {
    fontSize: 12,
    marginTop: 3,
    marginLeft: 5,
  },
});
