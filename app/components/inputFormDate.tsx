import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../src/context/ThemeContext";
import DateTimePickerModal from "react-native-modal-datetime-picker"; // Importando o modal de data
import { Calendar } from "lucide-react-native";

interface DateInputProps {
  label?: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

const DateInput = ({ label, value, onChangeText, placeholder = "Selecione a data...", error, required = false }: DateInputProps) => {
    const { theme } = useTheme();
    const colors = Colors[theme] || Colors.light;
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    // Abre o modal do DateTimePicker
    const handleDatePress = () => {
      setDatePickerVisibility(true);
    };

    const handleConfirm = (date: Date) => {
      const formattedDate = date.toISOString().split("T")[0]; // Formata a data para yyyy-mm-dd
      onChangeText?.(formattedDate); // Atualiza o estado com a data selecionada
      setDatePickerVisibility(false); // Fecha o modal
    };

    return (
      <View style={styles.container}>
        {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
        <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={placeholder}
            placeholderTextColor={colors.placeholder}
            value={value}
            editable={false} // Não permite digitação manual
            onFocus={handleDatePress} // Ao clicar no campo, abre o calendário
          />
          {/* Ícone de calendário do lucide-react */}
          <TouchableOpacity onPress={handleDatePress} style={styles.iconContainer}>
            <Calendar size={20} color={colors.icon} />
          </TouchableOpacity>
        </View>

        {/* Modal para selecionar a data */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={() => setDatePickerVisibility(false)} // Fecha o modal
        />

        {(error || (required && !value)) && (
          <Text style={[styles.errorText, { color: colors.error }]}>{error || "Campo obrigatório"}</Text>
        )}
      </View>
    );
};

export default DateInput;

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
    paddingLeft: 10,
  },
  errorText: {
    fontSize: 12,
    marginTop: 3,
    marginLeft: 5,
  },
});
