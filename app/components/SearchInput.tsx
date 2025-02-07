import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { X, Search } from "lucide-react-native";
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../src/context/ThemeContext';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchInput({ value, onChangeText, placeholder = "Buscar..." }: SearchInputProps) {
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: colors.inputBackground }]}>
      <Search size={20} color={colors.icon} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")} style={styles.clearButton}>
          <X size={20} color={colors.icon} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginBottom: 9,
    height: 40,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    marginHorizontal: 10,
  },
  clearButton: {
    padding: 5,
  },
});
