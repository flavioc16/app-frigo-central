import React, { useState, useRef, useContext, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity,
  Pressable, 
  StyleSheet, 
  ActivityIndicator, 
  TextInput, 
  Alert, 
  Platform
} from 'react-native';
import { Calendar, X } from 'lucide-react-native';
import { useTheme } from '../../../../src/context/ThemeContext';
import { Colors } from '../../../../constants/Colors';
import InputForm from '@/app/components/InputForm';
import { ThemedText } from '@/components/ThemedText';
import { AuthContext } from '@/src/context/AuthContext'; 
import { api } from '@/src/services/api';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateInput from '@/app/components/inputFormDate';

export interface Compra {
  descricaoCompra: string;
  dataDaCompra?: string;
  valorInicialCompra: number;
  totalCompra: number;
  tipoCompra: number;
  clienteId: string | string[];
  statusCompra: number;
}

interface CreatePurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  updatePurchases: () => void;
  clienteId: string | string[];
}

const CreatePurchaseModal: React.FC<CreatePurchaseModalProps> = ({ visible, onClose, updatePurchases, clienteId }) => {
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;
  const { user } = useContext(AuthContext); 
  const token = user?.token; 

  const [descricaoCompra, setDescricaoCompra] = useState('');
  const [dataDaCompra, setDataDaCompra] = useState(new Date());
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [totalCompra, setTotalCompra] = useState('');
  const [tipoCompra, setTipoCompra] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const descricaoRef = useRef<TextInput>(null);
  const dataRef = useRef<TextInput>(null);
  const totalRef = useRef<TextInput>(null);
  const tipoRef = useRef<TextInput>(null);

  // Focar no input de descrição quando o modal é aberto
  useEffect(() => {
    if (visible) {
      descricaoRef.current?.focus();
    }
  }, [visible]);

  const handleAddPurchase = async () => {
    setSubmitted(true);

    if (!descricaoCompra.trim()) {
      descricaoRef.current?.focus();
      return;
    }
    if (!totalCompra.trim()) {
      totalRef.current?.focus();
      return;
    }
    if (!tipoCompra.trim()) {
      tipoRef.current?.focus();
      return;
    }

    if (!token) {
      console.error('Usuário não autenticado. Token não encontrado.');
      return;
    }

    setLoading(true);

    try {
      const purchaseData: Compra = {
        descricaoCompra,
        dataDaCompra : dataDaCompra.toString(),
        totalCompra: parseFloat(totalCompra.replace(',', '.')),
        valorInicialCompra: parseFloat(totalCompra.replace(',', '.')),
        statusCompra: 0,
        tipoCompra: parseInt(tipoCompra, 10),
        clienteId,
      };

      const response = await api.post('/compras', purchaseData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLoading(false);
      setSubmitted(false);
      onClose();
      updatePurchases();

      const descricao = response.data.compra?.descricaoCompra || 'Nova compra';
      Alert.alert('Sucesso!', `Compra "${descricao}" cadastrada com sucesso.`, [{ text: 'OK' }]);

      setDescricaoCompra('');
      setDataDaCompra(new Date());
      setTotalCompra('');
      setTipoCompra('');
    } catch (error) {
      setLoading(false);
      setSubmitted(false);

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error;
        Alert.alert('Erro', errorMessage, [{ text: 'OK' }]);
      } else {
        Alert.alert('Erro', 'Erro desconhecido. Tente novamente.', [{ text: 'OK' }]);
      }
    }
  };

  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
  };

  const onChange = (event: any, selectedDate: Date | undefined) => {
    if (event.type === 'set' && selectedDate) {
      const currentDate = selectedDate || dataDaCompra;
      setDataDaCompra(currentDate);
  
      if (Platform.OS === 'android') {
        toggleDatePicker();
        setDateOfBirth(currentDate.toDateString());
      }
    } else if (event.type === 'dismissed' || !selectedDate) {
      toggleDatePicker(); // Fecha o date picker se o usuário cancelar
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <KeyboardAwareScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          style={styles.modalContent}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>Cadastrar Compra</Text>

          <InputForm
            label="Descrição"
            value={descricaoCompra}
            onChangeText={setDescricaoCompra}
            placeholder="Descrição da compra"
            error={submitted && !descricaoCompra.trim() ? 'A descrição é obrigatória' : ''}
            autoFocus
            ref={descricaoRef}
          />

          {!showPicker && (
            <Pressable onPress={toggleDatePicker}>
              <InputForm
                label="Data da Compra"
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
            <View style={{ alignItems: 'center', flex: 1  }}>
              <DateTimePicker
                value={dataDaCompra}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                onChange={onChange}
                locale="pt-BR"
                style={{ width: '100%', backgroundColor: theme === 'dark' ? '#2A2D35' : '#2A2D35', borderRadius: 8, }}
              />
              {Platform.OS === 'ios' && (
                <View style={{ flexDirection: 'row', gap: 130, marginTop: 10 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowPicker(false);
                      setDateOfBirth(dataDaCompra.toLocaleDateString('pt-BR'));
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
          <InputForm
            label="Valor"
            value={totalCompra}
            onChangeText={setTotalCompra}
            placeholder="0,00"
            error={submitted && !totalCompra.trim() ? 'O valor é obrigatório' : ''}
            keyboardType="numeric"
            ref={totalRef}
          />

          <InputForm
            label="Tipo"
            value={tipoCompra}
            onChangeText={setTipoCompra}
            placeholder="1 para crédito, 2 para débito"
            error={submitted && !tipoCompra.trim() ? 'O tipo é obrigatório' : ''}
            keyboardType="numeric"
            ref={tipoRef}
          />

          <TouchableOpacity 
            onPress={handleAddPurchase} 
            style={[styles.button, loading && styles.disabledButton]} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                Cadastrar
              </ThemedText>
            )}
          </TouchableOpacity>
        </KeyboardAwareScrollView>
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
    alignItems: 'center',
  },
  modalContent: {
    width: '97%',
    borderRadius: 10,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
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
    fontWeight: 'bold',
  },
  datePickerContainer: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CreatePurchaseModal;
