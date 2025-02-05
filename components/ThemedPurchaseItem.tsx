import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeColor } from "../hooks/useThemeColor"; // Supondo que o hook esteja configurado corretamente

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

export default function ThemedPurchaseItem({
  descricaoCompra,
  totalCompra,
  dataDaCompra,
  dataVencimento,
  isVencida,
}: ThemedPurchaseItemProps) {
  // Função para formatar datas
  const formatDate = (date: string) => {
    const formattedDate = new Date(date);
    const day = formattedDate.getDate().toString().padStart(2, "0"); // Garantir que o dia tenha 2 dígitos
    const month = (formattedDate.getMonth() + 1).toString().padStart(2, "0"); // Ajustar o mês (0-11 para 1-12)
    const year = formattedDate.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Defina a cor de fundo com base no status de vencimento
  const backgroundColor = isVencida ? "#ff4d4d" : useThemeColor({ light: "#e0e0e0", dark: "#343a40" }, "background");
  const textColor = useThemeColor({ light: "#000", dark: "#fff" }, "text");

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.textContainer}>
        <View style={styles.row}>
          <Text style={[styles.text, { color: textColor, fontWeight: "bold", fontSize: 16 }]}>Descrição:</Text>
          <Text style={[styles.text, { color: textColor, fontWeight: "bold", fontSize: 16 }]}>{descricaoCompra}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.text, { color: textColor }]}>Data da compra:</Text>
          <Text style={[styles.text, { color: textColor}]}>{formatDate(dataDaCompra)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.text, { color: textColor }]}>Vencimento:</Text>
          <Text style={[styles.text, { color: textColor}]}>{formatDate(dataVencimento)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.text, { color: textColor }]}>Valor:</Text>
          <Text style={[styles.text, { color: textColor, fontWeight: "bold"  }]}>
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalCompra)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // Para alinhar o conteúdo de forma horizontal
    padding: 10,
    marginTop: 15,
    borderRadius: 5,
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
