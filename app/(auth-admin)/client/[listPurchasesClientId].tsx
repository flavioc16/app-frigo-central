import { useLocalSearchParams } from 'expo-router';
import { Text, StyleSheet, ActivityIndicator, ScrollView, View, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { api } from '../../../src/services/api';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '../../../src/context/ThemeContext'; 
import { Colors } from '../../../constants/Colors'; 
import ThemedPurchaseItem from '@/components/ThemedPurchaseItem';
import { useNavigation } from '@react-navigation/native';

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

interface Client {
  id: string;
  nome: string;
}

export default function listPurchasesClientId() {
  const { listPurchasesClientId } = useLocalSearchParams();
  const [compras, setCompras] = useState<{ compras: Compra[]; somaTotalCompras: number }>({ compras: [], somaTotalCompras: 0 });
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;
  const navigation = useNavigation();

  useEffect(() => {
    if (!listPurchasesClientId || typeof listPurchasesClientId !== 'string') return;

    const fetchClientAndPurchases = async () => {
      try {
        const clientResponse = await api.get<Client>(`/clients/${listPurchasesClientId}`);
        if (clientResponse.data) {
          navigation.setOptions({ title: clientResponse.data.nome });
        }

        const response = await api.get(`/clients/purchases/${listPurchasesClientId}/compras`);
       
        setCompras({ compras: response.data.compras, somaTotalCompras: response.data.somaTotalCompras });
      } catch (error) {
        console.error('Erro ao buscar detalhes do cliente e compras:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientAndPurchases();
  }, [listPurchasesClientId, navigation]);

  if (loading) {
    return (
      <ThemedView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={compras.compras}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ThemedPurchaseItem {...item} />}
        ListEmptyComponent={<Text style={styles.noDataText}>Nenhuma compra encontrada.</Text>}
        contentContainerStyle={compras.compras.length === 0 ? styles.emptyContent : styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      {compras.somaTotalCompras > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Total em débitos: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(compras.somaTotalCompras)}
          </Text>
        </View>
      )}
    </ThemedView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#8a8a8a',
  },
  footerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  themedContainer: {
    flex: 1,
  },
  noResults: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  clientContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  clientInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  info: {
    fontSize: 14,
    marginLeft: 8,
  },
  chevronIcon: {
    marginLeft: 16,
  },
});

