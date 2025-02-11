import { useEffect, useState, useMemo } from 'react';
import { FlatList, View, ActivityIndicator, Text, StyleSheet, Pressable, TouchableOpacity, Modal } from 'react-native';
import { Tag, MapPin, ChevronRight, X } from "lucide-react-native";
import { api } from '../../../../src/services/api';
import { ThemedText } from '../../../../components/ThemedText'; 
import { useRouter } from 'expo-router';
import { useTheme } from '../../../../src/context/ThemeContext';
import { Colors } from '../../../../constants/Colors';
import ButtonAdd from '@/app/components/ButtonAdd';
import SearchInput from '@/app/components/SearchInput';
import CreateClientModal from './CreateClientModal';

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
  

  //modal
  const [modalVisible, setModalVisible] = useState(false); // Estado do modal

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
              
              <TouchableOpacity onPress={() => router.push(`/(auth-admin)/client/${item.id}`)} >
                <ChevronRight size={25} color={colors.icon} style={styles.chevronIcon} />
              </TouchableOpacity>
            </Pressable>
          )}
          ListFooterComponent={<View style={{ height: 75 }} />}
        />
      )}

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
  
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalText: {
    fontSize: 16,
    marginVertical: 5,
  },
  modalButton: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
  },
  fullscreenModal: {
    flex: 1,
    paddingTop: 20, // Ajuste para evitar sobreposição com a barra de status
    alignItems: 'center',
  },
});
