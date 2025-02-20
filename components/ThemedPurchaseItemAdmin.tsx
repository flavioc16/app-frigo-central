import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../src/context/ThemeContext"; // Importando o contexto de tema
import { Colors } from "../constants/Colors"; // Importando o arquivo de cores
import SearchInput from "@/app/components/SearchInput";

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
}

export default function ThemedPurchaseItemAdmin({
  descricaoCompra,
  totalCompra,
  dataDaCompra,
  isVencida,
}: ThemedPurchaseItemProps) {

  const formatDate = (date: string) => {
    const formattedDate = new Date(date);
    const day = formattedDate.getDate().toString().padStart(2, "0"); // Garantir que o dia tenha 2 dígitos
    const month = (formattedDate.getMonth() + 1).toString().padStart(2, "0"); // Ajustar o mês (0-11 para 1-12)
    const year = formattedDate.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const { theme } = useTheme();
  const backgroundColor = isVencida ? "#ff4d4d" : Colors[theme].cardBackground;
  const colors = Colors[theme] || Colors.light;

  return (
    
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.textContainer}>
        <View style={styles.row}>
          <Text style={[styles.text, { color: colors.text, fontWeight: "bold", fontSize: 16 }]}>Descrição:</Text>
          <Text style={[styles.text, { color: colors.text, fontWeight: "bold", fontSize: 16 }]}>{descricaoCompra}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.text, { color: colors.text }]}>Data da compra:</Text>
          <Text style={[styles.text, { color: colors.text}]}>{formatDate(dataDaCompra)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.text, { color: colors.text }]}>Valor:</Text>
          <Text style={[styles.text, { color: colors.text, fontWeight: "bold"  }]}>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalCompra)}</Text>
        </View>
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
  textContainer: {
    flex: 1, // O conteúdo ocupa o restante do espaço
  },
  row: {
    flexDirection: "row", // Alinha os itens de forma horizontal
    justifyContent: "space-between", // Coloca o label e o dado nas extremidades
  },
  text: {
    paddingVertical: 2,
    fontSize: 14,
  },
});
