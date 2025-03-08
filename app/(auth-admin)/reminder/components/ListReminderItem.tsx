import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  FlatList,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  InteractionManager
} from "react-native";
import { Bell, Plus, EllipsisVertical } from "lucide-react-native";
import { api } from "../../../../src/services/api";
import { ThemedText } from "../../../../components/ThemedText";
import { useRouter } from "expo-router";
import { useTheme } from "../../../../src/context/ThemeContext";
import { Colors } from "../../../../constants/Colors";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import ButtonAdd from "@/app/components/ButtonAdd";
import SearchInput from "@/app/components/SearchInput";
import CreateReminderModal from "../components/CreateReminderModal";
import EditReminderModal from "../components/EditReminderModal";
import ReminderBottomSheet from "../components/ReminderBottomSheet";
import ConfirmModal from "@/app/components/ConfirmModal";
import { format, parseISO } from 'date-fns';

export interface Reminder {
  id: string;
  descricao: string;
  notification: number;
  dataCadastro: string;
  created_at: string;
  updated_at: string;
}

export default function ListReminderItem() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => (Platform.OS === "ios" ? ["28%", "80%"] : ["28%", "85%"]), []);

  const [selectedReminderId, setSelectedReminderId] = useState<string | undefined>(undefined);
  const [selectedReminderDesc, setSelectedReminderDesc] = useState<string | null>(null);

  const handleOpenBottomSheet = useCallback((id: string, descricao: string) => {
    InteractionManager.runAfterInteractions(() => {
      setSelectedReminderId(id);
      setSelectedReminderDesc(descricao);
      bottomSheetRef.current?.present();
    });
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

  const handleBottomSheetChange = useCallback((index: number) => {
    if (index === -1) {
      setSelectedReminderId(undefined);
      setSelectedReminderDesc(null);
    }
  }, []);

  const handleEditReminder = (id: string) => {
    setEditModalVisible(true);
    setSelectedReminderId(id);
    bottomSheetRef.current?.close();
  };

  const handleDeleteReminder = (id: string) => {
    bottomSheetRef.current?.close();
    setReminderToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (reminderToDelete) {
      try {
        await api.delete(`/lembrete/${reminderToDelete}`, {
          headers: {
            "Content-Type": "application/json"
          },
          data: { id: reminderToDelete }
        });
        updateReminders();
        bottomSheetRef.current?.close();
      } catch (err) {
        Alert.alert("Erro", "Não foi possível excluir o lembrete.");
      } finally {
        setDeleteModalVisible(false);
        setReminderToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setReminderToDelete(null);
  };

  const fetchReminders = async () => {
    try {
      const response = await api.get<Reminder[]>("/lembretes");
      setReminders(response.data);
    } catch (err) {
      setError("Erro ao buscar lembretes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [reminders]);

  const updateReminders = async () => {
    await fetchReminders();
  };

  const filteredReminders = useMemo(() => {
    if (search.trim() === "") {
      return reminders;
    }
  
    const lowerSearch = search.toLowerCase();
    
  
    return reminders.filter(reminder => {
      const matchesDescription = reminder.descricao.toLowerCase().includes(lowerSearch);
      const matchesDate = formatDate(reminder.dataCadastro).toLowerCase().includes(lowerSearch);
      return matchesDescription || matchesDate;
    });
  }, [search, reminders]);
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (error) {
    return <Text style={[styles.error, { color: colors.error }]}>{error}</Text>;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.themedContainer, { flex: 1 }]}>
            <SearchInput 
                value={search} 
                onChangeText={setSearch} 
                placeholder="Buscar por descricao ou data a notificar" 
            />

          <ButtonAdd
            onPress={() => {
              Keyboard.dismiss();
              setModalVisible(true);
            }}
            iconRight={<Plus size={24} color={colors.success} />}
            label="Adicionar Lembrete"
          />

          {filteredReminders.length === 0 && search.length > 0 ? (
            <ThemedText style={[styles.noResults, { color: colors.text }]}>Nenhum lembrete encontrado.</ThemedText>
          ) : (
            <FlatList
            showsVerticalScrollIndicator={false}
            data={filteredReminders}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <View style={[styles.reminderContainer, { backgroundColor: colors.cardBackground }]}>
                <View style={styles.reminderInfo}>
                  <Text style={[styles.descricao, { color: colors.text }]}>{item.descricao}</Text>
                  <Text style={[styles.date, { color: colors.text }]}>
                    Data a notificar: {formatDate(item.dataCadastro)}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => {
                    Keyboard.dismiss(); 
                    handleOpenBottomSheet(item.id, item.descricao);
                  }}
                >
                  <EllipsisVertical size={25} color={colors.icon} style={styles.chevronIcon} />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContent}>
                <Text style={[styles.noResults, { color: colors.text }]}>Nenhum lembrete encontrado.</Text>
              </View>
            )}
            ListFooterComponent={<View style={{ height: 75 }} />}
          />
          
          )}

          <ConfirmModal
            visible={deleteModalVisible}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            title="Excluir Lembrete"
            message="Tem certeza que deseja excluir este lembrete?"
            confirmText="Excluir"
            cancelText="Cancelar"
          />

          <ReminderBottomSheet
            selectedReminderId={selectedReminderId}
            selectedReminderDescription={selectedReminderDesc}
            colors={colors}
            onEditReminder={handleEditReminder}
            onDeleteReminder={handleDeleteReminder}
            bottomSheetRef={bottomSheetRef}
            snapPoints={snapPoints}
            onChange={handleBottomSheetChange}
          />

          <EditReminderModal
            visible={editModalVisible}
            onClose={() => setEditModalVisible(false)}
            updateReminders={updateReminders}
            reminderId={selectedReminderId!}
          />

          <CreateReminderModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            updateReminders={updateReminders}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientContainer: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 20,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clientInfo: {
    flex: 1,
  },
  name: {
    marginBottom: 4,
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  info: {
    fontSize: 14,
  },
  error: {
    textAlign: 'center',
    marginTop: 10,
  },
  themedContainer: {
    flex: 1,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontStyle: 'italic'
  },
  chevronIcon: {
    marginLeft: 10,
  },
  overlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    zIndex: 1,
  },
  reminderContainer: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderInfo: {
    flex: 1,
  },
  descricao: {
    marginBottom: 4,
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
  },
  emptyContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
