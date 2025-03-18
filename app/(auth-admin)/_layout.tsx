import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ThemeProvider } from '@react-navigation/native';
import { useTheme } from '../../src/context/ThemeContext'; // Importando o contexto de tema
import 'react-native-reanimated';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

import BackButton from '../components/BackButton';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { theme } = useTheme(); // Usando o hook de tema do contexto
  const [loaded] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf')
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Define o tema do react-navigation com base no tema global
  const navigationTheme = theme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme === 'dark' ? '#0d0f16' : '#ffffff', // Cor do cabeçalho com base no tema
          },
          headerTintColor: theme === 'dark' ? '#ffffff' : '#000000', // Cor do texto do cabeçalho
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{
            title: '', 
            headerBackTitle: '',
            headerShown: false 
          }} 
        />
        <Stack.Screen
            name="purchases"
            options={{
              title: 'Compras', 
              headerShown: true, 
            }}
        />
        <Stack.Screen
            name="client/[listPurchasesClientId]"
            options={{
              headerShown: true,
              title: '',
              headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="home/ModalConfig"
          options={{
            headerShown: true,
            title: 'Configurações',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="home/Notifications"
          options={{
            headerShown: true,
            title: 'Notificações',
            presentation: 'modal',
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
