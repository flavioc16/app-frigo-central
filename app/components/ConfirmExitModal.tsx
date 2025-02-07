import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '../../src/context/ThemeContext';
import { BlurView } from 'expo-blur'; // Importando BlurView do Expo

interface ConfirmExitModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmExitModal({ visible, onConfirm, onCancel }: ConfirmExitModalProps) {
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;

  return (
    <Modal visible={visible} animationType="none" transparent>
      <View style={styles.modalContainer}>
        {/* Adicionando BlurView para efeito de desfoque */}
        <BlurView 
          style={styles.blurView} 
          intensity={30} // Intensidade do blur (de 0 a 100)
          tint={theme === 'dark' ? 'light' : 'dark'}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Sair</Text>
            <Text style={[styles.modalText, { color: colors.text }]}>Tem certeza que deseja sair?</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                <Text style={[styles.modalButton, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onConfirm} style={styles.confirmButton}>
                <Text style={[styles.modalButton, { color: colors.tint }]}>Sim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginRight: 10,
  },
  confirmButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalButton: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
