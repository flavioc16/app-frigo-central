import React, { useState, useRef, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useTheme } from '../../../../src/context/ThemeContext';
import { Colors } from '../../../../constants/Colors';
import InputForm from '@/app/components/InputForm';
import { ThemedText } from '@/components/ThemedText';
import { api } from '@/src/services/api';
import axios from 'axios';
import { X } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface Product {
  id: string;
  nome: string;
  descricao: string;
  precoAVista: number;
  precoAPrazo: number;
}

interface EditProductModalProps {
  visible: boolean;
  onClose: () => void;
  productId: string | undefined;
  updateProducts?: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ visible, onClose, productId, updateProducts }) => {
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;

  const [id, setId] = useState('');
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

  const [loadingData, setLoadingData] = useState(false);

  const capitalizeFirstLetter = (text: string) => {
    return text
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  useEffect(() => {
    const loadProductData = async () => {
      if (visible && productId) {
        setLoadingData(true); // Inicia o loading
  
        try {
          const response = await api.get(`/produtos/${productId}`);
          const product = response.data;
  
          setId(product.id);
          setNome(product.nome);
          setDescricao(product.descricao);
          const formatPrice = (value: number) => {
            return (value / 100).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          };
  
          setPrecoAVista(formatPrice(product.precoAVista));
          setPrecoAPrazo(formatPrice(product.precoAPrazo));
        } catch (error) {
          Alert.alert('Erro', 'Erro ao carregar os dados do produto.', [{ text: 'OK' }]);
        } finally {
          setLoadingData(false);
        }
      }
    };
    
    loadProductData();
  }, [visible, productId]);

  const handleEditProduct = async () => {
    setSubmitted(true);

    if (!nome.trim()) {
      nomeRef.current?.focus();
      return;
    }

    if (!descricao.trim()) {
      descricaoRef.current?.focus();
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

    const formatCurrency = (value: string) => {
      return parseFloat(value.replace(/\./g, '').replace(',', '.')) * 100;
    };

    try {
      const updatedProductData: Product = {
        id: id,
        nome,
        descricao,
        precoAVista: formatCurrency(precoAVista),
        precoAPrazo: formatCurrency(precoAPrazo),
      };

      await api.put(`/produtos`, updatedProductData);

      setLoading(false);
      setSubmitted(false);
      onClose();

      if (updateProducts) updateProducts();

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
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          style={styles.modalContent}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>Editar Produto</Text>
  
          {loadingData ? (
            <ActivityIndicator size="large" color={colors.tint} style={styles.loadingIndicator} />
          ) : (
            <>
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
                keyboardType="numeric"
                ref={precoAPrazoRef}
                error={submitted && (!precoAPrazo.trim() || precoAPrazo === '0,00' || parseFloat(precoAPrazo.replace(',', '.')) <= 0) ? 'O preço a prazo é obrigatório e maior que zero' : ''}
              />
              <TouchableOpacity
                onPress={handleEditProduct}
                style={[styles.button, loading && styles.disabledButton]}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                    Salvar Alterações
                  </ThemedText>
                )}
              </TouchableOpacity>
            </>
          )}
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
    paddingTop: 42
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
  scrollContent: {
    flexGrow: 1, 
    paddingBottom: 20,
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
  loadingIndicator: {
    flex: 1,
  },
});

export default EditProductModal;
