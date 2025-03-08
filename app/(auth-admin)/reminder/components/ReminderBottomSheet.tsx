import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Colors } from '../../../../constants/Colors';
import { Edit, Trash2, CheckCircle } from "lucide-react-native";

interface ReminderBottomSheetProps {
  selectedReminderId: string | undefined;
  selectedReminderDescription: string | null;
  colors: typeof Colors.light | typeof Colors.dark;
  onEditReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  bottomSheetRef: React.RefObject<BottomSheetModal>;
  snapPoints: (string | number)[];
  onChange: (index: number) => void;
}

const ReminderBottomSheet: React.FC<ReminderBottomSheetProps> = ({
  selectedReminderId,
  selectedReminderDescription,
  colors,
  onEditReminder,
  onDeleteReminder,
  bottomSheetRef,
  snapPoints,
  onChange,
}) => {
  const renderBackdrop: React.FC<BottomSheetBackdropProps> = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      animationConfigs={{
        duration: 300, 
      }}
      animateOnMount={true} 
      backgroundStyle={{ 
        backgroundColor: colors.bottomSheetBackground,
        borderRadius: 30,
      }}
      handleIndicatorStyle={{ 
        backgroundColor: colors.icon,
        width: 40,
      }}
      onChange={onChange}
    >
      <View style={{ flex: 1, paddingLeft: 30, paddingRight: 30 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 20 }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>
            {selectedReminderDescription}
          </Text>
        </View>

        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: colors.bottomSheetLine,
            marginTop: 15,
            marginLeft: -30,
            marginRight: -30,
          }}
        />
        
        <View style={{ marginTop: 20 }}>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
              paddingVertical: 12,
              paddingHorizontal: 15,
              justifyContent: 'space-between',
              backgroundColor: colors.cardBackground,
              borderRadius: 5,
            }}
            onPress={() => selectedReminderId && onEditReminder(selectedReminderId)}
          >
            <Text style={{ color: colors.icon, fontSize: 17 }}>Editar Lembrete</Text>
            <Edit size={26} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
              paddingVertical: 12,
              paddingHorizontal: 15,
              backgroundColor: colors.cardBackground,
              borderRadius: 5,
              justifyContent: 'space-between',
            }}
            onPress={() => selectedReminderId && onDeleteReminder(selectedReminderId)} // Abre o modal de confirmação
          >
            <Text style={{ color: colors.error, fontSize: 17 }}>Excluir Lembrete</Text>
            <Trash2 size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
};

export default ReminderBottomSheet;
