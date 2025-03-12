import { StyleSheet, View } from 'react-native';
import ListProductItem from '../product/components/ListProductItem';
import { useTheme } from '../../../src/context/ThemeContext';
import { Colors } from '../../../constants/Colors';

export default function ClientScreen() {
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light; 

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.titleContainer}>
      </View>
      <ListProductItem />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: '8%',
    borderBottomEndRadius: 10,
  },
});
