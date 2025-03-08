import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../src/context/ThemeContext'; // Importando o contexto de tema
import { Colors } from '../../../constants/Colors';  // Verifique se o caminho está correto

export default function ClientScreen() {
  const { theme } = useTheme(); // Obtém o tema do contexto
  const colors = Colors[theme] || Colors.light; // Garantir que sempre haja um fallback

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.titleContainer}>
        <Text style={{ fontSize: 20, color: colors.text , fontWeight: 'bold'}}>
          Produtos
        </Text>
      </View>
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
