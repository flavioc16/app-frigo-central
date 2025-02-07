import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Plus, ChevronRight } from "lucide-react-native";
import { ThemedText } from '../../components/ThemedText';
import { useTheme } from '../../src/context/ThemeContext';
import { Colors } from '../../constants/Colors';

interface AddClientButtonProps {
  onPress: () => void;
  label: string;
}

export default function ButtonAdd({ onPress, label }: AddClientButtonProps) {
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;
 
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.inputBackground }]} 
      onPress={onPress}
    >
      <View style={[styles.content, { flexDirection: 'row', alignItems: 'center' }]}> 
        <Plus size={24} color={colors.success} />
        <ThemedText style={[styles.text, { color: colors.success }]}>{label}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginStart: 10,
    marginEnd: 10,
    height: 50,
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 17,
    marginLeft: 8,
  },
  chevron: {
    marginLeft: '40%',
  },
});
