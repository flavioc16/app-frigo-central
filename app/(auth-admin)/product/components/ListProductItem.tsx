import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  FlatList,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  InteractionManager,
  RefreshControl
} from "react-native";
import { Plus, EllipsisVertical, Tag, CreditCard } from "lucide-react-native";
import { api } from "../../../../src/services/api";
import { ThemedText } from "../../../../components/ThemedText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../../../src/context/ThemeContext";
import { Colors } from "../../../../constants/Colors";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import ButtonAdd from "@/app/components/ButtonAdd";
import SearchInput from "@/app/components/SearchInput";
import CreateProductModal from "./CreateProductModal";
import EditProductModal from "./EditProductModal";
import ProductBottomSheet from "./ProductBottomSheet";
import ConfirmModal from "@/app/components/ConfirmModal";
import * as Haptics from 'expo-haptics';

export interface Product {
  id: string;
  nome: string;
  descricao: string;
  precoAVista: number;
  precoAPrazo: number;
  created_at: string;
  updated_at: string;
}

export default function ListProductItem() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { theme } = useTheme();
  const colors = Colors[theme] || Colors.light;

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => {
    if (Platform.OS === 'ios') {
      return ['25%', '80%'];
    } else if (Platform.OS === 'android') {
      return ['35%', '85%'];  
    } else {
      return ['30%', '75%'];
    }
  }, []);

  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [selectedProductDesc, setSelectedProductDesc] = useState<string | null>(null);

  const handleOpenBottomSheet = useCallback((id: string, nome: string) => {
    InteractionManager.runAfterInteractions(() => {
      setSelectedProductId(id);
      setSelectedProductDesc(nome);
      bottomSheetRef.current?.present();
    });
  }, []);

  const handleBottomSheetChange = useCallback((index: number) => {
    if (index === -1) {
      setSelectedProductId(undefined);
      setSelectedProductDesc(null);
    }
  }, []);

  const handleEditProduct = (id: string) => {
    setEditModalVisible(true);
    setSelectedProductId(id);
    bottomSheetRef.current?.close();
  };

  const handleDeleteProduct = (id: string) => {
    bottomSheetRef.current?.close();
    setProductToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await api.delete(`/produtos`, {
          headers: {
            "Content-Type": "application/json"
          },
          data: { id: productToDelete }
        });
        updateProducts();
        bottomSheetRef.current?.close();
      } catch (err) {
        Alert.alert("Erro", "Não foi possível excluir o produto.");
      } finally {
        setDeleteModalVisible(false);
        setProductToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setProductToDelete(null);
  };

  const fetchProducts = async () => {
    setError(null);
  
    try {
      const response = await api.get<Product[]>("/produtos");
      setProducts(response.data);
      
      // Salva os produtos no AsyncStorage para evitar recarregamento
      await AsyncStorage.setItem("cachedProducts", JSON.stringify(response.data));
    } catch (err) {
      setError("Erro ao buscar produtos.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const loadCachedProducts = async () => {
      const cachedData = await AsyncStorage.getItem("cachedProducts");
      if (cachedData) {
        setProducts(JSON.parse(cachedData));
        setLoading(false);
      } else {
        fetchProducts(); 
      }
    };
  
    loadCachedProducts();
  }, []);

  const updateProducts = async () => {
    await fetchProducts();
  };

  const handleRefresh = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    updateProducts();
  };

  const filteredProducts = useMemo(() => {
    if (search.trim() === "") {
      return products;
    }

    const lowerSearch = search.toLowerCase();

    return products.filter(product => {
      const matchesName = product.nome.toLowerCase().includes(lowerSearch);
      const matchesDescription = product.descricao.toLowerCase().includes(lowerSearch);
      return matchesName || matchesDescription;
    });
  }, [search, products]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (error) {
    return <Text style={[styles.error, { color: colors.error }]}>{error}</Text>;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { flex: 1 }]}>
          <SearchInput 
            value={search} 
            onChangeText={setSearch} 
            placeholder="Buscar por nome ou descrição" 
          />
          <ButtonAdd
            onPress={() => {
              Keyboard.dismiss();
              setModalVisible(true);
            }}
            iconRight={<Plus size={24} color={colors.success} />}
            label="Adicionar Produto"
          />

          {filteredProducts.length === 0 && search.length > 0 ? (
            <ThemedText style={[styles.noResults, { color: colors.text }]}>Nenhum produto encontrado.</ThemedText>
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.productContainer, { backgroundColor: colors.cardBackground }]}
                  activeOpacity={0.9}
                >
                  <View style={styles.productInfo}>
                    <Text style={[styles.productText, { color: colors.text }]}>
                      {item.nome} {item.descricao.trim() ? `- ${item.descricao}` : ''}
                    </Text>
                    <View style={styles.priceContainer}>
                      <View style={styles.priceRow}>
                        <Tag size={16} color={colors.icon} />
                        <Text style={[styles.price, { color: colors.text }]}>
                          {`À vista: R$ ${new Intl.NumberFormat('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(item.precoAVista / 100)}`}
                        </Text>
                      </View>
                      <View style={styles.priceRow}>
                        <CreditCard size={16} color={colors.icon} />
                        <Text style={[styles.price, { color: colors.text }]}>
                          {`A prazo: R$ ${new Intl.NumberFormat('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(item.precoAPrazo / 100)}`}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => {
                      Keyboard.dismiss(); 
                      handleOpenBottomSheet(item.id, item.nome);
                    }}
                  >
                    <EllipsisVertical size={25} color={colors.icon} style={styles.chevronIcon} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyContent}>
                  <Text style={[styles.noResults, { color: colors.text }]}>Nenhum produto cadastrado.</Text>
                </View>
              )}
              ListFooterComponent={<View style={{ height: 75 }} />}
              refreshControl={
                <RefreshControl
                  refreshing={loading} 
                  onRefresh={handleRefresh} 
                  colors={["#b62828", "#FF4500"]} 
                  tintColor={colors.tint}
                />
              }
            />
          )}

          <ConfirmModal
            visible={deleteModalVisible}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            title="Excluir Produto"
            message="Tem certeza que deseja excluir este produto?"
            confirmText="Excluir"
            cancelText="Cancelar"
          />

          <ProductBottomSheet
            selectedProductId={selectedProductId}
            selectedProductDesc={selectedProductDesc}
            bottomSheetRef={bottomSheetRef}
            snapPoints={snapPoints}
            onChange={handleBottomSheetChange}
            colors={colors}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />

          <EditProductModal
            visible={editModalVisible}
            onClose={() => setEditModalVisible(false)}
            updateProducts={updateProducts}
            productId={selectedProductId}
          />
          <CreateProductModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            updateProducts={updateProducts}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productContainer: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productInfo: {
    flex: 1,
  },
  productText: {
    marginBottom: 4,
    fontSize: 18,
    fontWeight: 'bold',
    flexWrap: 'wrap', 
  },
  priceContainer: {
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    marginLeft: 8,  // Distância entre o ícone e o texto
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontStyle: 'italic',
  },
  chevronIcon: {
    marginLeft: 10,
  },
  emptyContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    textAlign: 'center',
    fontSize: 16,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

