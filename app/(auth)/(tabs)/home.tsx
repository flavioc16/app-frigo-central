import { StyleSheet, View, Image } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { useColorScheme } from '@/hooks/useColorScheme'; // Hook personalizado para tema
import { AuthContext } from '../../../src/context/AuthContext';
import { useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router'; // Importa o useRouter


export default function HomeScreen() {
  const { user } = useContext(AuthContext);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter(); // Hook para navegação

  const colorScheme = useColorScheme(); // Obter o tema atual

  const headerImageSource =
    colorScheme === 'dark'
      ? require('../../../assets/images/LOGO-VERMELHO-E-BRANCA.png') // Imagem para tema escuro
      : require('../../../assets/images/LOGO-TODA-VERMELHA.png'); // Imagem para tema claro

  useEffect(() => {
    // Tenta pegar o usuário do AsyncStorage, caso não tenha no contexto
    const fetchUser = async () => {
      const userFromStorage = await AsyncStorage.getItem('@frigorifico');
      if (userFromStorage) {
        setCurrentUser(JSON.parse(userFromStorage)); // Define o usuário do AsyncStorage
      } else {
        setCurrentUser(user); // Caso contrário, pega do contexto
      }
    };

    fetchUser();
  }, [user]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#fff', dark: '#0d0f16' }}
      headerImage={
        <Image
          source={headerImageSource}
          style={styles.headerImage}
          resizeMode="cover"
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="defaultSemiBold" style={{ fontSize: 20 }}>
          Olá, {currentUser?.client?.[0]?.nome || 'Carregando...'}{' '}
        </ThemedText>
      </ThemedView>
      <View style={{ marginTop: 10 }}>
        <ThemedButton
          title="Minhas compras"
          onPress={() => router.push('/(auth)/purchases')}
          lightBackgroundColor="#b62828" // Vermelho no tema claro
          darkBackgroundColor="#b62828" // Vermelho no tema escuro
          lightTextColor="#FFFFFF" // Branco no tema claro
          darkTextColor="#E0F2F1" // Branco-esverdeado no tema escuro
        />
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    marginTop: 55,
    width: '90%', // Reduzido em 30% da largura total
    height: 140, // Reduzido proporcionalmente em 30% da altura original
    alignSelf: 'center', // Centraliza a imagem
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Alinha texto e aceno na mesma linha
    gap: 8,
    borderBottomEndRadius: 10,
  },
});
