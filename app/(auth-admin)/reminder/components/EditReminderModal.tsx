import React, { useState, useRef, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity,
  Pressable, 
  StyleSheet, 
  ActivityIndicator, 
  TextInput, 
  Alert, 
  Platform,
  FlatList
} from 'react-native';
import { Calendar, X } from 'lucide-react-native';
import { useTheme } from '../../../../src/context/ThemeContext';
import { Colors } from '../../../../constants/Colors';
import InputForm from '@/app/components/InputForm';
import { ThemedText } from '@/components/ThemedText';
import { api } from '@/src/services/api';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';


interface Lembrete {
  descipton: string;
  notification: boolean;
  dateCreated: string;
}

interface EditReminderModalProps {
  visible: boolean;
  onClose: () => void;
  updateReminders?: () => void;
  reminderId: string;
}

const EditReminderModal: React.FC<EditReminderModalProps> = ({ visible, onClose, updateReminders, reminderId }) => {
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;
  const [id, setId] = useState('');
  const [descipton, setDescriptionReminders] = useState('');
  const [dateCreated, setDateCreated] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [loadingEdite, setLoadingEdite] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const descricaoRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible && reminderId) {
      fetchReminderDetails(reminderId);
    }
  }, [visible, reminderId]);

  const fetchReminderDetails = async (id: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/lembrete/${reminderId}`);
      const reminderData = response.data;

      setId(reminderData.id);
      setDescriptionReminders(reminderData.descricao);
      setDateCreated(new Date(reminderData.dataCadastro));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('Erro', 'Erro ao buscar os detalhes do lembrete.');
    }
  };

  const capitalizeFirstLetter = (text: string) => {
    return text
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleEditReminder = async () => {
    setSubmitted(true);
  
    if (!descipton.trim()) {
      descricaoRef.current?.focus();
      return;
    }
  
    setLoadingEdite(true);
  
    try {
      if (!id) {
        throw new Error("ID do lembrete não fornecido.");
      }
  
      const reminderData = {
        dataCadastro: dateCreated.toISOString(),
        descricao: descipton,
        notification: false,
      };
  
      const response = await api.put(`/lembrete/${id}`, reminderData);
  
      setLoadingEdite(false);
      setSubmitted(false);
      onClose();
  
      if (updateReminders) {
        await updateReminders();
      } 
      
    } catch (error) {
      setLoadingEdite(false);
      setSubmitted(false);
  
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Erro ao editar lembrete.";
        Alert.alert("Erro", errorMessage);
        console.error("Erro da API:", error.response?.data);
      } else {
        Alert.alert("Erro", "Erro desconhecido. Tente novamente.");
        console.error("Erro desconhecido:", error);
      }
    }
  };
  
  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
  };

  const onChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDateCreated(selectedDate);
      setShowPicker(false); 
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <FlatList
          data={[1]}
          keyExtractor={(item) => item.toString()}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          renderItem={() => (
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.tint} />
              </View>
            ) : (
              <View style={styles.modalContent}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Editar Lembrete</Text>
                <InputForm
                  label="Descrição"
                  value={capitalizeFirstLetter(descipton)}
                  placeholder="Descrição do lembrete"
                  onChangeText={setDescriptionReminders}
                  error={submitted && !descipton.trim() ? 'A descrição é obrigatória' : ''}
                  ref={descricaoRef}
                  autoFocus
                />
                {!showPicker && (
                  <Pressable onPress={toggleDatePicker}>
                    <InputForm
                      label="Data a notificar"
                      value={dateCreated.toLocaleDateString('pt-BR')}
                      error={submitted && !dateCreated.toISOString().trim() ? 'A data é obrigatória' : ''}
                      editable={false}
                      onPressIn={toggleDatePicker}
                      onFocus={toggleDatePicker}
                      rightIcon={<Calendar size={20} color={colors.icon} />}
                    />
                  </Pressable>
                )}
                {showPicker && (
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <DateTimePicker
                      value={dateCreated}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                      onChange={onChange}
                      locale="pt-BR"
                      style={{
                        width: '100%',
                        backgroundColor: colors.background,
                        borderRadius: 8,
                      }}
                    />
                  </View>
                )}
          
                <TouchableOpacity
                  onPress={handleEditReminder}
                  style={[styles.button, loadingEdite && styles.disabledButton]}
                  disabled={loadingEdite}
                >
                  {loadingEdite ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                      Salvar Alterações
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            )
          )}
        />
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={30} color={colors.icon} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    paddingTop: 30 
  },
  modalContent: { 
    padding: 20 
  },
  scrollContent: {
    paddingBottom: 100, 
    paddingTop: 10 
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  closeButton: { 
    position: 'absolute', 
    top: 50, 
    right: 10, 
    padding: 10 
  },
  button: { 
    marginTop: 10, 
    backgroundColor: '#ae2121', 
    borderRadius: 8, 
    padding: 10, 
    alignItems: 'center' 
  },
  disabledButton: { 
    backgroundColor: '#7e1a1a' 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  cancelButton: { 
    backgroundColor: '#7e1a1a' 
  },
  confirmButton: { 
    backgroundColor: '#ae2121' 
  },
  loadingContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems:'center'
  }
});

export default EditReminderModal;
