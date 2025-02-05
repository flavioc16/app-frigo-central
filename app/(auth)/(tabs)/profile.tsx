import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, TextInput, ScrollView, View, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AuthContext } from '../../../src/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Cliente {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
}

export default function TabThreeScreen() {
  const { signOut } = useContext(AuthContext);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'placeholder');

  const [loadingAuth, setLoadingAuth] = useState(false);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const userInfo = await AsyncStorage.getItem('@frigorifico');
        if (!userInfo) {
          setError('Usuário não autenticado.');
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(userInfo);
        const { client } = parsedUser;

        if (client && client.length > 0) {
          setCliente(client[0]);
          setError(null);
        } else {
          setError('Dados do cliente não encontrados.');
        }
      } catch (err) {
        console.error('Erro ao buscar os dados do cliente:', err);
        setError('Erro ao buscar os dados do cliente. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchCliente();
  }, []);

  const handleLogout = () => {
    setLoadingAuth(true);
    signOut();
    setLoadingAuth(false);
  };

  // Função para mascarar o e-mail, mostrando apenas a parte antes do "@" e o primeiro caractere após o "@"
  const maskEmail = (email: string) => {
    const [localPart, domainPart] = email.split('@');
    if (localPart.length > 2) {
      const maskedLocal = localPart[0] + '****' + localPart[localPart.length - 1]; // Exemplo de mascarar, mostrando apenas o primeiro e o último caractere
      return `${maskedLocal}@${domainPart}`;
    } else {
      return email; // Se o nome local for muito curto, não mascara
    }
  };
  const maskPhone = (phone: string) => {
    // Remove todos os caracteres não numéricos (como espaços, parênteses, traços)
    const cleanedPhone = phone.replace(/\D/g, '');
  
    if (cleanedPhone.length > 4) {
      // Exibe os dois primeiros números (DDD) e os últimos quatro números, mascara o restante
      const maskedPhone = `${cleanedPhone.slice(0, 2)} ${cleanedPhone.slice(2, 3)}**** ${cleanedPhone.slice(-4)}`;
      return maskedPhone;
    } else {
      return phone; // Se o número for muito curto, não mascara
    }
  };
  
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <ThemedText type="title" style={styles.title}>
            Perfil
          </ThemedText>

          {loading ? (
            <ActivityIndicator size="large" color="#ae2121" style={styles.loading} />
          ) : error ? (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          ) : cliente ? (
            <>
              <ThemedText style={styles.label}>Nome</ThemedText>
              <TextInput
                style={[styles.input, {
                  borderColor: borderColor,
                  backgroundColor: backgroundColor,
                  color: textColor,
                }]}
                value={cliente.nome}
                editable={false}
                placeholder="Nome"
                placeholderTextColor={placeholderColor}
              />
              <ThemedText style={styles.label}>Endereço</ThemedText>
              <TextInput
                style={[styles.input, {
                  borderColor: borderColor,
                  backgroundColor: backgroundColor,
                  color: textColor,
                }]}
                value={cliente.endereco}
                editable={false}
                placeholder="Endereço"
                placeholderTextColor={placeholderColor}
              />
              <ThemedText style={styles.label}>E-mail</ThemedText>
              <TextInput
                style={[styles.input, {
                  borderColor: borderColor,
                  backgroundColor: backgroundColor,
                  color: textColor,
                }]}
                value={maskEmail(cliente.email)} // Aplica a máscara no e-mail
                editable={false}
                placeholder="E-mail"
                placeholderTextColor={placeholderColor}
              />
              <ThemedText style={styles.label}>Telefone</ThemedText>
              <TextInput
                style={[styles.input, {
                  borderColor: borderColor,
                  backgroundColor: backgroundColor,
                  color: textColor,
                }]}
                value={maskPhone(cliente.telefone)}
                editable={false}
                placeholder="Telefone"
                placeholderTextColor={placeholderColor}
              />
            </>
          ) : (
            <ThemedText style={styles.errorText}>Dados do cliente não disponíveis.</ThemedText>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              onPress={handleLogout} 
              style={[styles.button, loadingAuth && styles.disabledButton]} 
              disabled={loadingAuth}
            >
              {loadingAuth ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                  Sair da conta
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'left',
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
  loading: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    width: '100%',
    backgroundColor: '#ae2121',
    borderRadius: 8,
    padding: 10,
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
