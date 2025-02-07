import { Modal, StyleSheet, Text, View, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '../../../../src/context/ThemeContext'; 
import { Colors } from '../../../../constants/Colors'; 
import { X } from 'lucide-react-native'; // Ícone de fechar

// Definição dos tipos das props
type SettingsModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { theme, toggleTheme } = useTheme(); // Obtém o tema do contexto
  const colors = Colors[theme] || Colors.light; // Garantir que sempre haja um fallback

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.fullscreenModal, { backgroundColor: colors.background }]}>

        {/* Botão de Fechar */}
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose}
        >
          <X size={30} color={colors.icon} />
        </TouchableOpacity>

        {/* Título */}
        <Text style={[styles.modalTitle, { color: colors.text }]}>Configurações</Text>

        {/* Opções de Configuração */}
        <View style={styles.settingItem}>
          <Text style={{ color: colors.text }}>
            {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro '}
          </Text>
          <Switch 
            value={theme === 'dark'} 
            onValueChange={toggleTheme}
            trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }}
            thumbColor={colors.switchThumb}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullscreenModal: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 15,
    borderBottomWidth: 0.3,
    borderBottomColor: '#ccc',
  },
});
