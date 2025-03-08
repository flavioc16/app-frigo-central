import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    Modal, 
    TouchableOpacity, 
    ActivityIndicator, 
    StyleSheet, 
    Animated, 
    ScrollView,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '../../../../src/context/ThemeContext';
import { BlurView } from 'expo-blur';
import { api } from '@/src/services/api';
import { X } from 'lucide-react-native';

interface PurchaseInfoModalProps {
    visible: boolean;
    onClose: () => void;
    purchaseId: string;
}

interface Juros {
    id: string;
    valor: number;
    descricao: string;
    created_at: string;
}

interface Pagamento {
    id: string;
    valorPagamento: number;
    created_at: string;
}

interface PurchaseInfo {
    id: string;
    descricaoCompra: string;
    totalCompra: number;
    valorInicialCompra: number;
    dataDaCompra: string;
    dataVencimento?: string;
    isVencida?: number;
    juros?: Juros[];
    pagamentos?: Pagamento[];
}

export default function PurchaseInfoModal({ visible, onClose, purchaseId }: PurchaseInfoModalProps) {
    const { theme } = useTheme();
    const colors = Colors[theme] || Colors.light;
    const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const translateY = useRef(new Animated.Value(100)).current;

    useEffect(() => {
        if (visible) {
            fetchPurchaseInfo();
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(translateY, {
                toValue: 500,
                duration: 100,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const fetchPurchaseInfo = async () => {
        setIsLoading(true);
        try {
        const response = await api.get(`/compras/${purchaseId}`);
        setPurchaseInfo(response.data);
        } catch (error) {
        console.error('Erro ao carregar informações da compra:', error);
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={onClose}>
                <BlurView style={styles.blurView} intensity={30} tint={theme === 'dark' ? 'light' : 'dark'} />
                <Animated.View style={[styles.modalContent, { backgroundColor: colors.cardBackground, transform: [{ translateY }] }]}>
                <View style={styles.header}>
                    <Text style={[styles.modalTitle, { color: colors.info }]}>Informações da Compra</Text>
                    <TouchableOpacity onPress={onClose}>
                        <X size={24} color={colors.icon} />
                    </TouchableOpacity>
                </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.tint} />
                </View>
            ) : purchaseInfo ? (
                <ScrollView style={styles.scrollContainer}>
                    <View style={styles.infoRow}>
                            <Text style={[styles.label, { color: colors.text }] }>Descrição:</Text>
                            <Text style={styles.value}>{purchaseInfo.descricaoCompra}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: colors.text }] }>Data da Compra:</Text>
                        <Text style={styles.value}>
                        {new Date(purchaseInfo.dataDaCompra).toLocaleDateString('pt-BR')}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: colors.text }] }>Valor Inicial:</Text>
                        <Text style={styles.value}>
                        {purchaseInfo.valorInicialCompra.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: colors.text }] }>Valor Atual:</Text>
                        <Text style={[styles.value]}>
                        {purchaseInfo.totalCompra.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: colors.text }] }>Data de Vencimento:</Text>
                        <Text style={styles.value}>
                        {purchaseInfo.dataVencimento ? new Date(purchaseInfo.dataVencimento).toLocaleDateString('pt-BR') : 'Não informado'}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: colors.text }] }>Está vencida?:</Text>
                        <Text style={styles.value}>{purchaseInfo.isVencida ? 'Sim' : 'Não'}</Text>
                    </View>

                    {purchaseInfo.juros && purchaseInfo.juros.length > 0 && (
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    )}

                    {purchaseInfo.juros && purchaseInfo.juros.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.info }]}>Juros</Text>
                            {purchaseInfo.juros.map((juros, index) => {
                            const dataFormatada = new Date(juros.created_at).toLocaleDateString('pt-BR', {
                                month: 'long',
                                year: 'numeric',
                            });

                            return (
                                <View key={juros.id} style={styles.infoRow}>
                                <Text style={[styles.label, { color: colors.text }]}>Juros #{index + 1}:</Text>
                                <Text style={styles.value}>
                                    Mês de: {dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1)} - {juros.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </Text>
                                </View>
                            );
                            })}
                        </View>
                    )}
                    {purchaseInfo.pagamentos && purchaseInfo.pagamentos.length > 0 && (
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    )}
                    {purchaseInfo.pagamentos && purchaseInfo.pagamentos.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.info }]}>Pagamentos</Text>
                            {purchaseInfo.pagamentos.map((pagamento, index) => (
                                <View key={pagamento.id} style={styles.infoRow}>
                                    <Text style={[styles.label, { color: colors.text }]}>Pagamento #{index + 1}:</Text>
                                    <Text style={styles.value}>{pagamento.valorPagamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            ) : (
                <Text style={styles.errorText}>Erro ao carregar informações.</Text>
            )}
            </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
    }

    const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    blurView: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    modalContent: {
        width: '90%',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    loadingContainer: {
        marginVertical: 20,
    },
    scrollContainer: {
        width: '100%',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
    },
    label: {
    },
    value: {
        color: 'gray',
        fontWeight: 'bold',
    },
    section: {
        marginTop: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
    },
    divider: {
        height: 1,
        marginVertical: 1,
        width: '100%',
    }
    });
