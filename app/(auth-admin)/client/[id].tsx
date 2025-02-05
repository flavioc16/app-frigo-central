import { useLocalSearchParams } from 'expo-router';
import { Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { api } from '../../../src/services/api';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

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
    return <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff0000" />
          </ThemedView>
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText >{id}</ThemedText>
      <ThemedText style={styles.title}>{client.nome}</ThemedText>
      <ThemedText>Email: {client.email ?? "Não informado"}</ThemedText>
      <ThemedText>Telefone: {client.telefone}</ThemedText>
      <ThemedText>Endereço: {client.endereco ?? "Não informado"}</ThemedText>
      <ThemedText>Referência: {client.referencia ?? "Não informado"}</ThemedText>
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
