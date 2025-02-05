import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';

interface ThemeContextProps {
  theme: 'light' | 'dark';
  colors: typeof Colors.light;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme(); 
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('@theme');
      if (savedTheme) {
        // Se houver tema salvo, usamos ele
        setTheme(savedTheme as 'light' | 'dark');
      } else {
        // Caso não haja tema salvo, usamos o tema do sistema
        const defaultTheme = systemScheme === 'dark' ? 'dark' : 'light';
        setTheme(defaultTheme);
        // Salva o tema do sistema no AsyncStorage, caso seja o primeiro acesso
        await AsyncStorage.setItem('@theme', defaultTheme);
      }
    };

    loadTheme();
  }, [systemScheme]); // Recarrega o tema sempre que o sistema mudar

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('@theme', newTheme); // Salva a escolha do usuário no AsyncStorage
  };

  return (
    <ThemeContext.Provider value={{ theme, colors: Colors[theme], toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};
