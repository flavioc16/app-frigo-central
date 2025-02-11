import { StyleSheet, Text, View } from 'react-native';
import ThemedClientItem from '@/app/(auth-admin)/client/components/ThemedClientItem';
import { useTheme } from '../../../src/context/ThemeContext'; // Importando o contexto de tema
import { Colors } from '../../../constants/Colors';  // Verifique se o caminho está correto
import { Search } from 'lucide-react-native';
import SearchInput from '@/app/components/SearchInput';

export default function ClientScreen() {
  const { theme } = useTheme(); // Obtém o tema do contexto
  const colors = Colors[theme] || Colors.light; // Garantir que sempre haja um fallback

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.titleContainer}>
        <Text style={{ fontSize: 20, color: colors.text , fontWeight: 'bold', marginBottom: 10}}>
          Clientes
        </Text>
      </View>
      <ThemedClientItem />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: '10%',
    borderBottomEndRadius: 10,
  },
});
