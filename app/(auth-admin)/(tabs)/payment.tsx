import { useState } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../src/context/ThemeContext'; // Importando o contexto de tema
import { Colors } from '../../../constants/Colors'; // Verifique se o caminho está correto
import { X } from 'lucide-react-native'; // Ícone de fechar
import SearchInput from '@/app/components/SearchInput';
import ButtonAdd from '@/app/components/ButtonAdd';

export default function ClientScreen() {
  const { theme } = useTheme(); // Obtém o tema do contexto
  const colors = Colors[theme] || Colors.light; // Garantir que sempre haja um fallback
  const [modalVisible, setModalVisible] = useState(false); // Estado do modal
  const [search, setSearch] = useState('');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Título */}
      <View style={styles.titleContainer}>
        <Text style={{ fontSize: 20, color: colors.text, fontWeight: 'bold' }}>
          Pagamentos
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.text }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>Abrir Modal</Text>
      </TouchableOpacity>

      {/* Modal - Tela Completa */}
      <Modal
        animationType="slide" // Tipos: 'none', 'slide', 'fade'
        visible={modalVisible} // Estado de visibilidade
        onRequestClose={() => setModalVisible(false)} // Fecha o modal ao pressionar "Voltar" no Android
      >
        <View style={[styles.fullscreenModal, { backgroundColor: colors.background }]}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Tela de Pagamentos</Text>
            <Text style={{ color: colors.text, textAlign: 'center' }}>
              Aqui é onde você pode gerenciar os pagamentos dos clientes.
            </Text>
            <SearchInput
                value={search}
                onChangeText={setSearch}
                placeholder="Nome do cliente"
            />
            <SearchInput
                value={search}
                onChangeText={setSearch}
                placeholder="Referencia  do cliente"
            />
            <SearchInput
                value={search}
                onChangeText={setSearch}
                placeholder="Endereço do cliente"
            />
            <SearchInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por nome, referência ou endereço"
            />

            <ButtonAdd 
                    onPress={() => 
                      setModalVisible(false)
                    }
                    label="Adicionar Cliente"
                  />

            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setModalVisible(false)}
            >
              <X size={30} color={colors.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullscreenModal: {
    flex: 1,
    paddingTop: 20, // Ajuste para evitar sobreposição com a barra de status
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 30,
    right: 20,
    zIndex: 10,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});
