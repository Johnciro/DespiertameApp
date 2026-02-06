import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView, Modal, Text, TouchableOpacity } from 'react-native';
import { MapDisplay } from '../components/MapDisplay';
import { DestinationSearch } from '../components/DestinationSearch';
import { InfoPanel } from '../components/InfoPanel';
import { AdBanner } from '../components/AdBanner';
import { FavoritesPanel } from '../components/FavoritesPanel';
import { HamburgerMenu } from '../components/HamburgerMenu';
import { SetupScreen } from './SetupScreen';
import { PaywallScreen } from './PaywallScreen';
import { useLocationTracker } from '../hooks/useLocationTracker';
import { COLORS, SHADOWS, SPACING, RADIUS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInterstitialAd } from '../hooks/useInterstitialAd';

import { useAppStore } from '../store/useAppStore';

export const HomeScreen = () => {
    // Inicializar hook de tracking
    useLocationTracker();
    const insets = useSafeAreaInsets();
    const isPremium = useAppStore((state) => state.isPremium);
    const destination = useAppStore((state) => state.destination);
    const addFavorite = useAppStore((state) => state.addFavorite);
    const favorites = useAppStore((state) => state.favorites);
    const setDestination = useAppStore((state) => state.setDestination);

    const [showSetup, setShowSetup] = useState(false);
    const [showFavorites, setShowFavorites] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);

    const {
        isConfirmingFavorite,
        setIsConfirmingFavorite,
        setDestination: storeSetDestination
    } = useAppStore();

    // Reusable Ad Hook
    const { showInterstitial, isLoaded: interstitialLoaded } = useInterstitialAd();

    // Cerrar panel de favoritos si se entra en modo confirmación
    React.useEffect(() => {
        if (isConfirmingFavorite) {
            setShowFavorites(false);
        }
    }, [isConfirmingFavorite]);

    const handleFavoriteSelect = (fav: any) => {
        setDestination(fav);
        setShowFavorites(false);
    };

    const handleConfirmSaveFavorite = () => {
        if (destination) {
            const success = addFavorite(destination);
            if (success) {
                alert('¡Destino guardado en favoritos! ⭐');
                setIsConfirmingFavorite(false);
                storeSetDestination(null); // Limpiar preview
                if (!isPremium && interstitialLoaded) {
                    showInterstitial();
                }
            }
        }
    };

    const handleCancelSaveFavorite = () => {
        setIsConfirmingFavorite(false);
        storeSetDestination(null);
        setShowFavorites(true); // Volver al panel
    };

    const handleSaveFavorite = () => {
        if (destination) {
            const maxFavs = isPremium ? 30 : 3;
            if (favorites.length >= maxFavs) {
                alert(`Límite de favoritos alcanzado (${maxFavs}). Pásate a Premium para tener 30.`);
                return;
            }
            const success = addFavorite(destination);
            if (success) {
                alert('Destino guardado en favoritos');
                if (!isPremium && interstitialLoaded) {
                    showInterstitial();
                }
            }
        } else {
            alert('Selecciona un destino primero');
        }
    };

    const isFavorite = destination && favorites.some(fav => fav.name === destination.name);

    if (showSetup) {
        return <SetupScreen onClose={() => setShowSetup(false)} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Top Ad Banner - Solo si NO es Premium y NO estamos confirmando favorito */}
            {!isPremium && !isConfirmingFavorite && (
                <View style={styles.adPlaceholderTop}>
                    <AdBanner />
                </View>
            )}

            <View style={styles.contentContainer}>
                <MapDisplay />

                {/* Solo mostrar buscador si NO tiene favoritos y NO está confirmando. */}
                {favorites.length === 0 && !isConfirmingFavorite && (
                    <DestinationSearch />
                )}

                {/* Hamburger Menu - Ocultar si está confirmando para no distraer */}
                {!isConfirmingFavorite && (
                    <HamburgerMenu
                        onOpenSetup={() => setShowSetup(true)}
                        onOpenFavorites={() => setShowFavorites(true)}
                        onOpenPremium={() => setShowPaywall(true)}
                        onToggleSaveFavorite={handleSaveFavorite}
                        showSaveButton={!!destination}
                        isFavorite={!!isFavorite}
                    />
                )}

                {/* Info Panel - Ocultar si está confirmando */}
                {!isConfirmingFavorite && (
                    <InfoPanel onOpenPremium={() => setShowPaywall(true)} />
                )}

                {/* OVERLAY DE CONFIRMACIÓN DE FAVORITO */}
                {isConfirmingFavorite && (
                    <View style={styles.confirmationOverlay}>
                        <View style={styles.confirmationCard}>
                            <Text style={styles.confirmationTitle}>¿Guardar este destino?</Text>
                            <Text style={styles.confirmationName} numberOfLines={2}>
                                {destination?.name}
                            </Text>
                            <View style={styles.confirmationActions}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={handleCancelSaveFavorite}
                                >
                                    <Text style={styles.cancelButtonText}>CANCELAR</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.confirmButton}
                                    onPress={handleConfirmSaveFavorite}
                                >
                                    <Text style={styles.confirmButtonText}>GUARDAR ⭐</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* Favorites Panel Modal */}
                <FavoritesPanel
                    visible={showFavorites}
                    onClose={() => setShowFavorites(false)}
                    onSelect={handleFavoriteSelect}
                />

                <Modal
                    visible={showPaywall}
                    animationType="slide"
                    onRequestClose={() => setShowPaywall(false)}
                >
                    <PaywallScreen onClose={() => setShowPaywall(false)} />
                </Modal>
            </View>

            {/* Bottom Ad Banner - Solo si NO es Premium y NO estamos confirmando */}
            {!isPremium && !isConfirmingFavorite && (
                <View style={[styles.adPlaceholderBottom, { paddingBottom: insets.bottom }]}>
                    <AdBanner />
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    contentContainer: {
        flex: 1,
        position: 'relative',
        marginVertical: SPACING.s, // Space between banners and map
        marginHorizontal: SPACING.s, // Optional: Space from sides
        borderRadius: RADIUS.l, // Round corners for premium look
        overflow: 'hidden', // Clip map to corners
        ...SHADOWS.default,
    },
    adPlaceholderTop: {
        alignItems: 'center',
        marginTop: SPACING.l, // More space from top
        marginBottom: SPACING.s,
    },
    adPlaceholderBottom: {
        alignItems: 'center',
        marginTop: SPACING.s,
        marginBottom: SPACING.l, // More space from bottom
    },
    adText: {
        color: '#757575',
        fontWeight: 'bold',
        fontSize: 12,
    },

    confirmationOverlay: {
        position: 'absolute',
        bottom: 20,
        left: SPACING.m,
        right: SPACING.m,
        zIndex: 100,
    },
    confirmationCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.l,
        padding: SPACING.m,
        ...SHADOWS.default,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    confirmationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    confirmationName: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: SPACING.m,
    },
    confirmationActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: SPACING.m,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: RADIUS.m,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
    },
    confirmButton: {
        flex: 2,
        paddingVertical: 12,
        borderRadius: RADIUS.m,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: 'bold',
        fontSize: 14,
    },
    confirmButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
});
