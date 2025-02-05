import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useTheme } from '../../../src/context/ThemeContext'; // Importa o contexto de tema
import { House, User, ScanBarcode, Bell, CalendarCheck, HandCoins } from 'lucide-react-native';

export default function TabLayout() {
  const { theme, colors } = useTheme(); // Obtém o tema atual do contexto e as cores do tema

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint, 
        tabBarInactiveTintColor: theme === 'dark' ? colors.tabIconDefaultDark : colors.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: theme === 'dark' ? colors.backgroundDarkTab : colors.backgroundTab, // Usa as cores do contexto de tema
          },
          default: {
            backgroundColor: theme === 'dark' ? colors.backgroundDarkTab : colors.backgroundTab, // Usa as cores do contexto de tema
          },
        }),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <House size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="client"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="product"
        options={{
          title: 'Produtos',
          tabBarIcon: ({ color, size }) => <ScanBarcode size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reminder"
        options={{
          title: 'Lembretes',
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Relatórios',
          tabBarIcon: ({ color, size }) => <CalendarCheck size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          title: 'Pagamento',
          tabBarIcon: ({ color, size }) => <HandCoins size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
