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
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { AuthContext } from '../../src/context/AuthContext';
import { TouchableWithoutFeedbackWrapper } from '@/src/components/TouchableWithoutFeedbackWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../src/context/ThemeContext';  // Importa o contexto de tema
import { Colors } from '@/constants/Colors';
import InputForm from '@/app/components/InputForm';


export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loadingAuth } = useContext(AuthContext);
  const { theme } = useTheme(); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const logoSource = theme === 'dark'
    ? require('../../assets/images/LOGO-VERMELHO-E-BRANCA.png')  // Logo para o tema escuro
    : require('../../assets/images/LOGO-TODA-VERMELHA.png'); 

  // Acesse as cores do tema dinamicamente
  const colors = Colors[theme];  
  // Cores do tema
  const { border, background, text, placeholder, icon } = colors;

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
        if (parsedUser?.role) {
          if (parsedUser.role === 'USER') {
        
            const clientInfo = parsedUser.client?.[0];  // Pega o primeiro cliente (no caso de um array)
            if (clientInfo) {
              await AsyncStorage.setItem('@cliente', JSON.stringify(clientInfo));  // Salva o cliente na AsyncStorage
            }
            router.replace('/(auth)/(tabs)/home');  // Caminho para área de cliente
          } else if (parsedUser.role === 'ADMIN') {
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
    <View style={[styles.container, { backgroundColor: background, overflow: 'hidden', paddingBottom: Platform.OS === 'ios' ? 100 : 0 }]}> 
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
            <View style={styles.container}>
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
                  color={icon}  // Cor dinâmica do ícone
                  style={styles.eyeButton}
                />
                <TextInput
                  ref={usernameRef}
                  style={[styles.input, {  backgroundColor: colors.cardBackground, borderColor: border, color: text }]}
                  autoCapitalize="none"
                  placeholder="Usuário"
                  value={username}
                  onChangeText={setUsername}
                  placeholderTextColor={placeholder} // Cor dinâmica para o placeholder
                />
              </View>
              
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, styles.passwordInput, {  backgroundColor: colors.cardBackground, borderColor: border, color: text }]}
                  placeholder="Senha"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor={placeholder} // Placeholder dinâmico
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.eyeButton}
                >
                  <FontAwesome
                    name={password === '' ? 'lock' : isPasswordVisible ? 'eye' : 'eye-slash'}
                    size={24}
                    color={icon}  // Cor dinâmica do ícone
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
                  <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                    Entrar
                  </ThemedText>
                )}
              </TouchableOpacity>

              {errorMessage && (
                <ThemedText type="defaultSemiBold" style={[styles.errorText, { color: '#ff4d4d' }]}>{errorMessage}</ThemedText>
              )}
            </View>
          </TouchableWithoutFeedbackWrapper>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
    marginTop: 10,
    alignItems: 'center',
  },
  logo: {
    width: 400,
    height: 150,
  },
  button: {
    width: '100%',
    backgroundColor: '#ae2121', // Cor de fundo para o botão
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
  input: {
    borderWidth: 1,
    borderColor: '#2d2d2d',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    width: '100%',
  },
  passwordInput: {
    paddingRight: 40,
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
    transform: [{ translateY: -18 }],
    zIndex: 1,
  },
  errorText: {
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
});
