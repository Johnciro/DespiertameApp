import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { MapDisplay } from '../components/MapDisplay';
import { DestinationSearch } from '../components/DestinationSearch';
import { InfoPanel } from '../components/InfoPanel';
import { AdBanner } from '../components/AdBanner';
import { FavoritesPanel } from '../components/FavoritesPanel';
import { HamburgerMenu } from '../components/HamburgerMenu';
import { SetupScreen } from './SetupScreen';
import { useLocationTracker } from '../hooks/useLocationTracker';
import { COLORS, SHADOWS, SPACING, RADIUS } from '../constants/theme';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppStore } from '../store/useAppStore';

// Production Ad Unit IDs
const interstitialAdUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-5025716288565530/2873123656';

const interstitial = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
    requestNonPersonalizedAdsOnly: true,
});

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
    const [interstitialLoaded, setInterstitialLoaded] = useState(false);

    useEffect(() => {
        const unsubscribe = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            setInterstitialLoaded(true);
        });

        const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            setInterstitialLoaded(false);
            interstitial.load(); // Load next ad
        });

        // Start loading the interstitial straight away
        interstitial.load();

        return () => {
            unsubscribe();
            unsubscribeClosed();
        };
    }, []);

    const handleFavoriteSelect = (fav: any) => {
        setDestination(fav);
        setShowFavorites(false);
    };

    const handleSaveFavorite = () => {
        if (destination) {
            const success = addFavorite(destination);
            if (success) {
                alert('Destino guardado en favoritos');

                // Show Interstitial if NOT Premium and Ad is Loaded
                if (!isPremium && interstitialLoaded) {
                    interstitial.show();
                }
            } else {
                alert('Límite de favoritos alcanzado (Máx 3)');
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
                    onToggleSaveFavorite={handleSaveFavorite}
                    showSaveButton={!!destination}
                    isFavorite={!!isFavorite}
                />

                <InfoPanel />

                {/* Favorites Panel Modal */}
                <FavoritesPanel
                    visible={showFavorites}
                    onClose={() => setShowFavorites(false)}
                    onSelect={handleFavoriteSelect}
                />
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
