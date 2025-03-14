import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  FlatList,
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
  RefreshControl,
  Pressable
} from "react-native";
import { Plus, EllipsisVertical, CalendarCheck, RefreshCcw, Calendar } from "lucide-react-native";
import { api } from "../../../../src/services/api";
import { ThemedText } from "../../../../components/ThemedText";
import { useTheme } from "../../../../src/context/ThemeContext";
import { Colors } from "../../../../constants/Colors";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import ButtonAdd from "@/app/components/ButtonAdd";
import SearchInput from "@/app/components/SearchInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from 'expo-haptics';
import NetInfo from "@react-native-community/netinfo";
import InputForm from "@/app/components/InputForm";
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePicker2 from '@react-native-community/datetimepicker';

export interface Cliente {
    id: string;
    nome: string;
    endereco: string;
    referencia: string;
    email: string;
    telefone: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Juros {}
  
  export interface Pagamento {
    id: string;
    valorPagamento: number;
    clienteId: string;
    userId: string;
    created_at: string;
    updated_at: string;
    compraId: string;
  }
  
  export interface Compra {
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
    userId: string;
    clienteId: string;
    pagamentoId: string | null;
    cliente: Cliente;
    juros: Juros[];
    pagamentos: Pagamento[];
  }
  
  export interface RelatorioComprasResponse {
    compras: Compra[];
    somaTotalCompras: number;
  }
  

  export default function ListReportItem() {
    const [reports, setReports] = useState<Compra[]>([]);
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

    const fetchReports = async () => {
      setError(null);
  
      try {
        const response = await api.get<RelatorioComprasResponse>("/relatorio/compras", {
          params: {
            dataInicio,
            dataFim
          }
        });
  
        setReports(response.data.compras);
        setSomaTotal(response.data.somaTotalCompras);
        await AsyncStorage.setItem("cachedReports", JSON.stringify(response.data.compras));
  
      } catch (err) {
        setError("Erro ao buscar relatórios.");
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      const loadCachedReports = async () => {
        const cachedData = await AsyncStorage.getItem("cachedReports");
        if (cachedData) {
          setReports(JSON.parse(cachedData));
          setLoading(false);
        } else {
          fetchReports();
        }
      };
  
      loadCachedReports();
  
      const unsubscribe = NetInfo.addEventListener((state) => {
        if (state.isConnected) {
          fetchReports();
        }
      });
  
      return () => unsubscribe();
    }, []);
  
    const handleRefresh = () => {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
      fetchReports();
    };
  
    const filteredReports = useMemo(() => {
      if (search.trim() === "") return reports;
  
      const lowerSearch = search.toLowerCase();
      return reports.filter(report => 
        report.descricaoCompra.toLowerCase().includes(lowerSearch) ||
        report.cliente.nome.toLowerCase().includes(lowerSearch)
      );
    }, [search, reports]);
  
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
                placeholder="Buscar por descrição ou cliente" 
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
                        <View style={[styles.reportContainer, { 
                            backgroundColor: item.isVencida === 1 
                                ? colors.error 
                                : item.statusCompra === 1 
                                ? colors.success 
                                : colors.cardBackground 
                            }]}>
                            <View style={styles.reportInfo}>
                                <Text style={[styles.client, { color: colors.text }]}>
                                    {`${item.cliente.nome}`}
                                </Text>
                                <View style={styles.dateContainer}>
                                    <CalendarCheck size={16} color={colors.icon} />
                                    <Text style={[styles.date, { color: colors.text }]}>
                                        {formatDate(item.dataDaCompra)}
                                    </Text>
                                </View>
                                <Text style={[styles.descricao, { color: colors.text }]}>
                                    {item.descricaoCompra}
                                </Text>
                                
                                <Text style={[styles.valorCompra, { color: colors.text }]}>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalCompra)}
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
            {!showPicker && !showPicker2 && (
                <Text style={[styles.totalText, { color: colors.text }]}>
                    Total consultado: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(somaTotal)}
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
