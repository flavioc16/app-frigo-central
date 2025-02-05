import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { useColorScheme } from '@/hooks/useColorScheme'; // Hook personalizado para tema
import { AuthContext } from '../../../src/context/AuthContext';
import { useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router'; // Importa o useRouter

export default function PaymentsScreen() {
  const { signOut } = useContext(AuthContext);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="defaultSemiBold" style={{ fontSize: 20 }}>
            Pagamentos
          </ThemedText>
        </ThemedView>
      </View>
      <ThemedButton
        title="Sair"
        onPress={signOut} // Função para realizar o logout
        lightBackgroundColor="#b62828" // Vermelho no tema claro
        darkBackgroundColor="#b62828" // Vermelho no tema escuro
        lightTextColor="#FFFFFF" // Branco no tema claro
        darkTextColor="#E0F2F1" // Branco-esverdeado no tema escuro
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Centraliza verticalmente
    alignItems: 'center', // Centraliza horizontalmente
    padding: 16,
  },
  content: {
    width: '100%', // Garante que o conteúdo ocupe toda a largura da tela
    alignItems: 'center', // Alinha os itens no centro horizontalmente
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Alinha texto e aceno na mesma linha
    gap: 8,
    borderBottomEndRadius: 10,
  },
});
