import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { useTheme } from '../../src/context/ThemeContext';
import { Colors } from '../../constants/Colors';
import { ReactNode } from 'react';

interface AddClientButtonProps {
  onPress: () => void;
  label: string;
  iconLeft?: ReactNode;  // Ícone à esquerda é agora um componente React opcional
  iconRight?: ReactNode;  // Ícone à direita é opcional, pode ser qualquer componente React
  type?: 'success' | 'warning' | 'danger' | 'icon';  // Tipo de ação para a cor do texto
}

export default function ButtonAdd({ onPress, label, iconLeft, iconRight, type = 'icon' }: AddClientButtonProps) {
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;

  // Definir a cor do texto de acordo com o tipo
  const textColor = type === 'danger' ? colors.error :
                    type === 'warning' ? colors.warning :
                    colors.icon;

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.inputBackground }]} 
      onPress={onPress}
    >
      {/* Container para o conteúdo principal, incluindo ícones e texto */}
      <View style={[styles.content, { flexDirection: 'row', alignItems: 'center' }]}> 
        {/* Exibe o ícone à esquerda, se fornecido */}
        {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
        
        {/* Texto centralizado com a cor ajustada */}
        <ThemedText style={[styles.text, { color: textColor }]}>{label}</ThemedText>
      </View>

      {/* Exibe o ícone à direita, se fornecido */}
      {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginStart: 10,
    marginEnd: 10,
    height: 50,
    justifyContent: 'space-between',  // Certifica que o conteúdo será distribuído com espaço entre
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,  // Permite que o texto ocupe o espaço disponível, sem sobrepor os ícones
  },
  text: {
    fontSize: 17,
    marginLeft: 8,  // Espaço entre o ícone e o texto
  },
  iconLeft: {
    marginRight: 8,  // Espaço entre o ícone à esquerda e o texto
  },
  iconRight: {
    marginLeft: 10,  // Espaço entre o texto e o ícone à direita
  },
});
