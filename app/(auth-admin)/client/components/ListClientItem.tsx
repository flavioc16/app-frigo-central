import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { FlatList, 
  View, 
  ActivityIndicator, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  InteractionManager,
  RefreshControl 
} from 'react-native';
import { MapPin, Plus, EllipsisVertical, IdCard, } from "lucide-react-native";
import { api } from '../../../../src/services/api';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from '../../../../components/ThemedText'; 
import { useRouter } from 'expo-router';
import { useTheme } from '../../../../src/context/ThemeContext';
import { Colors } from '../../../../constants/Colors';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import ButtonAdd from '@/app/components/ButtonAdd';
import SearchInput from '@/app/components/SearchInput';
import CreateClientModal from './CreateClientModal';
import EditClientModal from './EditClientModal';
import ClientBottomSheet from './ClientBottomSheet';
import ConfirmModal from '@/app/components/ConfirmModal';
import CreatePurchaseModal from '../../purchase/components/CreatePurchaseModal';
import * as Haptics from 'expo-haptics';

export interface Client {
  id: string;
  nome: string;
  email?: string;
  telefone: string;
  endereco?: string;
  referencia?: string;
}

export default function ListClientItem() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [purchaseClientId, setPurchaseClientId] = useState<string | string[]>([]);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => {
    if (Platform.OS === 'ios') {
      return ['40%', '80%'];
    } else if (Platform.OS === 'android') {
      return ['40%', '85%'];  
    } else {
      return ['48%', '75%'];
    }
  }, []);

  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null);

  const handleOpenBottomSheet = useCallback((id: string, name: string) => {
    InteractionManager.runAfterInteractions(() => {
      setSelectedClientId(id);
      setSelectedClientName(name);
      bottomSheetRef.current?.present();
    });
  }, []);

  const handleBottomSheetChange = useCallback((index: number) => {
    if (index === -1) {
      setSelectedClientId(undefined);
      setSelectedClientName(null);
    }
  }, [snapPoints]);

  const handleAddPurchase = (id: string) => {
    setPurchaseModalVisible(true);
    setPurchaseClientId(id);
    bottomSheetRef.current?.close();
  };
  
  const handleViewPurchases = (id: string) => {
    router.push(`/(auth-admin)/client/${id}`);
    bottomSheetRef.current?.close();
  };
  
  const handleEditClient = (id: string) => {
    setEditModalVisible(true);
    setSelectedClientId(id);
    bottomSheetRef.current?.close();
  };
  
  const handleDeleteClient = (id: string) => {
    bottomSheetRef.current?.close();
    setClientToDelete(id); 
    setDeleteModalVisible(true); 
  };

  const handleConfirmDelete = async () => {
    if (clientToDelete) {
      try {
        await api.delete(`/clients`, {
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            id: clientToDelete,
          },
        });
        updateClients();
        bottomSheetRef.current?.close();
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível excluir o cliente.');
      } finally {
        setDeleteModalVisible(false);
        setClientToDelete(null);
      }
    }
  };
  
  const handleCancelDelete = () => {
    setDeleteModalVisible(false); 
    setClientToDelete(null); // 
  };
  const fetchClients = async () => {
    setError(null);
  
    try {
      const response = await api.get<Client[]>("/clients");
      setClients(response.data);
  
      await AsyncStorage.setItem("cachedClients", JSON.stringify(response.data));
    } catch (err) {
      setError("Erro ao buscar clientes.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const loadCachedClients = async () => {
      const cachedData = await AsyncStorage.getItem("cachedClients");
      if (cachedData) {
        setClients(JSON.parse(cachedData));
        setLoading(false);
      } else {
        fetchClients(); 
      }
    };
  
    loadCachedClients();
  }, []);
  
const updateClients = async () => {
    await fetchClients();
  };

const handleRefresh = () => {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  }
  updateClients();
};

  const filteredClients = useMemo(() => {
    if (search.trim() === '') {
      return clients;
    }
    const lowerSearch = search.toLowerCase();
    return clients.filter(client =>
      Object.values(client).some(value =>
        value?.toString().toLowerCase().includes(lowerSearch)
      )
    );
  }, [search, clients]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (error) {
    return <Text style={[styles.error, { color: colors.error }]}>{error}</Text>;
  }

  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.themedContainer, { flex: 1 }]}>
          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nome, referência ou endereço"
          />
  
          <ButtonAdd
            onPress={() => {
              Keyboard.dismiss();
              setModalVisible(true);
            }}
            iconRight={<Plus size={24} color={colors.success} />} 
            label="Cadastrar Cliente"
          />
  
          {filteredClients.length === 0 && search.length > 0 ? (
            <ThemedText style={[styles.noResults, { color: colors.text }]}>Nenhum cliente encontrado.</ThemedText>
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={filteredClients}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    router.push(`/(auth-admin)/client/${item.id}`);
                  }}
                  style={[styles.clientContainer, { backgroundColor: colors.cardBackground }]}
                  activeOpacity={0.8}
                >
                  <View style={styles.clientInfo}>
                    <Text style={[styles.name, { color: colors.text }]}>{item.nome}</Text>
                    {item.referencia && (
                      <View style={styles.infoRow}>
                        <IdCard size={16} color={colors.icon} />
                        <Text style={[styles.info, { color: colors.text }]}>{item.referencia}</Text>
                      </View>
                    )}
                    {item.endereco && (
                      <View style={styles.infoRow}>
                        <MapPin size={16} color={colors.icon} />
                        <Text style={[styles.info, { color: colors.text }]}>{item.endereco}</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => {
                    Keyboard.dismiss();
                    handleOpenBottomSheet(item.id, item.nome);
                  }}>
                    <EllipsisVertical size={25} color={colors.icon} style={styles.chevronIcon} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
              ListFooterComponent={<View style={{ height: 75 }} />}
              refreshControl={
                <RefreshControl
                  refreshing={loading} 
                  onRefresh={handleRefresh} 
                  colors={["#b62828", "#FF4500"]} 
                  tintColor={colors.tint}
                />
              }
            />
          )}
          <ConfirmModal
            visible={deleteModalVisible}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            title="Excluir Cliente"
            message="Tem certeza que deseja excluir este cliente?"
            confirmText="Excluir"
            cancelText="Cancelar"
          />
          <ClientBottomSheet
            selectedClientId={selectedClientId} 
            selectedClientName={selectedClientName}
            colors={colors}
            onAddPurchase={handleAddPurchase}
            onViewPurchases={handleViewPurchases}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
            bottomSheetRef={bottomSheetRef}
            snapPoints={snapPoints}
            onChange={handleBottomSheetChange}
          />
          <EditClientModal 
            visible={editModalVisible} 
            onClose={() => setEditModalVisible(false)} 
            updateClients={updateClients} 
            clientId={selectedClientId!} 
          />
          <CreatePurchaseModal
            visible={purchaseModalVisible} 
             onClose={() => setPurchaseModalVisible(false)}
            clienteId={purchaseClientId} 
          />
          <CreateClientModal 
            visible={modalVisible} 
            onClose={() => setModalVisible(false)} 
            updateClients={updateClients} 
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientContainer: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clientInfo: {
    flex: 1,
  },
  name: {
    marginBottom: 4,
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  info: {
    fontSize: 14,
  },
  error: {
    textAlign: 'center',
    marginTop: 10,
  },
  themedContainer: {
    flex: 1,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontStyle: 'italic'
  },
  chevronIcon: {
    marginLeft: 10,
  },
  overlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.01)', // Cor de fundo semitransparente
    zIndex: 1,
  },
});