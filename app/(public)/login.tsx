import React, { useState, useContext, useRef } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  Platform,
  useColorScheme
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AuthContext } from '../../src/context/AuthContext';


import { TouchableWithoutFeedbackWrapper } from '@/src/components/TouchableWithoutFeedbackWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loadingAuth, user } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const logoSource = useColorScheme() === 'dark'
    ? require('../../assets/images/LOGO-VERMELHO-E-BRANCA.png')  // Logo para o tema escuro
    : require('../../assets/images/LOGO-TODA-VERMELHA.png'); 

  const borderColor = useThemeColor({}, 'border'); // Define a cor da borda
  const backgroundColor = useThemeColor({}, 'background'); // Define a cor do fundo
  const textColor = useThemeColor({}, 'text'); // Cor dinâmica do texto
  const placeholderColor = useThemeColor({}, 'placeholder'); // Cor dinâmica do placeholder
  const iconColor = useThemeColor({}, 'icon'); // Cor dinâmica do ícone

  async function handleLogin() {
    setErrorMessage(null);
  
    // Validações dos campos
    if (!username) {
      setErrorMessage('O campo de usuário precisa ser preenchido.');
      usernameRef.current?.focus();
      return;
    }
  
    if (!password) {
      setErrorMessage('O campo de senha precisa ser preenchido.');
      passwordRef.current?.focus();
      return;
    }
  
    try {
      // Realiza o login
      await signIn({ username, password });
  
      // Verifica se o usuário foi autenticado após o login
      const userInfo = await AsyncStorage.getItem('@frigorifico');
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
  
        // Verifica o tipo de usuário (USER ou ADMIN)
        if (parsedUser?.role) {
          if (parsedUser.role === 'USER') {
            // Salva as informações do cliente (incluindo o client) para usuários
            const clientInfo = parsedUser.client?.[0];  // Pega o primeiro cliente (no caso de um array)
            if (clientInfo) {
              await AsyncStorage.setItem('@cliente', JSON.stringify(clientInfo));  // Salva o cliente na AsyncStorage
            }
            router.replace('/(auth)/(tabs)/home');  // Caminho para área de cliente
          } else if (parsedUser.role === 'ADMIN') {
            // Não há cliente para o admin, só salva as informações do usuário
            await AsyncStorage.setItem('@cliente', JSON.stringify({}));  // Salva um objeto vazio para admin
            router.replace('/(auth-admin)/(tabs)/home');  // Caminho para área de admin
          } else {
            setErrorMessage('Role do usuário não encontrado.');
          }
        } else {
          setErrorMessage('Role do usuário não encontrado.');
        }
      } else {
        setErrorMessage('Usuário não encontrado no armazenamento.');
        router.replace('/(public)/login');  // Redireciona para o login caso não encontre o usuário
      }
    } catch (error: any) {
      setErrorMessage(error);
    }
  }
  
  return (
    <ThemedView style={[
      styles.container, 
      Platform.OS === 'ios' && { paddingBottom: 100 },
      { overflow: 'hidden',}]}> 
      <KeyboardAvoidingView
         style={{ flex: 1 }}
         behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'position' : undefined}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <TouchableWithoutFeedbackWrapper onPress={Keyboard.dismiss}>
            <ThemedView style={styles.container}>
              <View style={styles.containerImage}>
                <Image
                  style={styles.logo}
                  source={logoSource} 
                  resizeMode="contain"
                />
              </View> 

              <View style={styles.usernameContainer}>
                <FontAwesome
                  name="user"
                  size={20}
                  color={useThemeColor({ light: '#000', dark: '#fff' }, 'icon')} // Ícone dinâmico com base no tema
                  style={styles.eyeButton}
                />
                <TextInput
                  ref={usernameRef}
                  style={[
                    styles.input,
                    { borderColor: borderColor, color: textColor }, // Aplica a borda e o texto dinâmico
                  ]}
                  autoCapitalize="none"
                  placeholder="Usuário"
                  value={username}
                  onChangeText={setUsername}
                  placeholderTextColor={placeholderColor} // Cor dinâmica para o placeholder
                />
              </View>
              
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={passwordRef}
                  style={[
                    styles.input,
                    styles.passwordInput,
                    { borderColor: borderColor, color: textColor },  
                  ]}
                  placeholder="Senha"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor={placeholderColor} // Placeholder dinâmico
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.eyeButton}
                >
                  <FontAwesome
                    name={password === '' ? 'lock' : isPasswordVisible ? 'eye' : 'eye-slash'}
                    size={24}
                    color={useThemeColor({ light: '#000', dark: '#fff' }, 'icon')}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                onPress={handleLogin} 
                style={[styles.button, loadingAuth && styles.disabledButton]} 
                disabled={loadingAuth}
              >
                {loadingAuth ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText type="defaultSemiBold" style={styles.buttonText} >
                    Entrar
                  </ThemedText>
                )}
              </TouchableOpacity>

              {errorMessage && (
                <ThemedText type="defaultSemiBold" style={[styles.errorText, { color: '#ff4d4d' }]}>{errorMessage}</ThemedText>
              )}
            </ThemedView>
          </TouchableWithoutFeedbackWrapper>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
    alignItems: 'center',
  },
  containerImage: {
    marginTop : 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#2d2d2d',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#fff',
    fontSize: 16,
    width: '100%',
  },
  passwordInput: {
    paddingRight: 40,
  },
  logo: {
    width: 400,
    height: 150,
  },
  button: {
    width: '100%',
    backgroundColor: '#ae2121',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#7e1a1a',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -20 }],
  },
  errorText: {
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
});
