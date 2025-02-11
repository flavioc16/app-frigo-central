import { StyleSheet, Text, View, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../src/context/ThemeContext'; 
import { Colors } from '../../../constants/Colors'; 
import ConfirmExitModal from '../../../app/components/ConfirmExitModal';
import { useContext, useState, useCallback } from 'react';
import { AuthContext } from '@/src/context/AuthContext';
import { LogOut } from 'lucide-react-native';

type SettingsModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { theme, toggleTheme } = useTheme();
  const colors = Colors[theme] || Colors.light; 
  const { signOut } = useContext(AuthContext);
  const [exitModalVisible, setExitModalVisible] = useState(false);

  const handleSignOut = () => {
    signOut();
  };

  return (
    <View style={[styles.fullscreenModal, { backgroundColor: colors.background }]}>
   

      <View style={styles.settingItem}>
        <Text style={{ color: colors.text }}>
          {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        </Text>
        <Switch 
          value={theme === 'dark'} 
          onValueChange={toggleTheme}
          trackColor={{ false: colors.switchTrackFalse, true: colors.switchTrackTrue }}
          thumbColor={colors.switchThumb}
        />
      </View>

      <TouchableOpacity style={styles.settingItem} onPress={() => setExitModalVisible(true)}>
        <Text style={{ color: colors.text }}>Sair</Text>
        <LogOut size={28} color={colors.icon} />
      </TouchableOpacity>
        
      <ConfirmExitModal
        visible={exitModalVisible}
        onConfirm={handleSignOut}
        onCancel={() => setExitModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenModal: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,

  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 15,
    borderBottomWidth: 0.3,
    borderBottomColor: '#ccc',
  },
});
