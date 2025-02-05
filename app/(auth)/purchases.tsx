import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, FlatList, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { AuthContext } from '../../src/context/AuthContext';
import { api } from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemedPurchaseItem from '@/components/ThemedPurchaseItem';
import { useRouter } from 'expo-router';

interface Compra {
  id: string;
  descricaoCompra: string;
  totalCompra: number;
  valorInicialCompra: number;
  tipoCompra: number;
  statusCompra: number;
  created_at: string;
  updated_at: string;
  dataDaCompra: string;
  dataVencimento: string;
  isVencida: number;
}

export default function DetailsScreen() {
  const { user } = useContext(AuthContext); // Pega o usuário do contexto de autenticação
  const [currentUser, setCurrentUser] = useState<any>(null); // Armazena o usuário logado
  const [compras, setCompras] = useState<{ compras: Compra[]; somaTotalCompras: number }>({
    compras: [],
    somaTotalCompras: 0,
  });
  const [loading, setLoading] = useState(true); // Estado para gerenciar carregamento
  const router = useRouter(); // Gerencia navegação

  // Buscar usuário do AsyncStorage ou contexto
  useEffect(() => {
    const fetchUser = async () => {
      const userFromStorage = await AsyncStorage.getItem('@frigorifico');
      if (userFromStorage) {
        setCurrentUser(JSON.parse(userFromStorage));
      } else {
        setCurrentUser(user);
      }
    };

    fetchUser();
  }, [user]);

  // Buscar as compras
  useEffect(() => {
    const fetchCompras = async () => {
      if (!currentUser?.client || !currentUser?.client[0]?.id) {
        console.log('Cliente não encontrado ou ID inválido');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/cliente/${currentUser.client[0].id}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });

        setCompras({
          compras: response.data.compras,
          somaTotalCompras: response.data.somaTotalCompras,
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Erro ao buscar compras:', error.message);
        } else {
          console.error('Erro desconhecido ao buscar compras');
        }
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchCompras();
    }
  }, [currentUser]);

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ae2121" />
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <FlatList
            data={compras.compras}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ThemedPurchaseItem
                id={item.id}
                descricaoCompra={item.descricaoCompra}
                totalCompra={item.totalCompra}
                valorInicialCompra={item.valorInicialCompra}
                tipoCompra={item.tipoCompra}
                statusCompra={item.statusCompra}
                created_at={item.created_at}
                updated_at={item.updated_at}
                dataDaCompra={item.dataDaCompra}
                dataVencimento={item.dataVencimento}
                isVencida={item.isVencida}
              />
            )}
            ListEmptyComponent={
              <ThemedText style={styles.noDataText}>Nenhuma compra encontrada.</ThemedText>
            }
            contentContainerStyle={compras.compras.length === 0 ? styles.emptyContent : styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
        )}
        {!loading && compras?.somaTotalCompras > 0 && (
          <ThemedView style={[styles.footer, Platform.OS === 'android' && { marginBottom: 100 }]}>
            <ThemedText style={styles.footerText}>
              Total em débitos: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(compras.somaTotalCompras)}
            </ThemedText>
          </ThemedView>
        )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end', // Garantir que o conteúdo ocupe o máximo de espaço possível, mas deixe o rodapé fixo no final
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100,
  },
  contentContainer: {
    flex: 1, // A lista de compras deve ocupar o espaço restante
    marginBottom: 100, // Espaço para a tab fixa, ajuste conforme necessário
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 80, // Espaço para o rodapé
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    height: 80,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopColor: '#8a8a8a',
    borderTopWidth: 0.5,
    position: 'absolute',
    bottom: 0, // Fixa o rodapé no final da tela
    width: '100%',
  },
  footerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
