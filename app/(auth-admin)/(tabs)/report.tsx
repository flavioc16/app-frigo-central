import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '../../../src/context/ThemeContext'; // Importa o contexto de tema

export default function TabOneScreen() {
  const { theme, colors, toggleTheme } = useTheme(); // Obtém o tema e as cores

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="defaultSemiBold" style={{ fontSize: 20 }}>
            Relatórios
          </ThemedText>
        </ThemedView>

        {/* Exibe o tema atual */}
        <ThemedText type="defaultSemiBold" style={{ marginTop: 10 }}>
          Tema atual: {theme}
        </ThemedText>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.buttonBackground }]}
          onPress={toggleTheme}
        >
          <ThemedText type="defaultSemiBold" style={{ color: colors.buttonText }}>
            Mudar Tema
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomEndRadius: 10,
  },
  button: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
  },
});
