import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, FlatList, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { AuthContext } from '../../src/context/AuthContext';
import { api } from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemedPurchaseItem from '@/components/ThemedPurchaseItem';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { RefreshControl } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

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
  const { user } = useContext(AuthContext);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [compras, setCompras] = useState<{ compras: Compra[]; somaTotalCompras: number }>({
    compras: [],
    somaTotalCompras: 0,
  });
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const colors = Colors[theme];
  const router = useRouter();

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


  const handleRefresh = async () => {
    if (!currentUser?.client || !currentUser?.client[0]?.id) {
      console.log('Cliente não encontrado ou ID inválido');
      return;
    }

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    setLoading(true);

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
        console.error('Erro ao atualizar compras:', error.message);
      } else {
        console.error('Erro desconhecido ao atualizar compras');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      handleRefresh();
    }
  }, [currentUser]);

  return (
    <ThemedView style={styles.container}>
      {loading && compras.compras.length === 0 ? (
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
            contentContainerStyle={
              compras.compras.length === 0 ? styles.emptyContent : styles.listContent
            }
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={handleRefresh}
                colors={['#b62828', '#FF4500']}
                tintColor={colors.tint}
              />
            }
          />
        </View>
      )}

      {!loading && compras?.somaTotalCompras > 0 && (
        <ThemedView
          style={[
            styles.footer,
            {
              borderTopColor: colors.border,
              ...(Platform.OS === 'android' && { marginBottom: 50 }),
            },
          ]}
        >
          <ThemedText style={styles.footerText}>
            Total em débitos:{' '}
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(compras.somaTotalCompras)}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100,
  },
  contentContainer: {
    flex: 1,
    marginBottom: 25,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
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
    borderTopWidth: 0.5,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  footerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
