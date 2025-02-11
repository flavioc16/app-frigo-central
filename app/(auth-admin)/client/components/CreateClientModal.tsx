import React, { useState, useRef, useContext } from 'react';
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
import { X } from 'lucide-react-native';
import { useTheme } from '../../../../src/context/ThemeContext';
import { Colors } from '../../../../constants/Colors';
import InputForm from '@/app/components/InputForm';
import { ThemedText } from '@/components/ThemedText';
import { AuthContext } from '@/src/context/AuthContext'; 
import { api } from '@/src/services/api';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';

export interface Client {
  nome: string;
  email?: string;
  telefone: string;
  endereco?: string;
  referencia?: string;
  username: string;
  password: string;
}

interface CreateClientModalProps {
  visible: boolean;
  onClose: () => void;
}

const CreateClientModal: React.FC<CreateClientModalProps> = ({ visible, onClose }) => {
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

  // Refs para os inputs
  const nameRef = useRef<TextInput>(null);
  const referenceRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const capitalizeFirstLetter = (text: string) => {
    return text
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  

  const handleAddClient = async () => {
    setSubmitted(true); 

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
    if (!password.trim()) {
      passwordRef.current?.focus();
      return;
    }

    if (!token) {
      console.error('Usuário não autenticado. Token não encontrado.');
      return;
    }

    setLoading(true);
    
    try {
      const clientData: Client = {
        nome: name,
        telefone: phone,
        endereco: address,
        referencia: reference,
        email: email,
        username: username,
        password: password,
      };

      const response = await api.post("/clients", clientData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLoading(false);
      setSubmitted(false);
      onClose();  

      const newClientName = response.data.cliente?.nome || "Novo cliente";
      Alert.alert('Sucesso!', `Cliente ${newClientName} cadastrado com sucesso.`, [
        { text: 'OK' }
      ]);

      setName('');
      setReference('');
      setAddress('');
      setPhone('');
      setEmail('');
      setUsername('');
      setPassword('');


    } catch (error) {
      setLoading(false);
      setSubmitted(false);
    
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error;
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
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <KeyboardAwareScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          style={styles.modalContent}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Cadastrar Cliente
          </Text>
          <InputForm
            label="Nome"
            value={name}
            onChangeText={(text) => setName(capitalizeFirstLetter(text))}
            placeholder="Nome do cliente"
            error={submitted && !name.trim() ? 'O nome do cliente é obrigatório' : ''}
            autoFocus
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
            error={submitted && !phone.trim() ? 'O telefone do cliente é obrigatório' : ''}
            ref={phoneRef}
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
            placeholder="Senha do cliente "
            secureTextEntry={true}
            error={submitted && !password.trim() ? 'A senha do cliente é obrigatória' : ''}
            ref={passwordRef}
          />
          <TouchableOpacity 
            onPress={handleAddClient} 
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
});

export default CreateClientModal;
