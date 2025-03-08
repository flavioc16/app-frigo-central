import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { X } from "lucide-react-native";
import { api } from "../../../../src/services/api";
import { useTheme } from "../../../../src/context/ThemeContext";
import { Colors } from "../../../../constants/Colors";

interface CreateReminderModalProps {
  visible: boolean;
  onClose: () => void;
  updateReminders: () => void;
}

export default function CreateReminderModal({ visible, onClose, updateReminders }: CreateReminderModalProps) {
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;
  const [descricao, setDescricao] = useState("");
  const [notification, setNotification] = useState("1");
  const [loading, setLoading] = useState(false);

  const handleCreateReminder = async () => {
    if (!descricao.trim()) {
      Alert.alert("Erro", "A descrição do lembrete é obrigatória.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/reminders", { descricao, notification: Number(notification) });
      Alert.alert("Sucesso", "Lembrete criado com sucesso!");
      updateReminders();
      onClose();
      setDescricao("");
      setNotification("1");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível criar o lembrete.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={[styles.modalContainer, { backgroundColor: colors.background }]}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Novo Lembrete</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="Descrição do lembrete"
            placeholderTextColor={colors.placeholder}
            value={descricao}
            onChangeText={setDescricao}
          />

          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="Tipo de notificação (1 = diário, 2 = semanal)"
            placeholderTextColor={colors.placeholder}
            keyboardType="numeric"
            value={notification}
            onChangeText={setNotification}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.icon }]}
            onPress={handleCreateReminder}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: colors.buttonText }]}>
              {loading ? "Salvando..." : "Criar Lembrete"}
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContainer: {
    width: "90%",
    padding: 20,
    borderRadius: 10
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15
  },
  title: {
    fontSize: 18,
    fontWeight: "bold"
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold"
  }
});
