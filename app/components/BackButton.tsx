import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native'; 
import { Colors } from '../../constants/Colors'; 
import { useTheme } from '../../src/context/ThemeContext'; 

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
