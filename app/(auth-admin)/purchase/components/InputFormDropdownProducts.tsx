import React, { useState, useMemo } from 'react';
import { 
  View, Text, TextInput, FlatList, 
  TouchableOpacity, Keyboard, TouchableWithoutFeedback 
} from 'react-native';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../src/context/ThemeContext';
import { X } from 'lucide-react-native';

type Produto = {
  id: string;
  nome: string;
  descricao: string;
  precoAVista: number;
  precoAPrazo: number;
};

type InputFormDropdownProductsProps = {
  label: string;
  placeholder?: string;
  value: string;
  setValue: (value: string) => void;
  error?: string;
  produtos: Produto[];
};

const InputFormDropdownProducts = ({ placeholder = "Selecione um produto...", label, value, setValue, error, produtos = [] }: InputFormDropdownProductsProps) => {
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;

  const [query, setQuery] = useState(value);  // Usa o valor inicial como query
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredProdutos = useMemo(
    () => produtos.filter((produto) => produto.nome.toLowerCase().includes(query.toLowerCase())),
    [query, produtos]
  );

  const handleSelectProduto = (selectedItem: Produto) => {
    setValue(selectedItem.nome);
    setQuery(selectedItem.nome);
    setShowDropdown(false);
  };

  const handleBlur = () => {
    if (query.trim() && !produtos.some(produto => produto.nome.toLowerCase() === query.toLowerCase())) {
      setValue(query); 
    }
    setShowDropdown(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: colors.text, marginBottom: 8 }}>{label}</Text>

        <View style={{ position: 'relative', width: '100%' }}>
          <TextInput
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              setShowDropdown(true);
            }}
            placeholder={placeholder}
            placeholderTextColor={colors.tabIconDefault}
            style={{
              width: '100%',
              borderRadius: 8,
              backgroundColor: colors.cardBackground,
              padding: 12,
              color: colors.text,
              paddingRight: query ? 40 : 10,
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={handleBlur}
          />

          {query && (
            <TouchableOpacity
              onPress={() => { setQuery(''); setValue(''); }}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: [{ translateY: -10 }],
              }}
            >
              <X size={20} color={colors.icon} />
            </TouchableOpacity>
          )}
        </View>

        {showDropdown && filteredProdutos.length > 0 && (
          <FlatList
            data={filteredProdutos}
            keyExtractor={(item) => item.id}
            style={{
              maxHeight: 240,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.background,
              overflow: 'hidden',
            }}
            contentContainerStyle={{
              paddingVertical: 8,
            }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectProduto(item)}
                style={{
                  width: '100%',
                  backgroundColor: colors.cardBackground,
                  padding: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{ color: colors.text, textAlign: 'left' }}>
                  {item.nome}{item.descricao && item.descricao.trim() ? ` - ${item.descricao.trim()}` : ''} 
                  {' - '}
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.precoAVista / 100)}
                  {' | '}
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.precoAPrazo / 100)}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        {error && <Text style={{ color: colors.error, marginTop: 4 }}>{error}</Text>}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default InputFormDropdownProducts;
