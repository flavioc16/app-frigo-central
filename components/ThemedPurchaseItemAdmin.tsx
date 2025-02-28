import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../src/context/ThemeContext"; // Importando o contexto de tema
import { Colors } from "../constants/Colors"; // Importando o arquivo de cores
import { MoreVertical } from "lucide-react-native"; // Ícone de três pontinhos


interface ThemedPurchaseItemProps {
  id: string;
  descricaoCompra: string;
  totalCompra: number;
  valorInicialCompra: number;
  tipoCompra: number;
  statusCompra: number;
  created_at: string;
  updated_at: string;
  dataDaCompra: string;
  dataVencimento: string;
  isVencida: number;
  onOptionsPress?: (id: string, descricaoCompra: string) => void; // Função para capturar clique nos três pontinhos
}

export default function ThemedPurchaseItemAdmin({
  id,
  descricaoCompra,
  totalCompra,
  dataDaCompra,
  isVencida,
  onOptionsPress, // Função recebida como prop
}: ThemedPurchaseItemProps) {

  const formatDate = (date: string) => {
    const formattedDate = new Date(date);
    const day = formattedDate.getDate().toString().padStart(2, "0"); 
    const month = (formattedDate.getMonth() + 1).toString().padStart(2, "0"); 
    const year = formattedDate.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const { theme } = useTheme();
  const backgroundColor = isVencida ? "#ff4d4d" : Colors[theme].cardBackground;
  const colors = Colors[theme] || Colors.light;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={[styles.text, { color: colors.text, fontWeight: "bold", fontSize: 16 }]}>
            {descricaoCompra}
          </Text>
          <Text style={[styles.text, { color: colors.text }]}>
            {formatDate(dataDaCompra)}
          </Text>
          <Text style={[styles.text, { color: colors.text, fontWeight: "bold" }]}>
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalCompra)}
          </Text>
        </View>

        <TouchableOpacity style={styles.iconContainer} onPress={() => onOptionsPress?.(id, descricaoCompra)}>
          <MoreVertical size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginTop: 15,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  text: {
    paddingVertical: 2,
    fontSize: 14,
  },
  iconContainer: {
    padding: 8,
  },
});
