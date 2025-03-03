import React, { useState, useRef, useContext, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity,
  StyleSheet, 
  ActivityIndicator, 
  TextInput, 
  Alert, 
  Platform, 
  FlatList, 
  Pressable
} from 'react-native';
import { Calendar, X } from 'lucide-react-native';
import { useTheme } from '../../../../src/context/ThemeContext';
import { Colors } from '../../../../constants/Colors';
import InputForm from '@/app/components/InputForm';
import { ThemedText } from '@/components/ThemedText';
import { AuthContext } from '@/src/context/AuthContext'; 
import { api } from '@/src/services/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import InputFormDropdown from './InputFormDropdown';
import InputFormDropdownProducts from './InputFormDropdownProducts';

export interface Compra {
  descricaoCompra: string;
  dataDaCompra: string;
  valorInicialCompra: number;
  totalCompra: number;
  tipoCompra: number;
  clienteId: string | string[];
  statusCompra: number;
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  precoAVista: number;
  precoAPrazo: number;
}

interface EditPurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  updatePurchases?: () => void;
  purchaseId: string | null;
  onCloseBottomSheet?: () => void;

}

const EditPurchaseModal: React.FC<EditPurchaseModalProps> = ({ onCloseBottomSheet, visible, onClose, updatePurchases, purchaseId }) => {
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;
  const { user } = useContext(AuthContext); 
  const token = user?.token; 

  const [id, setId] = useState('');
  const [descricaoCompra, setDescricaoCompra] = useState('');
  const [dataDaCompra, setDataDaCompra] = useState(new Date());
  const [totalCompra, setTotalCompra] = useState('');
  const [tipoCompra, setTipoCompra] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const descricaoRef = useRef<TextInput>(null);
  const dataRef = useRef<TextInput>(null);
  const totalRef = useRef<TextInput>(null);
  const tipoRef = useRef<TextInput>(null);

  const formatCurrency = (value: string | number) => {
    // Se for uma string, converta para número, considerando que o ponto já é um separador decimal
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(",", ".")) : value;
  
    // Formata o valor como um número com 2 casas decimais
    return new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };
  
  const unformatCurrency = (value: string) => {
    return value.replace(/\./g, '').replace(',', '.');
  };

  const capitalizeFirstLetter = (text: string) => {
    return text
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const fetchPurchase = async () => {
      if (!purchaseId || !token || !visible) return;
  
      setIsLoading(true);
      try {
        const response = await api.get(`/compras/${purchaseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const purchase = response.data;
        setId(purchase.id); // Não há mais dependência do 'id' aqui
        setDescricaoCompra(purchase.descricaoCompra);
        setDataDaCompra(new Date(purchase.dataDaCompra));
        setTotalCompra(formatCurrency(purchase.totalCompra.toString())); // Formata o valor ao carregar
        setTipoCompra(purchase.tipoCompra.toString());
      } catch (error) {
        console.error("Erro ao buscar compra", error);
        Alert.alert("Erro", "Não foi possível carregar os dados da compra.");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchPurchase();
  }, [purchaseId, visible, token]);
  
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await api.get('/produtos', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (Array.isArray(response.data)) {
          setProdutos(response.data);
        } else {
          console.error("Produtos não encontrados.");
        }
      } catch (error) {
        console.error("Erro ao buscar produtos", error);
        Alert.alert("Erro", "Não foi possível carregar os produtos.");
      }
    };

    if (token) {
      fetchProdutos();
    }
  }, [token]);

  const handleUpdatePurchase = async () => {
    setSubmitted(true);
  
    // Verifica se o token e o ID da compra estão presentes
    if (!token) {
      console.error("Usuário não autenticado ou ID da compra não encontrado.");
      return;
    }

    setLoading(true);
  
    try {
      // Prepara os dados da compra para serem enviados ao backend
      const purchaseData = {
        id: id, 
        descricaoCompra,
        totalCompra: parseFloat(unformatCurrency(totalCompra)), 
        tipoCompra: parseInt(tipoCompra, 10),
        statusCompra: 0, 
        created_at: new Date().toISOString(), 
        dataDaCompra: dataDaCompra.toISOString(), 
      };
  
      await api.put('/compras', purchaseData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
    
      setLoading(false);
      onClose();
  
       if (onCloseBottomSheet) onCloseBottomSheet()
      if (updatePurchases) updatePurchases();
       
    } catch (error) {
      
      setLoading(false);
      console.error("Erro ao atualizar compra", error);
      Alert.alert("Erro", "Não foi possível atualizar a compra.");
    }
  };

  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
  };

  const onChange = (event: any, selectedDate: Date | undefined) => {
    if (event.type === 'set' && selectedDate) {
      const currentDate = selectedDate || dataDaCompra;
      setDataDaCompra(currentDate);
    } else if (event.type === 'dismissed' || !selectedDate) {
      toggleDatePicker();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        ) : (
          <FlatList
            data={[1]}
            keyExtractor={(item) => item.toString()}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            renderItem={() => (
              <View style={styles.modalContent}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Editar Compra</Text>

                {!showPicker && (
                  <Pressable onPress={toggleDatePicker}>
                    <InputForm
                      label="Data"
                      value={dataDaCompra.toLocaleDateString('pt-BR')}
                      error={submitted && !dataDaCompra.toISOString().trim() ? 'A data é obrigatória' : ''}
                      editable={false}
                      ref={dataRef}
                      onPressIn={toggleDatePicker}
                      onFocus={toggleDatePicker}
                      rightIcon={<Calendar size={20} color={colors.icon} />}
                    />
                  </Pressable>
                )}
                {showPicker && (
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <DateTimePicker
                      value={dataDaCompra}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                      onChange={onChange}
                      locale="pt-BR"
                      style={{
                        width: '100%',
                        backgroundColor: theme === 'dark' ? '#2A2D35' : '#fff',
                        borderRadius: 8,
                      }}
                    />
                    {Platform.OS === 'ios' && (
                      <View style={{ flexDirection: 'row', gap: 130, marginTop: 10 }}>
                        <TouchableOpacity
                          onPress={() => {
                            setShowPicker(false);
                          }}
                          style={{
                            backgroundColor: '#ae2121',
                            borderRadius: 8,
                            padding: 8,
                            width: 100,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirmar</Text>
                        </TouchableOpacity>
    
                        <TouchableOpacity
                          onPress={toggleDatePicker}
                          style={{
                            backgroundColor: '#7e1a1a',
                            borderRadius: 8,
                            padding: 8,
                            width: 100,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                <InputFormDropdownProducts
                  label="Descrição"
                  placeholder="Digite ou selecione um produto..."
                  value={capitalizeFirstLetter(descricaoCompra)}
                  setValue={setDescricaoCompra}
                  produtos={produtos}
                />
                <InputForm
                  label="Total"
                  value={totalCompra}
                  onChangeText={(text) => setTotalCompra(formatCurrency(text))} // Formata o valor ao digitar
                  placeholder="0,00"
                  keyboardType="numeric"
                  ref={totalRef}
                />
                <InputFormDropdown
                  label="Tipo de Serviço"
                  value={tipoCompra}
                  setValue={setTipoCompra}
                />

                <TouchableOpacity
                  onPress={handleUpdatePurchase}
                  style={[styles.button, loading && styles.disabledButton]}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                      Atualizar
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            )}
          />
        )}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={30} color={colors.icon} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingTop: 30,
  },
  modalContent: {
    padding: 25,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 10,
    padding: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#ae2121',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#7e1a1a',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
  },
});

export default EditPurchaseModal;