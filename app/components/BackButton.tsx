import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native'; // Importando o ícone ArrowLeft
import { Colors } from '../../constants/Colors'; // Adapte o caminho conforme necessário
import { useTheme } from '../../src/context/ThemeContext'; // Certifique-se de importar o contexto correto

const BackButton = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  return (
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <ArrowLeft size={24} color={Colors[theme].text} />
    </TouchableOpacity>
  );
};

export default BackButton;
