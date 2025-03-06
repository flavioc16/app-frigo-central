import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  StyleSheet, 
  Animated, 
  Platform,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '../../../../src/context/ThemeContext';
import { BlurView } from 'expo-blur';
import { api } from '@/src/services/api';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  id: string | string[];
  valor: number;
  updatePurchases: () => void;
}

export default function PaymentModal({
  visible,
  onClose,
  id,
  valor,
  updatePurchases,
}: PaymentModalProps) {
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;
  const formattedTotalValue = new Intl.NumberFormat('pt-BR', {
     minimumFractionDigits: 2 
  }).format(valor);
  const [inputValue, setInputValue] = useState<string>(formattedTotalValue);

  const translateY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    updatePurchases();
  }, []);

  useEffect(() => {
    setInputValue(formattedTotalValue);
  }, [formattedTotalValue]);

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 500, 
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleInputChange = (text: string) => {
    const numericValue = text.replace(/\D/g, '');
    const floatValue = (parseFloat(numericValue) / 100).toFixed(2);
    if (!isNaN(parseFloat(floatValue))) {
      setInputValue(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(parseFloat(floatValue)));
    } else {
      setInputValue('');
    }
  };

  const handleConfirmPayment = async () => {
    const formattedInput = inputValue.replace(/\./g, '').replace(',', '.');
    const finalValue = parseFloat(formattedInput);
  
    if (inputValue === '' || finalValue <= 0) {
      Alert.alert('Erro', 'Digite um valor válido.');
      return;
    }
  
    if (finalValue > valor) {
      Alert.alert('Erro', 'O valor não pode ser maior que o total.');
      return;
    }
  
    const paymentData = {
      valorPagamento: finalValue,
      clienteId: Array.isArray(id) ? id[0] : id,
    };
  
    try {
      await api.post('/pagamentos', paymentData);
      updatePurchases();
      
      const formattedPaymentValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalValue);
  
      Alert.alert('Sucesso!', `Pagamento de ${formattedPaymentValue} foi registrado.`);
      onClose();
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao processar o pagamento.');
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={onClose}>
        <BlurView style={styles.blurView} intensity={30} tint={theme === 'dark' ? 'light' : 'dark'} />
        <Animated.View style={[styles.modalContent, { 
          backgroundColor: colors.cardBackground, 
          transform: [{ translateY }],
          top: Platform.OS === 'android' ? '40%' : '38%'
        }]}>
          <Text style={[styles.modalTitle, { color: colors.success }]}>Pagamento</Text>
          <Text style={[styles.modalText, { color: colors.text }]}>
            Total em débito: 
            <Text style={{ color: colors.info, fontSize: 18, fontWeight: 'bold' }}> R$ {formattedTotalValue} </Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.border, backgroundColor: colors.cardBackground, color: colors.text }
            ]}
            keyboardType="numeric"
            value={inputValue}
            onChangeText={handleInputChange}
            placeholder="Digite o valor"
            placeholderTextColor={colors.placeholder}
            selectTextOnFocus={true}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={[styles.modalButton, { color: colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirmPayment} style={styles.confirmButton}>
              <Text style={[styles.modalButton, { color: colors.tint }]}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  modalContent: {
    position: 'absolute',
    alignSelf: "center",
    width: '90%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginRight: 10,
  },
  confirmButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalButton: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
