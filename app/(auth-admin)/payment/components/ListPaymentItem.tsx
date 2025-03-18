import { useEffect, useState, useMemo} from "react";
import {
  FlatList,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  TouchableOpacity,

  Platform,
  
  RefreshControl,
  Pressable
} from "react-native";
import {CalendarCheck, RefreshCcw, Calendar } from "lucide-react-native";
import { api } from "../../../../src/services/api";
import { useTheme } from "../../../../src/context/ThemeContext";
import { Colors } from "../../../../constants/Colors";
import SearchInput from "@/app/components/SearchInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from 'expo-haptics';
import NetInfo from "@react-native-community/netinfo";
import InputForm from "@/app/components/InputForm";
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePicker2 from '@react-native-community/datetimepicker';

export interface Cliente {
  nome: string;
  referencia: string;
}

export interface Pagamento {
  id: string;
  created_at: string;
  valorPagamento: number;
  cliente: Cliente;
}

export interface DadosPagamentos {
  pagamentos: Pagamento[];
  totalPagamentos: number;
}
  
  export default function ListReportItem() {
    const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
    const [totalPagamentos, setTotalPagamentos] = useState(0);
    const [somaTotal, setSomaTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const { theme } = useTheme();
    const colors = Colors[theme] || Colors.light;
    const [showPicker, setShowPicker] = useState(false);
    const [showPicker2, setShowPicker2] = useState(false);
    const [dataInicio, setDataInicio] = useState(new Date());
    const [dataFim, setDataFim] = useState(new Date());
    const [submitted, setSubmitted] = useState(false);
  
    const formatDate = (date: string) => {
      const formattedDate = new Date(date);
      return formattedDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const toggleDatePicker = () => {
        setShowPicker(!showPicker);
    };

    const toggleDatePicker2 = () => {
        setShowPicker2(!showPicker2);
    };

    const onChangeDateInicio = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setDataInicio(selectedDate);
          setShowPicker(false);
        }
    };

    const onChangeDateFim = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setDataFim(selectedDate);
          setShowPicker2(false);
        }
    };

    const fetchPagamentos = async () => {
      setError(null);
      try {
       
        const formattedDataInicio = dataInicio.toISOString().split("T")[0];
        const formattedDataFim = dataFim.toISOString().split("T")[0];
    
        const response = await api.get<DadosPagamentos>("/pagamentos/entre-datas", {
          params: {
            dataInicio: formattedDataInicio,
            dataFim: formattedDataFim,
          },
        });
    
        setPagamentos(response.data.pagamentos);
        setTotalPagamentos(response.data.totalPagamentos);
        await AsyncStorage.setItem("cachedPagamentos", JSON.stringify(response.data.pagamentos));
      } catch (err) {
        setError("Erro ao buscar pagamentos.");
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      const loadCachedReports = async () => {
        const cachedData = await AsyncStorage.getItem("cachedReports");
        if (cachedData) {
          setPagamentos(JSON.parse(cachedData));
          setLoading(false);
        } else {
          fetchPagamentos();
        }
      };
  
      loadCachedReports();
  
      const unsubscribe = NetInfo.addEventListener((state) => {
        if (state.isConnected) {
          fetchPagamentos();
        }
      });
  
      return () => unsubscribe();
    }, []);
  
    const handleRefresh = () => {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
      fetchPagamentos();
    };
  
    const filteredReports = useMemo(() => {
      if (search.trim() === "") return pagamentos; 
    
      const lowerSearch = search.toLowerCase();
    
      return pagamentos.filter(payment => 
        payment.cliente.nome.toLowerCase().includes(lowerSearch) ||  
        payment.cliente.referencia.toLowerCase().includes(lowerSearch)
        
      );
    }, [search, pagamentos]);

    const totalFiltrado = useMemo(() => {
      return filteredReports.reduce((total, item) => total + item.valorPagamento, 0);
    }, [filteredReports]);
  
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      );
    }
  
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh} activeOpacity={0.8}>
            <RefreshCcw size={22} color={colors.icon} />
            <Text style={[styles.retryText, { color: colors.text }]}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }
  
    return (
        <View style={[styles.themedContainer, { flex: 1 }]}>
            <SearchInput 
                value={search} 
                onChangeText={setSearch} 
                placeholder="Buscar pagamentos por cliente" 
            />
            <View style={styles.dateInputContainer}>
                {!showPicker && (
                    <Pressable onPress={toggleDatePicker}>
                        <InputForm
                            label="Data inicial"
                            value={dataInicio.toLocaleDateString('pt-BR')}
                            error={submitted && !dataInicio.toISOString().trim() ? 'A data é obrigatória' : ''}
                            editable={false}
                            onPressIn={toggleDatePicker}
                            onFocus={toggleDatePicker}
                            rightIcon={<Calendar size={20} color={colors.icon} />}
                        />
                    </Pressable>
                )}

                {!showPicker2 && (
                    <Pressable onPress={toggleDatePicker2}>
                        <InputForm
                            label="Data final"
                            value={dataFim.toLocaleDateString('pt-BR')}
                            error={submitted && !dataFim.toISOString().trim() ? 'A data é obrigatória' : ''}
                            editable={false}
                            onPressIn={toggleDatePicker2}
                            onFocus={toggleDatePicker2}
                            rightIcon={<Calendar size={20} color={colors.icon} />}
                        />
                    </Pressable>
                )}

                {showPicker && (
                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <DateTimePicker
                            value={dataInicio}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                            onChange={onChangeDateInicio}
                            locale="pt-BR"
                            style={{
                                width: '100%',
                                backgroundColor: colors.background,
                            }}
                        />
                    </View>
                )}

                {showPicker2 && (
                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <DateTimePicker2
                            value={dataFim}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                            onChange={onChangeDateFim}
                            locale="pt-BR"
                            style={{
                                width: '100%',
                                backgroundColor: colors.background,
                            }}
                        />
                    </View>
                )}
            </View>
            {!showPicker && !showPicker2 && (
                <FlatList
                showsVerticalScrollIndicator={false}
                data={filteredReports}
                keyExtractor={(item) => item.id}
                maxToRenderPerBatch={10}
                renderItem={({ item }) => (
                  <TouchableOpacity activeOpacity={0.8}>
                    <View style={[styles.reportContainer, { backgroundColor: colors.cardBackground }]}>
                      <View style={styles.reportInfo}>
                        <Text style={[styles.client, { color: colors.text }]}>
                          {item.cliente?.nome} - {item.cliente?.referencia}
                        </Text>
                        <View style={styles.dateContainer}>
                          <CalendarCheck size={16} color={colors.icon} />
                          <Text style={[styles.date, { color: colors.text }]}>
                            {item.created_at ? formatDate(item.created_at) : "Data inválida"}
                          </Text>
                        </View>
                        <Text style={[styles.valorCompra, { color: colors.text }]}>
                          {item.valorPagamento
                            ? new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(item.valorPagamento)
                            : "R$ 0,00"}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
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
            {!showPicker && filteredReports.length > 0 && !showPicker2 && (
              <Text style={[styles.totalText, { color: colors.text }]}>
                Total em pagamento: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFiltrado)}
              </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportContainer: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reportInfo: {
    flex: 1,
  },
  descricao: {
    marginBottom: 4,
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateContainer: {
    flexDirection: 'row',
    marginBlockStart: 4,
  },
  date: {
    fontSize: 14,
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
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    zIndex: 1,
  },
  emptyContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }, errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3, 
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  client: {
    marginBottom: 4,
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateInputContainer: {
    paddingHorizontal: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? '20%' : 0,
  },
  valorCompra: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});
