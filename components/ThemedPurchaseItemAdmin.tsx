import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../src/context/ThemeContext"; 
import { Colors } from "../constants/Colors"; 
import { CalendarCheck, DollarSign, MoreVertical } from "lucide-react-native"; 

interface ThemedPurchaseItemProps {
  id: string;
  descricaoCompra: string;
  totalCompra: number;
  dataDaCompra: string;
  isVencida: number;
  onOptionsPress?: (id: string, descricaoCompra: string) => void;
}

export default function ThemedPurchaseItemAdmin({
  id,
  descricaoCompra,
  totalCompra,
  dataDaCompra,
  isVencida,
  onOptionsPress,
}: ThemedPurchaseItemProps) {


  const formatDate = (date: string) => {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;
  const backgroundColor = isVencida ? colors.vencida : colors.cardBackground;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={[styles.titleText, { color: colors.text }]}>
            {descricaoCompra}
          </Text>
          <View style={styles.textRow}>
            <CalendarCheck size={16} color={colors.icon} style={styles.icon} />
            <Text style={[styles.text, { color: colors.text }]}>
              {formatDate(dataDaCompra)}
            </Text>
          </View>
          <View style={styles.textRow}>
            <DollarSign size={16} color={colors.icon} style={styles.icon} />
            <Text style={[styles.text, styles.boldText, { color: colors.text }]}>
              {totalCompra.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => onOptionsPress?.(id, descricaoCompra)}>
          <MoreVertical size={24} color={colors.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginTop: 12,
    borderRadius: 8,
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
  textRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
  },
  boldText: {
    fontWeight: "bold",
  },
  icon: {
    marginRight: 6,
  },
  
});
