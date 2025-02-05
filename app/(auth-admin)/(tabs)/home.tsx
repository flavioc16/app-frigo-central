import { StyleSheet, Text, Switch, View } from 'react-native';
import { useTheme } from '../../../src/context/ThemeContext'; // Importando o contexto de tema
import { Colors } from '../../../constants/Colors';  // Verifique se o caminho está correto
import { ThemedButton } from '@/components/ui/ThemedButton';
import { useContext } from 'react';
import { AuthContext } from '../../../src/context/AuthContext';

export default function ClientScreen() {
  const { theme, toggleTheme } = useTheme(); // Obtém o tema e as cores
  const colors = Colors[theme] || Colors.light; // Garantir que sempre haja um fallback
    const { signOut } = useContext(AuthContext);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.titleContainer}>
        <Text style={{ fontSize: 20, color: colors.text , fontWeight: 'bold'}}>
          Inicio
        </Text>
      </View>
      <View style={styles.switchContainer}>
        <Text style={{ color: colors.text }}>Mudar Tema</Text>
        <Switch
          value={theme === 'dark'}  // Determina o estado do switch com base no tema atual
          onValueChange={toggleTheme}  // Alterna o tema ao mudar o estado do switch
          trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }}
          thumbColor={colors.switchThumb}
        />
        <ThemedButton
          title="Sair"
          onPress={signOut} // Função para realizar o logout
          lightBackgroundColor="#b62828" // Vermelho no tema claro
          darkBackgroundColor="#b62828" // Vermelho no tema escuro
          lightTextColor="#FFFFFF" // Branco no tema claro
          darkTextColor="#E0F2F1" // Branco-esverdeado no tema escuro
        />
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
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
