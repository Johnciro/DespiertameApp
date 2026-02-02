import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { PaymentService } from '../services/payment';
import { useAppStore } from '../store/useAppStore';

interface PaywallScreenProps {
    onClose: () => void;
}

export const PaywallScreen: React.FC<PaywallScreenProps> = ({ onClose }) => {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]); // Use imported Product type ideally
    const setPremiumStatus = useAppStore((state) => state.setPremiumStatus);

    useEffect(() => {
        loadOfferings();
    }, []);

    const loadOfferings = async () => {
        setLoading(true);
        const offerings = await PaymentService.getOfferings();
        setProducts(offerings);
        setLoading(false);
    };

    const handlePurchase = async (product: any) => {
        setLoading(true);
        try {
            // If it's the mock product (no rcPackage), simulate success
            if (!product.rcPackage || !product.rcPackage.product) {
                // Mock behavior fallback
                setTimeout(() => {
                    setPremiumStatus(true);
                    setLoading(false);
                    Alert.alert("Modo Prueba", "Compra simulada exitosa (Sin RevenueKey).");
                    onClose();
                }, 1000);
                return;
            }

            const success = await PaymentService.purchasePackage(product.rcPackage);
            if (success) {
                setPremiumStatus(true);
                Alert.alert("¡Bienvenido a Premium!", "Gracias por tu apoyo. Disfruta de favoritos ilimitados y sin anuncios.", [
                    { text: "OK", onPress: onClose }
                ]);
            } else {
                // User cancelled or error (already handled in service, but we can show alert if strictly needed)
            }
        } catch (error) {
            Alert.alert("Error", "Ocurrió un error inesperado.");
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        setLoading(true);
        try {
            const success = await PaymentService.restorePurchases();
            if (success) {
                setPremiumStatus(true);
                Alert.alert("Restaurado", "Tus compras han sido restauradas.", [
                    { text: "OK", onPress: onClose }
                ]);
            } else {
                Alert.alert("Aviso", "No se encontraron compras activas para restaurar.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Despiértame <Text style={{ color: COLORS.primary }}>Premium</Text></Text>
                <Text style={styles.subtitle}>Viaja sin límites y sin interrupciones.</Text>

                <View style={styles.featuresContainer}>
                    <FeatureItem icon="⭐" text="Favoritos Ilimitados" />
                    <FeatureItem icon="🚫" text="Sin Anuncios" />
                    <FeatureItem icon="🔓" text="Sin Bloqueo de 30 días" />
                    <FeatureItem icon="❤️" text="Apoya el desarrollo" />
                </View>

                {products.length === 0 ? (
                    <View style={{ padding: 20 }}>
                        <ActivityIndicator color={COLORS.primary} />
                        <Text style={{ textAlign: 'center', color: '#888', marginTop: 10 }}>Cargando precios...</Text>
                    </View>
                ) : (
                    <View style={styles.productsContainer}>
                        {products.map((product) => (
                            <TouchableOpacity
                                key={product.id}
                                style={styles.productCard}
                                onPress={() => handlePurchase(product)}
                                disabled={loading}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.productTitle}>{product.title}</Text>
                                    <Text style={styles.productDesc}>{product.description}</Text>
                                </View>
                                <Text style={styles.productPrice}>{product.price}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
                    <Text style={styles.restoreText}>Restaurar Compras</Text>
                </TouchableOpacity>

                <Text style={styles.disclaimer}>
                    Suscripción auto-renovable. Cancela en cualquier momento desde Google Play.
                </Text>
            </ScrollView>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            )}
        </SafeAreaView>
    );
};

const FeatureItem = ({ icon, text }: { icon: string, text: string }) => (
    <View style={styles.featureItem}>
        <Text style={styles.featureIcon}>{icon}</Text>
        <Text style={styles.featureText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        padding: SPACING.m,
        alignItems: 'flex-end',
    },
    closeButton: {
        padding: SPACING.s,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#999',
    },
    content: {
        padding: SPACING.l,
        paddingTop: 0,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: SPACING.s,
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center',
        color: '#666',
        marginBottom: SPACING.xl,
    },
    featuresContainer: {
        marginBottom: SPACING.xl,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    featureIcon: {
        fontSize: 24,
        marginRight: SPACING.m,
    },
    featureText: {
        fontSize: 18,
        color: COLORS.text,
    },
    productsContainer: {
        marginBottom: SPACING.l,
    },
    productCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        ...SHADOWS.default,
    },
    productTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    productDesc: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    restoreButton: {
        alignItems: 'center',
        padding: SPACING.m,
    },
    restoreText: {
        color: '#999',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    disclaimer: {
        textAlign: 'center',
        color: '#CCC',
        fontSize: 10,
        marginTop: SPACING.xl,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
