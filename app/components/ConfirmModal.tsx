import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '../../src/context/ThemeContext';
import { BlurView } from 'expo-blur'; // Importando BlurView do Expo

interface ConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string; 
  message: string; 
  confirmText?: string; 
  cancelText?: string; 
  idToDelete?: string
}

export default function ConfirmModal({
  visible,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Sim',
  cancelText = 'Cancelar',
}: ConfirmModalProps) {
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;

  return (
    <Modal visible={visible} animationType="none" transparent>
      <View style={styles.modalContainer}>
        <BlurView 
          style={styles.blurView} 
          intensity={30} 
          tint={theme === 'dark' ? 'light' : 'dark'}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.bottomSheetBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.modalText, { color: colors.text }]}>{message}</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                <Text style={[styles.modalButton, { color: colors.text }]}>{cancelText}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onConfirm} style={styles.confirmButton}>
                <Text style={[styles.modalButton, { color: colors.tint }]}>{confirmText}</Text>
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