import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView, Modal } from 'react-native';
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

    // Use reusable Ad Hook
    const { showInterstitial, isLoaded: interstitialLoaded } = useInterstitialAd();

    const handleFavoriteSelect = (fav: any) => {
        setDestination(fav);
        setShowFavorites(false);
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

            {/* Top Ad Banner - Solo si NO es Premium */}
            {!isPremium && (
                <View style={styles.adPlaceholderTop}>
                    <AdBanner />
                </View>
            )}

            <View style={styles.contentContainer}>
                <MapDisplay />
                <DestinationSearch />

                {/* Hamburger Menu */}
                <HamburgerMenu
                    onOpenSetup={() => setShowSetup(true)}
                    onOpenFavorites={() => setShowFavorites(true)}
                    onOpenPremium={() => setShowPaywall(true)}
                    onToggleSaveFavorite={handleSaveFavorite}
                    showSaveButton={!!destination}
                    isFavorite={!!isFavorite}
                />

                <InfoPanel onOpenPremium={() => setShowPaywall(true)} />

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

            {/* Bottom Ad Banner - Solo si NO es Premium */}
            {!isPremium && (
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

});
