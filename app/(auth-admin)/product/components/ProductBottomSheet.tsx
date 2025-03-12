import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Colors } from '../../../../constants/Colors';
import { Edit, Trash2 } from "lucide-react-native";

interface ProductBottomSheetProps {
  selectedProductId: string | undefined;
  selectedProductDesc: string | null;
  colors: typeof Colors.light | typeof Colors.dark;
  onEditProduct: (id: string) => void;
  onDeleteProduct: (id: string) => void;
  bottomSheetRef: React.RefObject<BottomSheetModal>;
  snapPoints: (string | number)[];
  onChange: (index: number) => void;
}

const ProductBottomSheet: React.FC<ProductBottomSheetProps> = ({
  selectedProductId,
  selectedProductDesc,
  colors,
  onEditProduct,
  onDeleteProduct,
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
            {selectedProductDesc}
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
            onPress={() => selectedProductId && onEditProduct(selectedProductId)}
          >
            <Text style={{ color: colors.icon, fontSize: 17 }}>Editar Produto</Text>
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
            onPress={() => selectedProductId && onDeleteProduct(selectedProductId)} // Abre o modal de confirmação
          >
            <Text style={{ color: colors.error, fontSize: 17 }}>Excluir Produto</Text>
            <Trash2 size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
};

export default ProductBottomSheet;
