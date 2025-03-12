import { useLocalSearchParams } from 'expo-router';
import { 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  View, 
  FlatList, 
  Keyboard, 
  TouchableOpacity, 
  InteractionManager, 
  Platform, 
  Alert
} from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../../src/services/api';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '../../../src/context/ThemeContext'; 
import { Colors } from '../../../constants/Colors'; 
import ThemedPurchaseItemAdmin from '@/components/ThemedPurchaseItemAdmin';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import SearchInput from '@/app/components/SearchInput';
import { format, parseISO } from 'date-fns';
import ButtonAdd from '@/app/components/ButtonAdd';
import { Plus } from 'lucide-react-native';
import axios from 'axios';
import CreatePurchaseModal from '../../(auth-admin)/purchase/components/CreatePurchaseModal';
import EditPurchaseModal from '../../(auth-admin)/purchase/components/EditPurchaseModal';
import PurchaseBottomSheet from '../../(auth-admin)/purchase/components/PurchaseBottomSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import PaymentModal from '../../(auth-admin)/payment/components/CreatePaymentModal';
import ConfirmModal from '@/app/components/ConfirmModal';
import PurchaseInfoModal from '../../(auth-admin)/purchase/components/InfoPurchaseModal';

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

export default function ListPurchasesClientId() {
  const { listPurchasesClientId } = useLocalSearchParams();
  const [compras, setCompras] = useState<{ compras: Compra[]; somaTotalCompras: number }>({ compras: [], somaTotalCompras: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); 
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;
  const navigation = useNavigation();
  const [createPurchaseModalVisible, setCreatePurchaseModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [infoPurchaseModalVisible, setInfoPurchaseModalVisible] = useState(false);
  const [editPurchaseModalVisible, setEditPurchaseModalVisible] = useState(false);
  const [purchaseId , setPurchaseId] = useState('');
  const [purchaseName, setPurchaseName] = useState<string | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => {
    if (Platform.OS === 'ios') {
      return ['34%', '80%'];
    } else if (Platform.OS === 'android') {
      return ['35%', '85%'];  
    } else {
      return ['35%', '75%'];
    }
  }, []);

  const handleOpenBottomSheet = useCallback((id: string, name: string) => {
    setPurchaseId(id);
    setPurchaseName(name);
  
    InteractionManager.runAfterInteractions(() => {
      bottomSheetRef.current?.present();
    });
  }, []);
  
  const handleBottomSheetChange = useCallback((index: number) => {
    if (index === -1) {
      bottomSheetRef.current?.close();
    }
  }, [snapPoints]);

  const onInfoPurchase = (id: string) => {
    bottomSheetRef.current?.close();
    setPurchaseId(id);
    setInfoPurchaseModalVisible(true);
  };

  const onEditPurchase = (id: string) => {
    bottomSheetRef.current?.close();
    setPurchaseId(id);
    setEditPurchaseModalVisible(true);
  };

  const onDeletePurchase = (id: string) => {
    bottomSheetRef.current?.close();
    setPurchaseId(id);  
    setConfirmModalVisible(true);
  };
 
  const handleConfirmDelete = async (id: string) => {
    if (!id) {
      return;
    }
    try {
      const response = await api.delete(`/compras`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: { id },
      });

      updatePurchases();
      
    } catch (error) {

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'Erro ao excluir compra.';
        Alert.alert('Erro!', errorMessage);
      } else {
        Alert.alert('Erro!', 'Erro desconhecido.');
      }
    } finally {
      setConfirmModalVisible(false);
      setPurchaseId('');
    }
  };
    
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
  }, [listPurchasesClientId, navigation,]);

  const updatePurchases = async () => {
    try {
      const response = await api.get(`/clients/purchases/${listPurchasesClientId}/compras`);
      setCompras({ compras: response.data.compras, somaTotalCompras: response.data.somaTotalCompras });
    } catch (error) {
      console.error('Erro ao buscar detalhes do cliente e compras:', error);
    }
  }

  useEffect(() => {
    updatePurchases();
  }, [compras]);

  const calculateTotal = (filteredPurchases: Compra[]): number => {
    return filteredPurchases.reduce((total, compra) => total + compra.totalCompra, 0);
  };

  function formatDate(dateString: string): string {
    if (!dateString) return '';

    let date: Date;

  
    try {
      date = parseISO(dateString);
    } catch (error) {
      console.error("Erro ao analisar a data:", error);
      return ''; 
    }

    // Verifica se a data é válida
    if (isNaN(date.getTime())) return ''; // Retorna vazio caso seja inválida

    // Retorna a data formatada no padrão brasileiro
    return format(date, 'dd/MM/yyyy');
  }

  const filteredCompras = compras.compras.filter((compra) => {

    const formattedDateCompra = compra.dataDaCompra ? formatDate(compra.dataDaCompra) : "";


    const searchLower = searchQuery.toLowerCase();

    const formatCurrency = (value: number): string => {
      return value.toFixed(2).replace('.', ',');
    };

    return (
      compra.descricaoCompra.toLowerCase().includes(searchLower) ||
      formattedDateCompra.includes(searchLower) ||
      formatCurrency(compra.totalCompra).includes(searchLower) ||
      compra.totalCompra.toString().includes(searchLower)
    );
  });

  const somaTotalFiltradas = calculateTotal(filteredCompras);

  if (loading) {
    return (
      <ThemedView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.containerHeader}>
        <SearchInput
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          placeholder="Buscar por descrição, data ou valor"
        />
        <ButtonAdd
          onPress={() => {
            Keyboard.dismiss();
            setCreatePurchaseModalVisible(true);
          }}
          iconRight={<Plus size={24} color={colors.success} />} 
          label="Cadastrar Compra"
        />
      </View>
   
      <FlatList
        showsVerticalScrollIndicator={false}
        data={filteredCompras}
        ListEmptyComponent={() => (
          <View style={styles.emptyContent}>
            <Text style={[styles.noDataText, { color: colors.text }]}>Nenhuma compra encontrada.</Text>
          </View>
        )}
        renderItem={({ item }) => <ThemedPurchaseItemAdmin onOptionsPress={handleOpenBottomSheet} {...item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 5 }, 
          filteredCompras.length === 0 && styles.emptyListContent
        ]} 
        style={styles.flatList}
      />
      {somaTotalFiltradas > 0 && (
        <>
        {Platform.OS === 'ios' &&   (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              borderTopWidth: theme === 'dark' ? 0.2 : 0.7,
              borderColor: colors.border,
              paddingLeft: 30,
              paddingRight: 30,
            }}
          />
        )}
          <View style={[styles.separator, { borderColor: colors.cardBackground }]} />
          <View style={[styles.footer]}>
            <View style={styles.footerTotalContainer}>
              <Text style={[styles.footerTotalText, { color: colors.text }]}>
                {searchQuery ? 'Subtotal por consulta' : 'Total em débito'}
              </Text>
              <Text style={[styles.footerTotalValue, { color: colors.text }]}>
                {`${new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(somaTotalFiltradas)}`}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setPaymentModalVisible(true)}
              style={[styles.roundButton, { backgroundColor: colors.success }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.roundButtonText]}>Pagamento</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      <CreatePurchaseModal
        visible={createPurchaseModalVisible}
        onClose={() => setCreatePurchaseModalVisible(false)}
        updatePurchases={updatePurchases}
        clienteId={listPurchasesClientId}
      />
      <PurchaseBottomSheet
        selectedPurchaseId={purchaseId}
        selectedPurchaseName={purchaseName}
        colors={colors}
        onInfoPurchase={onInfoPurchase}
        onEditPurchase={onEditPurchase}
        onDeletePurchase={onDeletePurchase}
        bottomSheetRef={bottomSheetRef}
        snapPoints={snapPoints}
        onChange={handleBottomSheetChange}
      />
      <ConfirmModal
        idToDelete={purchaseId}
        visible={confirmModalVisible}
        onConfirm={() => handleConfirmDelete(purchaseId)}
        onCancel={() => setConfirmModalVisible(false)}
        title="Excluir Compra"
        message="Tem certeza de que deseja excluir essa compra?"
      />
      <EditPurchaseModal
        visible={editPurchaseModalVisible}
        onClose={() => setEditPurchaseModalVisible(false)}
        updatePurchases={updatePurchases}
        purchaseId={purchaseId}
      />

      <PaymentModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        id={listPurchasesClientId}
        valor={compras.somaTotalCompras}
        updatePurchases={() => updatePurchases()}
      />

      <PurchaseInfoModal 
        visible={infoPurchaseModalVisible} 
        onClose={() => setInfoPurchaseModalVisible(false)} 
        purchaseId={purchaseId ?? ''} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBlockStart: 16,
    paddingBlockEnd: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyListContent: {
    flex: 1, 
    justifyContent: 'center', 
  },
  emptyContent: {
    flex: 1,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic', // Aplica o itálico corretamente
  },
  separator: {
    height: 1,
    borderTopWidth: 0.5,
    marginTop: 10,
  },
  footer: {
    height: 100,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  roundButton: {
    width: 140,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  
  },
  themedContainer: {
    flex: 1,
  },
  noResults: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
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
  containerHeader: {
   paddingHorizontal: 15,
  },
  footerTotalContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  footerTotalText: {
    fontSize: 14,
    color: 'gray',

  },
  footerTotalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  roundButtonText: {
    fontSize: 16,  
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600', 
  }
});
