import React, { useRef, useEffect } from 'react';
import SelectDropdown from 'react-native-select-dropdown';
import { View, Text } from 'react-native';
import { Colors } from '../../../../constants/Colors'; // Ajuste o caminho conforme necessário
import { useTheme } from '../../../../src/context/ThemeContext';

type InputFormDropdownProps = {
  label: string;
  value: string;
  setValue: (value: string) => void;
  error?: string;
};

const InputFormDropdown = ({ label, value, setValue, error }: InputFormDropdownProps) => {
  const dropdownRef = useRef<SelectDropdown>(null);
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;

  const options = [
    { label: 'Compra', value: '0' },
    { label: 'Serviço', value: '1' },
  ];

  useEffect(() => {
    if (!value) setValue('0');
  }, [value, setValue]);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: colors.text, marginBottom: 8 }}>{label}</Text>

      <SelectDropdown
        ref={dropdownRef}
        data={options}
        defaultValue={options.find((option) => option.value === value)}
        onSelect={(selectedItem) => setValue(selectedItem.value)}
        renderButton={(selectedItem) => (
          <View
            style={{
              width: '100%',
              borderRadius: 8,
              backgroundColor: colors.cardBackground,
              padding: 10,
            }}
          >
            <Text style={{ color: colors.text, textAlign: 'left' }}>
              {selectedItem ? selectedItem.label : 'Selecione o tipo'}
            </Text>
          </View>
        )}
        renderItem={(item, index) => (
          <View>
            <View
              style={{
                width: '100%',
                backgroundColor: colors.cardBackground,
                padding: 15,
              }}
            >
              <Text style={{ color: colors.text, textAlign: 'left' }}>{item.label}</Text>
            </View>

            {index !== options.length - 1 && (
              <View
                style={{
                  height: 0.3,
                  backgroundColor: colors.tabIconDefault,
                }}
              />
            )}
          </View>
        )}
      />
      {error && <Text style={{ color: colors.error, marginTop: 4 }}>{error}</Text>}
    </View>
  );
};

export default InputFormDropdown;
