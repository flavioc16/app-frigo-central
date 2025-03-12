import React, { useState, useRef, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  TextInput, 
  Alert 
} from 'react-native';
import { useTheme } from '../../../../src/context/ThemeContext';
import { Colors } from '../../../../constants/Colors';
import InputForm from '@/app/components/InputForm';
import { ThemedText } from '@/components/ThemedText';
import { api } from '@/src/services/api';
import axios from 'axios';
import { X } from 'lucide-react-native';

interface Product {
  nome: string;
  descricao: string;
  precoAVista: number;
  precoAPrazo: number;
}

interface CreateProductModalProps {
  visible: boolean;
  onClose: () => void;
  updateProducts?: () => void;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({ visible, onClose, updateProducts }) => {
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [precoAVista, setPrecoAVista] = useState('');
  const [precoAPrazo, setPrecoAPrazo] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nomeRef = useRef<TextInput>(null);
  const descricaoRef = useRef<TextInput>(null);
  const precoAVistaRef = useRef<TextInput>(null);
  const precoAPrazoRef = useRef<TextInput>(null);

  const capitalizeFirstLetter = (text: string) => {
    return text
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    if (visible) {
      nomeRef.current?.focus();
    }
  }, [visible]);
  const handleAddProduct = async () => {
    setSubmitted(true);
  
    if (!nome.trim()) {
      nomeRef.current?.focus();
      return;
    }
  
   
    if (!precoAVista.trim() || precoAVista === '0,00' || parseFloat(precoAVista.replace(',', '.')) <= 0) {
      precoAVistaRef.current?.focus();
      return;
    }

    if (!precoAPrazo.trim() || precoAPrazo === '0,00' || parseFloat(precoAPrazo.replace(',', '.')) <= 0) {
      precoAPrazoRef.current?.focus();
      return;
    }
  
    setLoading(true);
  
    try {
      
      const formatCurrency = (value: string) => {
        return parseFloat(value.replace(/\./g, '').replace(',', '.')) * 100;
      };
  
      const productData: Product = {
        nome,
        descricao,
        precoAVista: formatCurrency(precoAVista),
        precoAPrazo: formatCurrency(precoAPrazo),
      };
  
      console.log('Enviando para API:', productData);
  
      await api.post('/produtos', productData);
  
      setLoading(false);
      setSubmitted(false);
      onClose();
  
      if (updateProducts) updateProducts();
  
      setNome('');
      setDescricao('');
      setPrecoAVista('');
      setPrecoAPrazo('');
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
  
  

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Cadastrar Produto</Text>
          <InputForm
            label="Nome"
            value={capitalizeFirstLetter(nome)}
            placeholder="Nome do produto"
            onChangeText={setNome}
            error={submitted && !nome.trim() ? 'O nome é obrigatório' : ''}
            ref={nomeRef}
            autoFocus
          />
          <InputForm
            label="Descrição"
            value={capitalizeFirstLetter(descricao)}
            placeholder="Descrição do produto"
            onChangeText={setDescricao}
          />
          <InputForm
            label="Preço à Vista"
            value={precoAVista}
            placeholder="Preço à vista"
            onChangeText={setPrecoAVista}
            keyboardType="numeric"
            ref={precoAVistaRef}
            error={submitted && (!precoAVista.trim() || precoAVista === '0,00' || parseFloat(precoAVista.replace(',', '.')) <= 0) ? 'O preço à vista é obrigatório e maior que zero' : ''}
          />
          <InputForm
            label="Preço a Prazo"
            value={precoAPrazo}
            placeholder="Preço a prazo"
            onChangeText={setPrecoAPrazo}
            ref={precoAPrazoRef}
            keyboardType="numeric"
            error={submitted && (!precoAPrazo.trim() || precoAPrazo === '0,00' || parseFloat(precoAVista.replace(',', '.')) <= 0) ? 'O preço a prazo é obrigatório e maior que zero' : ''}
          />

          <TouchableOpacity
            onPress={handleAddProduct}
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
        </View>
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
    paddingTop: 30 
  },
  modalContent: { 
    padding: 20 
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  closeButton: { 
    position: 'absolute', 
    top: 50, 
    right: 10, 
    padding: 10 
  },
  button: { 
    marginTop: 10, 
    backgroundColor: '#ae2121', 
    borderRadius: 8, 
    padding: 10, 
    alignItems: 'center' 
  },
  disabledButton: { 
    backgroundColor: '#7e1a1a' 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
});

export default CreateProductModal;
