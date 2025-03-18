import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TouchableWithoutFeedback, Keyboard, FlatList } from 'react-native';
import { Settings, BellRing } from "lucide-react-native";
import { useTheme } from '../../../src/context/ThemeContext'; 
import { Colors } from '../../../constants/Colors';  
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../src/services/api';

interface NotificationJuros {
  id: string;
  title: string;
  description: string;
  date: string;
  status: number | false;
  iconType: "bell" | "alert";
  link: string;
}

interface NotificationLembrete {
  id: string;
  title: string;
  details: string;
  dueDate: string;
  status: number | false;
  link: string;
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;
  const router = useRouter();

  const [notificationCount, setNotificationCount] = useState(0);
  const [lembreteCount, setLembreteCount] = useState(0);
  const [jurosCount, setJurosCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [notificationsJuros, setNotificationsJuros] = useState<NotificationJuros[]>([]);
  const [notificationsLembrete, setNotificationsLembrete] = useState<NotificationLembrete[]>([]);

  const fetchJurosClientesCount = useCallback(async () => {
    try {
      const { data } = await api.get('/juros/count');
      setJurosCount(data.count);
    } catch (err) {
      console.log('Erro ao buscar contagem de juros', err);
    }
  }, []);

  const fetchLembretesCount = useCallback(async () => {
    try {
      const { data } = await api.get('/lembretes/count');
      setLembreteCount(data.count);
    } catch (err) {
      console.log('Erro ao buscar contagem de lembretes', err);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLembretesCount();
      fetchJurosClientesCount();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const jurosData = await api.get('/juros/clients');
      const lembretesData = await api.get('/lembretes/today');
      setNotificationsJuros(jurosData.data);
      setNotificationsLembrete(lembretesData.data);
    } catch (err) {
      console.log('Erro ao buscar notificações', err);
    }
  };

  const updateNotificationCount = () => {
    setNotificationCount(jurosCount + lembreteCount);
  };

  const handleOpenNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      await fetchNotifications();
    }
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  useEffect(() => {
    fetchLembretesCount();
    fetchJurosClientesCount();
  }, []);

  useEffect(() => {
    updateNotificationCount();
  }, [jurosCount, lembreteCount]);

  const renderItem = ({ item }: { item: NotificationJuros | NotificationLembrete }) => {
    const isLembrete = (item as NotificationLembrete).details !== undefined;
    const status = (item as NotificationJuros).status ?? (item as NotificationLembrete).status;
  
    return (
      <TouchableOpacity
        onPress={() =>
          isLembrete
            ? router.push(`/(auth-admin)/(tabs)/reminder`)
            : router.push(`/(auth-admin)/client/${item.id}`)
        }
      >
        <View style={[styles.notificationItem, { backgroundColor: colors.bottomSheetBackground }]}>
          {(status === 0 || status === false) && (
            <View style={[styles.statusDot, { backgroundColor: colors.info }]} />
          )}
          <Text style={[styles.notificationTitle, { color: colors.text }]}>{item.title}</Text>
          <Text
            style={[
              styles.notificationDetails,
              { color: isLembrete ? colors.subtext : colors.tint },
            ]}
          >
            {isLembrete
              ? (item as NotificationLembrete).details
              : (item as NotificationJuros).description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  

  const combinedNotifications = [...notificationsLembrete, ...notificationsJuros];

  return (
    <TouchableWithoutFeedback onPress={handleCloseNotifications}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.switchContainer}>
          <View style={styles.leftItems}>
          <Image
            source={
              theme === 'dark'
                ? require('../../../assets/images/LOGO-VERMELHO-E-BRANCA.png')
                : require('../../../assets/images/LOGO-TODA-VERMELHA.png')
            }
            style={styles.logo}
          />
          </View>
          <View style={styles.rightIcons}>
            <TouchableOpacity onPress={handleOpenNotifications}>
              <BellRing size={28} color={colors.icon} />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/(auth-admin)/home/ModalConfig`)}>
              <Settings size={28} color={colors.icon} />
            </TouchableOpacity>
          </View>
        </View>

        {showNotifications && (
          <View style={[styles.notificationsBox, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.header, { color: colors.text }]}>Central de Notificações</Text>
            {combinedNotifications.length === 0 ? (
              <Text style={[styles.emptyText, {color: colors.text}]}>Não há notificações para exibir.</Text>
            ) : (
              <FlatList
                data={combinedNotifications}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    position: 'relative',
  },
  logo: {
    width: 160,
    height: 130,
    resizeMode: 'contain',
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
  notificationsBox: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 300,
    maxHeight: 400,
    borderRadius: 8,
    padding: 12,
    zIndex: 99,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  notificationItem: {
    flexDirection: 'column',
    gap: 5,
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 6,
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  notificationDetails: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  statusDot: {
    position: 'absolute',
    top: 23,
    right: 18,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
