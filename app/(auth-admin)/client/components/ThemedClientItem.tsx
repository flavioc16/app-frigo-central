import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { FlatList, View, ActivityIndicator, Text, StyleSheet, Pressable, TouchableOpacity, Alert } from 'react-native';
import { Tag, MapPin, Plus, EllipsisVertical, } from "lucide-react-native";
import { api } from '../../../../src/services/api';
import { ThemedText } from '../../../../components/ThemedText'; 
import { useRouter } from 'expo-router';
import { useTheme } from '../../../../src/context/ThemeContext';
import { Colors } from '../../../../constants/Colors';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import ButtonAdd from '@/app/components/ButtonAdd';
import SearchInput from '@/app/components/SearchInput';
import CreateClientModal from './CreateClientModal';
import ClientBottomSheet from './ClientBottomSheet';
import ConfirmModal from '@/app/components/ConfirmModal';


export interface Client {
  id: string;
  nome: string;
  email?: string;
  telefone: string;
  endereco?: string;
  referencia?: string;
}

export default function ThemedClientItem() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;

  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['40%','65%','90%'], []);
  const [currentSnapPoint, setCurrentSnapPoint] = useState<string>('25%');
  const [overlayVisible, setOverlayVisible] = useState(false); 
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null);

  const handleOpenBottomSheet = useCallback((id: string, name: string) => {
    setSelectedClientId(id);
    setSelectedClientName(name);
    bottomSheetRef.current?.present();
  }, []);

  const handleBottomSheetChange = useCallback((index: number) => {
    setOverlayVisible(index !== -1);
    setCurrentSnapPoint(snapPoints[index]);
  }, [snapPoints]);

  const handleAddPurchase = (id: string) => {
    Alert.alert('Adicionar Compra', `ID do cliente: ${id}`);
  };
  
  const handleViewPurchases = (id: string) => {
    Alert.alert('Ver Compras', `ID do cliente: ${id}`);
  };
  
  const handleEditClient = (id: string) => {
    Alert.alert('Editar Cliente', `ID do cliente: ${id}`);
  };
  
  const handleDeleteClient = (id: string) => {
    setClientToDelete(id); // Armazena o ID do cliente a ser excluído
    setDeleteModalVisible(true); // Abre o modal de confirmação
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
        Alert.alert('Sucesso', 'Cliente excluído com sucesso!');
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

  const renderBackdrop: React.FC<BottomSheetBackdropProps> = (props) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
    />
  );

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get<Client[]>('/clients');
        setClients(response.data);
      } catch (err) {
        setError('Erro ao buscar clientes.');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [clients]);

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
    <View style={[styles.themedContainer]}>
      <SearchInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por nome, referência ou endereço"
      />

      <ButtonAdd
        onPress={() => setModalVisible(true)}
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
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(auth-admin)/client/${item.id}`)}
              style={[styles.clientContainer, { backgroundColor: colors.cardBackground }]}
              android_ripple={{ color: 'transparent' }}
            >
              <View style={styles.clientInfo}>
                <Text style={[styles.name, { color: colors.text }]}>{item.nome}</Text>

                {item.referencia && (
                  <View style={styles.infoRow}>
                    <Tag size={16} color={colors.icon} />
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

              <TouchableOpacity onPress={() => handleOpenBottomSheet(item.id, item.nome)}>
                <EllipsisVertical size={25} color={colors.icon} style={styles.chevronIcon} />
              </TouchableOpacity>
            </Pressable>
          )}
          ListFooterComponent={<View style={{ height: 75 }} />}
        />
      )}

      <ConfirmModal
        visible={deleteModalVisible}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Excluir Cliente"
        message="Tem certeza que deseja excluir este cliente?"
        confirmText= "Excluir"
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
  
      <CreateClientModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
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