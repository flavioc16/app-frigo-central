import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Bell, CircleAlert } from 'lucide-react-native';
import { api } from '../../../src/services/api';

// Definindo as interfaces para as notificações
interface NotificationJuros {
  id: string;
  title: string;
  description: string;
  date: string;
  status: number;
  iconType: "bell" | "alert";
  link: string;
}

interface NotificationLembrete {
  id: string;
  title: string;
  details: string;
  dueDate: string;
  status: number;
  link: string;
}

export default function Notifications() {
  const [notificationCount, setNotificationCount] = useState(0);
  const [lembretesCount, setLembreteCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsJuros, setNotificationsJuros] = useState<NotificationJuros[]>([]);
  const [notificationsLembrete, setNotificationsLembrete] = useState<NotificationLembrete[]>([]);

  const handleOpenNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      await fetchNotificationsJurosItem();
      await fetchNotificationsLembreteItem();
    }
  };

  const fetchJurosClientesCount = useCallback(async () => {
    try {
      const { data } = await api.get('/juros/count');
      setNotificationCount(data.count);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const fetchLembretesCount = useCallback(async () => {
    try {
      const { data } = await api.get('/lembretes/count');
      setLembreteCount(data.count);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const fetchNotificationsJurosItem = async () => {
    try {
      const { data } = await api.get('/juros/clients');
      setNotificationsJuros(data);
    } catch (err) {
      console.log('Erro ao buscar notificações de juros');
    }
  };

  const fetchNotificationsLembreteItem = async () => {
    try {
      const { data } = await api.get('/lembretes/today');
      setNotificationsLembrete(data);
    } catch (err) {
      console.log('Erro ao buscar lembretes');
    }
  };

  useEffect(() => {
    fetchLembretesCount();
    fetchJurosClientesCount();
  }, []);

  const handleNotificationClick = async (id: string) => {
    try {
      await api.put(`/juros/clients/${id}`);
      Alert.alert('Notificação atualizada');
      setShowNotifications(false);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar status da notificação.');
    }
  };

  const handleNotificationClickLembrete = async (id: string) => {
    try {
      await api.put(`/lembrete/${id}`, { notification: true });
      Alert.alert('Lembrete atualizado');
      setShowNotifications(false);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar status do lembrete.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconsContainer}>
        <TouchableOpacity onPress={handleOpenNotifications}>
          <Bell size={24} color="#000" />
          {(notificationCount + lembretesCount) > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount + lembretesCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {showNotifications && (
        <View style={styles.notificationsBox}>
          <Text style={styles.header}>Central de Notificações</Text>
          <ScrollView contentContainerStyle={{ gap: 12 }}>
            {notificationsLembrete.length === 0 && notificationsJuros.length === 0 ? (
              <Text style={styles.emptyText}>Não há notificações para exibir.</Text>
            ) : (
              <>
                {notificationsLembrete.map((n) => (
                  <TouchableOpacity
                    key={n.id}
                    style={styles.notificationItem}
                    onPress={() => handleNotificationClickLembrete(n.id)}
                  >
                    <Bell size={18} color="#FFF" />
                    <View>
                      <Text style={styles.notificationTitle}>{n.title}</Text>
                      <Text style={styles.notificationDetails}>{n.details}</Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {notificationsJuros.map((n) => {
                  const Icon = n.iconType === 'bell' ? Bell : CircleAlert;
                  return (
                    <TouchableOpacity
                      key={n.id}
                      style={styles.notificationItem}
                      onPress={() => handleNotificationClick(n.id)}
                    >
                      <Icon size={18} color="#FFF" />
                      <View>
                        <Text style={styles.notificationTitle}>{n.title}</Text>
                        <Text style={styles.notificationDetails}>{n.description}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconsContainer: { flexDirection: 'row', gap: 16 },
  badge: { position: 'absolute', right: -6, top: -6, backgroundColor: 'red', borderRadius: 10, paddingHorizontal: 5 },
  badgeText: { color: '#fff', fontSize: 10 },
  notificationsBox: {
    position: 'absolute',
    top: 60,
    right: 0,
    width: 300,
    maxHeight: 400,
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    zIndex: 99,
  },
  header: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  emptyText: { color: '#aaa', fontSize: 14, textAlign: 'center', marginTop: 20 },
  notificationItem: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: '#333', padding: 10, borderRadius: 6 },
  notificationTitle: { color: '#fff', fontWeight: 'bold' },
  notificationDetails: { color: '#ccc', fontSize: 12 },
});
