import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch, Modal } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import Constants from 'expo-constants';
import { PaywallScreen } from './PaywallScreen';

interface SetupScreenProps {
    onClose: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onClose }) => {
    const favorites = useAppStore((state) => state.favorites);
    const isPremium = useAppStore((state) => state.isPremium);
    const removeFavorite = useAppStore((state) => state.removeFavorite);

    const [showPaywall, setShowPaywall] = useState(false);

    const handleDeleteFavorite = (fav: any) => {
        if (!isPremium) {
            const now = Date.now();
            const createdAt = fav.createdAt || 0;
            const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
            const daysLeft = Math.ceil(30 - daysSinceCreation);

            if (daysSinceCreation < 30) {
                Alert.alert(
                    "Favorito Bloqueado",
                    `Debes esperar ${daysLeft} días para borrar este favorito. Esto nos ayuda a mantener la app gratuita.`
                );
                return;
            }
        }

        Alert.alert(
            "Eliminar Favorito",
            `¿Estás seguro de que quieres eliminar "${fav.name}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => removeFavorite(fav.name)
                }
            ]
        );
    };

    if (showPaywall) {
        return (
            <Modal animationType="slide" presentationStyle="pageSheet">
                <PaywallScreen onClose={() => setShowPaywall(false)} />
            </Modal>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Configuración</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Premium Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Suscripción</Text>
                    <View style={styles.row}>
                        <View>
                            <Text style={styles.rowTitle}>Estado</Text>
                            <Text style={[styles.rowSubtitle, isPremium && { color: COLORS.primary, fontWeight: 'bold' }]}>
                                {isPremium ? 'PREMIUM ACTIVO 💎' : 'Gratuito (Con Anuncios)'}
                            </Text>
                        </View>
                        {!isPremium && (
                            <TouchableOpacity
                                style={styles.upgradeButton}
                                onPress={() => setShowPaywall(true)}
                            >
                                <Text style={styles.upgradeButtonText}>Mejorar</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {isPremium && (
                        <Text style={styles.premiumThanks}>¡Gracias por tu apoyo! Disfruta de la app sin límites.</Text>
                    )}
                </View>

                {/* Favorites Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Mis Favoritos</Text>
                        <Text style={styles.sectionSubtitle}>
                            {favorites.length} / {isPremium ? '∞' : '3'}
                        </Text>
                    </View>

                    {favorites.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No tienes favoritos guardados.</Text>
                            <Text style={styles.emptySubtext}>Busca un destino en el mapa y toca el ❤️ para guardarlo.</Text>
                        </View>
                    ) : (
                        favorites.map((fav, index) => (
                            <View key={index} style={styles.favoriteItem}>
                                <View style={styles.favoriteInfo}>
                                    <Text style={styles.favoriteName} numberOfLines={1}>{fav.name}</Text>
                                    {fav.createdAt && (
                                        <Text style={styles.favoriteDate}>
                                            Guardado el {new Date(fav.createdAt).toLocaleDateString()}
                                        </Text>
                                    )}
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleDeleteFavorite(fav)}
                                    style={styles.deleteButton}
                                >
                                    <Text style={styles.deleteButtonText}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Acerca de</Text>
                    <Text style={styles.versionText}>Despiértame v{Constants.expoConfig?.version || '1.0.0'}</Text>
                    <Text style={styles.copyrightText}>© 2025 Despiértame App</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        paddingTop: SPACING.xl, // Safe area top approx
        paddingBottom: SPACING.m,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    closeButton: {
        padding: SPACING.s,
    },
    closeButtonText: {
        fontSize: 24,
        color: COLORS.text,
        lineHeight: 24,
    },
    content: {
        flex: 1,
        padding: SPACING.m,
    },
    section: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.m,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        ...SHADOWS.default,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.s,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowTitle: {
        fontSize: 16,
        color: COLORS.text,
    },
    rowSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    upgradeButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: RADIUS.s,
    },
    upgradeButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    premiumThanks: {
        marginTop: SPACING.s,
        color: COLORS.primary,
        fontSize: 12,
        fontStyle: 'italic',
    },
    favoriteItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.m,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    favoriteInfo: {
        flex: 1,
        marginRight: SPACING.m,
    },
    favoriteName: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '500',
    },
    favoriteDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    deleteButton: {
        padding: SPACING.s,
    },
    deleteButtonText: {
        fontSize: 18,
    },
    emptyState: {
        padding: SPACING.m,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginBottom: SPACING.s,
    },
    emptySubtext: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
    versionText: {
        fontSize: 14,
        color: '#666',
    },
    copyrightText: {
        fontSize: 12,
        color: '#999',
        marginTop: SPACING.s,
    },
});
