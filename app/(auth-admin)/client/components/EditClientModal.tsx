import React, { useState, useRef, useContext, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  TextInput
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../../../../src/context/ThemeContext';
import { Colors } from '../../../../constants/Colors';
import InputForm from '@/app/components/InputForm';
import { ThemedText } from '@/components/ThemedText';
import { AuthContext } from '@/src/context/AuthContext'; 
import { api } from '@/src/services/api';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';

import { useNavigation } from '@react-navigation/native';

export interface User {
    id: string;
    name: string;
    username: string;
    password: string;
    role: string;
    created_at: string;
    updated_at: string;
}
  
export interface Client {
  id: string;
  nome: string;
  email?: string;
  telefone: string;
  endereco?: string;
  referencia?: string;
  username: string;
  password?: string;
  user?: User;
}


interface EditClientModalProps {
  visible: boolean;
  onClose: () => void;
  updateClients: () => void;
  clientId?: string;  // Recebe a ID do cliente a ser editado
}

const EditClientModal: React.FC<EditClientModalProps> = ({ visible, onClose, updateClients, clientId }) => {
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;
  const { user } = useContext(AuthContext); 
  const token = user?.token; 



  const [name, setName] = useState('');
  const [reference, setReference] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nameRef = useRef<TextInput>(null);
  const referenceRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const maskPhone = (value: string): string => {
    value = value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
  
    if (value.length === 0) return '';
    if (value.length <= 2) return `(${value}`;
    if (value.length <= 3) return `(${value.slice(0, 2)}) ${value.slice(2)}`;
    if (value.length <= 6) return `(${value.slice(0, 2)}) ${value.slice(2, 3)}-${value.slice(3)}`;
    if (value.length <= 7) return `(${value.slice(0, 2)}) ${value.slice(2, 3)}-${value.slice(3, 7)}`;
    if (value.length <= 9) return `(${value.slice(0, 2)}) ${value.slice(2, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
    return `(${value.slice(0, 2)}) ${value.slice(2, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
  };

  const capitalizeFirstLetter = (text: string) => {
    return text
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

 
  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      const response = await api.get(`/clients/${clientId}`, {
    
      });
  
      const clientData = response.data;
      

      setName(clientData?.nome || '');
      setReference(clientData?.referencia);
      setAddress(clientData?.endereco);
      setPhone(clientData?.telefone);
      setEmail(clientData?.email);
      setUsername(clientData.user?.username);
      setPassword(''); 

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados do cliente.', [
        { text: 'OK' }
      ]);
    }
  };
  const handleEditClient = async () => {
    setSubmitted(true);
  
    // Validações dos campos
    if (!name.trim()) {
      nameRef.current?.focus();
      return;
    }
    if (!reference.trim()) {
      referenceRef.current?.focus();
      return;
    }
    if (!address.trim()) {
      addressRef.current?.focus();
      return;
    }
    if (!phone.trim()) {
      phoneRef.current?.focus();
      return;
    }
    if (!username.trim()) {
      usernameRef.current?.focus();
      return;
    }

  
    setLoading(true);
  
    try {
      if (!clientId) {
        throw new Error("ID do cliente não fornecido.");
      }
  
      // Criação do objeto clientData
      const clientData: any = {
        id: clientId,
        nome: name,
        telefone: phone,
        endereco: address,
        referencia: reference,
        email: email,
        username: username,
        user:{
          username,
          password
        },
      };
  
      if (password.trim() !== '') {
        clientData.password = password;
      }

      const response = await api.put(`/clients`, clientData, {
    
      });
  
      setLoading(false);
      setSubmitted(false);
      onClose();
      updateClients();
  
      Alert.alert('Tudo certo!', `${response.data.nome} editado com sucesso.`, [
        { text: 'OK' }
      ]);
  
    } catch (error) {
      setLoading(false);
      setSubmitted(false);
  
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'Erro ao editar cliente.';
        Alert.alert('Erro', errorMessage, [
          { text: 'OK' }
        ]);
      } else {
        Alert.alert('Erro', 'Erro desconhecido. Tente novamente.', [
          { text: 'OK' }
        ]);
      }
    }
  };
  
  

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]} >
        <KeyboardAwareScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          style={styles.modalContent}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Editar Cliente
          </Text>
          <InputForm
            label="Nome"
            value={name}
            onChangeText={(text) => setName(capitalizeFirstLetter(text))}
            placeholder="Nome do cliente"
            error={submitted && !name.trim() ? 'O nome do cliente é obrigatório' : ''}
            ref={nameRef}
          />
          <InputForm
            label="Referência"
            value={reference}
            onChangeText={(text) => setReference(capitalizeFirstLetter(text))}
            placeholder="Referência do cliente"
            error={submitted && !reference.trim() ? 'A referência do cliente é obrigatória' : ''}
            ref={referenceRef}
          />
          <InputForm
            label="Endereço"
            value={address}
            onChangeText={(text) => setAddress(capitalizeFirstLetter(text))}
            placeholder="Endereço do cliente"
            error={submitted && !address.trim() ? 'O endereço do cliente é obrigatório' : ''}
            ref={addressRef}
          />
          <InputForm
            label="Telefone"
            value={phone}
            onChangeText={setPhone}
            placeholder="Telefone do cliente"
            maskFunction={maskPhone}
          />
          <InputForm
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail do cliente"
          />
          <InputForm
            label="Usuário"
            value={username}
            onChangeText={setUsername}
            placeholder="Usuário do cliente"
            error={submitted && !username.trim() ? 'O usuário do cliente é obrigatório' : ''}
            ref={usernameRef}
          />
          <InputForm
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Senha do cliente"
            secureTextEntry={true}
            ref={passwordRef}
          />
          <TouchableOpacity 
            onPress={handleEditClient} 
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
});

export default EditClientModal;
