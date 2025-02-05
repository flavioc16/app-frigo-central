import { useEffect, useState, useMemo } from 'react';
import { FlatList, View, ActivityIndicator, Text, StyleSheet, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { X, Search, Tag, MapPin, ChevronRight } from "lucide-react-native";
import { api } from '../src/services/api';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText'; 
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext'; // Importa o contexto de tema
import { Colors } from '../constants/Colors'; // Importa as cores definidas

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

  const { theme } = useTheme(); // Obtém o tema atual do contexto
  const colors = Colors[theme] || Colors.light; // Garante que sempre haja um fallback

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
  }, []);

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
    <ThemedView style={[styles.themedContainer, { backgroundColor: colors.background }]}>
      <ThemedView style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}>
        <Search size={20} color={colors.icon} />
        <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar por nome, referência ou endereço"
            placeholderTextColor={colors.placeholder}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")} style={styles.clearButton}>
            <X size={20} color={colors.icon} />
          </TouchableOpacity>
        )}
      </ThemedView>

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
            
              <TouchableOpacity onPress={() => router.push(`/(auth-admin)/client/${item.id}`)}>
                <ChevronRight size={25} color={colors.icon} style={styles.chevronIcon} />
              </TouchableOpacity>

            </Pressable>
          )}
          ListFooterComponent={<View style={{ height: 75 }} />}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    margin: 10,
    height: 40,
  },
  inputContainer: {
    flex: 1,
    borderRadius: 8,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 5,
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
  chevronIcon: {
    marginRight: 5,
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
  },  
});
