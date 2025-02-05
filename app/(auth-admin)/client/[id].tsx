import { useLocalSearchParams } from 'expo-router';
import { Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useEffect, useState } from 'react';
import { api } from '../../../src/services/api';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '../../../src/context/ThemeContext'; // Importando o contexto de tema
import { Colors } from '../../../constants/Colors'; // Verifique se o caminho está correto

interface Client {
  id: string;
  nome: string;
  email?: string;
  telefone: string;
  endereco?: string;
  referencia?: string;
}

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams();
  const [client, setClient] = useState<Client | null>(null);

  const { theme } = useTheme(); // Obtém o tema do contexto
  const colors = Colors[theme] || Colors.light; // Garantir que sempre haja um fallback

  useEffect(() => {
    if (!id || typeof id !== 'string') return; // Garante que o id é válido

    const fetchClient = async () => {
      try {
        const response = await api.get<Client>(`/clients/${id}`);
        setClient(response.data);
      } catch (error) {
        console.error('Erro ao buscar detalhes do cliente:', error);
      }
    };

    fetchClient();
  }, [id]);

  if (!client) {
    return (
      <ThemedView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#ff0000" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{client.nome}</Text>
      <ThemedText style={{ color: colors.text }}>Email: {client.email ?? "Não informado"}</ThemedText>
      <ThemedText style={{ color: colors.text }}>Telefone: {client.telefone}</ThemedText>
      <ThemedText style={{ color: colors.text }}>Endereço: {client.endereco ?? "Não informado"}</ThemedText>
      <ThemedText style={{ color: colors.text }}>Referência: {client.referencia ?? "Não informado"}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
