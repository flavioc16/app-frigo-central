import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { LogOut, Settings, BellRing } from "lucide-react-native";
import { useTheme } from '../../../src/context/ThemeContext'; 
import { Colors } from '../../../constants/Colors';  
import { useContext, useState } from 'react';
import { AuthContext } from '../../../src/context/AuthContext';
import ConfirmExitModal from '../../../app/components/ConfirmExitModal';
import SettingsModal from '../../../app/(auth-admin)/home/components/ModalConfig'; // Importa o modal de configurações

export default function HomeScreen() {
  const { theme, toggleTheme } = useTheme();
  const colors = Colors[theme] || Colors.light;
  const { signOut } = useContext(AuthContext);
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  
  const notificationCount = 5;

  // Definindo a logo com base no tema
  const logoSource = theme === 'dark'
    ? require('../../../assets/images/LOGO-VERMELHO-E-BRANCA.png')  // Logo para o tema escuro
    : require('../../../assets/images/LOGO-TODA-VERMELHA.png');  // Logo para o tema claro

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.switchContainer}>
        <View style={styles.leftItems}>
          {/* Exibe a logo de acordo com o tema */}
          <Image source={logoSource} style={styles.logo} />
        </View>

        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={() => console.log('Abrir Configurações')}>
            <BellRing size={28} color={colors.icon} />
            {/* Contador sobre o ícone */}
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setSettingsVisible(true)}>
            <Settings size={28} color={colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setExitModalVisible(true)}>
            <LogOut size={28} color={colors.icon} />
          </TouchableOpacity>
          
        </View>
      </View>

      <ConfirmExitModal
        visible={exitModalVisible}
        onConfirm={signOut}
        onCancel={() => setExitModalVisible(false)}
      />

      <SettingsModal 
        visible={settingsVisible} 
        onClose={() => setSettingsVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: '10%',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Distribui os itens entre esquerda e direita
  },
  leftItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // Espaçamento entre os itens da esquerda
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // Espaçamento entre os ícones na direita
    position: 'relative', // Necessário para o posicionamento absoluto do contador
  },
  logo: {
    width: 160, // Ajuste o tamanho da logo conforme necessário
    height: 130,  // Ajuste o tamanho da logo conforme necessário
    resizeMode: 'contain', // Garante que a imagem mantenha suas proporções
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
