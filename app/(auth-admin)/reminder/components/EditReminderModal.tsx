import React from "react";
import { useState, useEffect } from "react";

import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import { X } from "lucide-react-native";
import { api } from "../../../../src/services/api";
import { useTheme } from "../../../../src/context/ThemeContext";
import { Colors } from "../../../../constants/Colors";

interface EditReminderModalProps {
  visible: boolean;
  onClose: () => void;
  updateReminders: () => void;
  reminderId?: string;
}

export default function EditReminderModal({ visible, onClose, updateReminders, reminderId }: EditReminderModalProps) {
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;
  
  const [descricao, setDescricao] = useState("");
  const [notification, setNotification] = useState("1");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (reminderId) {
      fetchReminderDetails();
    }
  }, [reminderId]);


  const fetchReminderDetails = async () => {
    setFetching(true);
    try {
      const response = await api.get(`/lembrete/${reminderId}`);
      setDescricao(response.data.descricao);
      setNotification(response.data.notification.toString());
    } catch (error) {
      Alert.alert("Erro", "Falha ao buscar lembrete.");
    } finally {
      setFetching(false);
    }
  };

  const handleEditReminder = async () => {
    if (!descricao.trim()) {
      Alert.alert("Erro", "A descrição do lembrete é obrigatória.");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/lembrete/${reminderId}`, { descricao, notification: Number(notification) });
      Alert.alert("Sucesso", "Lembrete atualizado!");
      updateReminders();
      onClose();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível editar o lembrete.");
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
            <Text style={[styles.title, { color: colors.text }]}>Editar Lembrete</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {fetching ? (
            <ActivityIndicator size="large" color={colors.tint} />
          ) : (
            <>
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
                onPress={handleEditReminder}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Text>
              </TouchableOpacity>
            </>
          )}
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
