import { useLocalSearchParams } from 'expo-router';
import { Text, StyleSheet, ActivityIndicator, ScrollView, View } from 'react-native';
import { useEffect, useState } from 'react';
import { api } from '../../../src/services/api';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '../../../src/context/ThemeContext'; 
import { Colors } from '../../../constants/Colors'; 

import ButtonAdd from '@/app/components/ButtonAdd';
import { 
  ChevronRight, 
  Plus, 
  ShoppingBasket, 
  ShoppingCart, 
  CreditCard, 
  UserRoundPen,
  Trash2
} from 'lucide-react-native';

import { useNavigation } from '@react-navigation/native';

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

  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;

  const navigation = useNavigation();

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchClient = async () => {
      try {
        const response = await api.get<Client>(`/clients/${id}`);
        setClient(response.data);

        // Define o título dinamicamente
        if (response.data) {
          navigation.setOptions({
            title: response.data.nome,  // Atualiza o título com o nome do cliente
          });
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes do cliente:', error);
      }
    };

    fetchClient();
  }, [id, navigation]);

  if (!client) {
    return (
      <ThemedView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
     

        <View style={styles.buttonSection}>
          <ButtonAdd 
            onPress={() => {}}
            label="Adicionar Compra"
            iconLeft={<Plus size={24} color={colors.success} />} 
            iconRight={<ShoppingBasket size={24} color={colors.success} />}  
          />
          <ButtonAdd 
            onPress={() => {}}
            iconRight={<ShoppingCart size={24} color={colors.success} />} 
            label="Ver Compras" 
          />
          <ButtonAdd 
            onPress={() => {}}
            iconLeft={<Plus size={24} color={colors.success} />} 
            iconRight={<CreditCard size={24} color={colors.success} />}  
            label="Adicionar Pagamento" 
          />
        </View>

        {/* Seção de edição e exclusão */}
        <View style={styles.buttonSection}>
          <ButtonAdd 
            onPress={() => {}}
            iconRight={<UserRoundPen size={24} color={colors.success} />}  
            label="Editar cliente" 
          />
          <ButtonAdd 
            onPress={() => {}}
            iconRight={<Trash2 size={24} color={colors.error} />}  
            label="Excluir cliente"
            type="danger" 
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSection: {
    marginBottom: 20,
  },
});
