import React, { useEffect, useState } from 'react';
import { StatusBar as RNStatusBar, Platform } from 'react-native';  // Importa o StatusBar do React Native
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext'; // Usando o tema personalizado
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppNavigator() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      checkUserInStorage();
    }
  }, [isMounted, router]);

  const checkUserInStorage = async () => {
    try {
      const userInfo = await AsyncStorage.getItem('@frigorifico');
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        if (parsedUser?.role) {
          router.replace(parsedUser.role === 'USER' ? '/(auth)/(tabs)/home' : '/(auth-admin)/(tabs)/home');
        } else {
          router.replace('/(public)/login');
        }
      } else {
        router.replace('/(public)/login');
      }
    } catch (error) {
      console.error('Erro ao acessar AsyncStorage:', error);
    }
  };

  // Atualiza o StatusBar quando o tema mudar
  useEffect(() => {
    RNStatusBar.setBarStyle(theme === 'light' ? 'dark-content' : 'light-content'); // Altera o estilo do ícone da StatusBar

    if (Platform.OS === 'android') {
      RNStatusBar.setBackgroundColor(colors.background); // Atualiza a cor de fundo da StatusBar apenas no Android
    }
  }, [theme, colors]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
