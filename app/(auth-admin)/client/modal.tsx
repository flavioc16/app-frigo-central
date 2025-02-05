import { StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../src/context/ThemeContext';
import { useState } from 'react';

// Tipagem do Client conforme o modelo fornecido
export interface Client {
  id: string;
  nome: string;
  email?: string;
  telefone: string;
  endereco?: string;
  referencia?: string;
  created_at: string;
  updated_at: string;
  userId: string;
  user?: User;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface ClientModalScreenProps {
  onSubmit: (client: Client) => void;
}

export default function ClientModalScreen({ onSubmit }: ClientModalScreenProps) {
  const { theme, colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [reference, setReference] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState<string | undefined>();
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    const clientData: Client = {
      id: '',  // Geralmente o ID seria gerado pelo backend
      nome: name,
      telefone: phone,
      endereco: address,
      referencia: reference,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      userId: '',  
      user: undefined, 
    };

    onSubmit(clientData);  // Envia os dados para a função passada via prop
  };

  return (
    <View style={[styles.modalContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.form}>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground }]}
          placeholder="Nome do cliente"
          placeholderTextColor={colors.placeholder}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground }]}
          placeholder="Telefone"
          placeholderTextColor={colors.placeholder}
          value={phone}
          onChangeText={setPhone}
        />

        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground }]}
          placeholder="Email (opcional)"
          placeholderTextColor={colors.placeholder}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground }]}
          placeholder="Referência"
          placeholderTextColor={colors.placeholder}
          value={reference}
          onChangeText={setReference}
        />

        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground }]}
          placeholder="Endereço"
          placeholderTextColor={colors.placeholder}
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground }]}
          placeholder="Usuario"
          placeholderTextColor={colors.placeholder}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground }]}
          placeholder="Senha"
          placeholderTextColor={colors.placeholder}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint }]} onPress={handleRegister}>
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>Cadastrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '95%',
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    width: '95%',
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: '90%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
