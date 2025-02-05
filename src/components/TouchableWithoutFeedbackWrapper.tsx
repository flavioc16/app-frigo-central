import React from 'react';
import { TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';

const TouchableWithoutFeedbackWrapper = ({ onPress, children }: { onPress: () => void, children: React.ReactNode }) => {
  const handlePress = (event: any) => {
    // Somente para o Web: verificar se o clique foi fora de um input ou textarea
    if (Platform.OS === 'web') {
      const targetTag = event.target?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') {
        return; // Não chama onPress se o foco estiver nos inputs
      }
    }

    onPress?.(); // Chama o onPress para outros casos
  };

  if (Platform.OS === 'web') {
    return <div onClick={handlePress}>{children}</div>;
  }

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      {children}
    </TouchableWithoutFeedback>
  );
};

export { TouchableWithoutFeedbackWrapper };
