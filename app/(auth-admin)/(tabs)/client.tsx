import { StyleSheet, Text, View } from 'react-native';
import ThemedClientItem from '@/app/(auth-admin)/client/components/ThemedClientItem';
import { useTheme } from '../../../src/context/ThemeContext'; // Importando o contexto de tema
import { Colors } from '../../../constants/Colors';  // Verifique se o caminho está correto

export default function ClientScreen() {
  const { theme } = useTheme(); // Obtém o tema do contexto
  const colors = Colors[theme] || Colors.light; // Garantir que sempre haja um fallback

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.titleContainer}>
       
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
    marginTop: '8%',
    borderBottomEndRadius: 10,
  },
});
