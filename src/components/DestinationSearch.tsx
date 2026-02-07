import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Keyboard, TouchableOpacity, Text, Dimensions } from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';
import { COLORS, SHADOWS, SPACING, RADIUS } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

import i18n from '../i18n';

import { RewardedAd, RewardedAdEventType, TestIds, AdEventType } from 'react-native-google-mobile-ads';

const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey || '';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Search Rewarded Ad Unit ID
const searchAdUnitId = __DEV__
    ? TestIds.REWARDED
    : 'ca-app-pub-5025716288565530/7360645497'; // Reusing existing or can be new

const searchRewardedAd = RewardedAd.createForAdRequest(searchAdUnitId, {
    requestNonPersonalizedAdsOnly: true,
});

export const DestinationSearch = ({
    autoSave = false,
    onSave,
    isEmbedded = false
}: {
    autoSave?: boolean,
    onSave?: () => void,
    isEmbedded?: boolean
}) => {
    const {
        setDestination,
        destination,
        isPremium,
        googleSearchCount,
        maxFreeGoogleSearches,
        incrementSearchCount,
        unlockSearchWithAd,
        addFavorite,
        setIsConfirmingFavorite,
        isSearchingForFavorite,
        setIsSearchingForFavorite
    } = useAppStore();
    const [isAdLoading, setIsAdLoading] = useState(false);
    const [adLoaded, setAdLoaded] = useState(false);

    const ref = useRef<GooglePlacesAutocompleteRef>(null);
    const [searchKey, setSearchKey] = React.useState(0);

    const hasQuota = isPremium || googleSearchCount < maxFreeGoogleSearches;

    // Ad Logic
    useEffect(() => {
        const unsubscribeLoaded = searchRewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
            setAdLoaded(true);
            setIsAdLoading(false);
        });

        const unsubscribeEarned = searchRewardedAd.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            reward => {
                unlockSearchWithAd();
                alert('¡Búsquedas de Google desbloqueadas!');
            },
        );

        const unsubscribeClosed = searchRewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
            setAdLoaded(false);
            searchRewardedAd.load();
        });

        const unsubscribeError = () => {
            setIsAdLoading(false);
            setAdLoaded(false);
        };

        searchRewardedAd.addAdEventListener(AdEventType.ERROR, unsubscribeError);

        searchRewardedAd.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeEarned();
            unsubscribeClosed();
            searchRewardedAd.removeAllListeners();
        };
    }, []);

    const handleUnlockSearch = () => {
        if (adLoaded) {
            searchRewardedAd.show();
        } else {
            setIsAdLoading(true);
            searchRewardedAd.load();
            alert('Cargando anuncio... Intenta de nuevo en un momento.');
        }
    };

    // Limpiar barra cuando se selecciona un destino
    useEffect(() => {
        if (destination) {
            const timer = setTimeout(() => {
                setSearchKey(prev => prev + 1);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [destination]);

    const handlePressGoogle = (data: any, details: any = null) => {
        if (details) {
            const { lat, lng } = details.geometry.location;
            const newDestination = {
                name: data.description,
                location: { latitude: lat, longitude: lng },
            };

            if (autoSave || isSearchingForFavorite) {
                // Mover mapa y pedir confirmación
                setDestination(newDestination);
                setIsConfirmingFavorite(true);
                setIsSearchingForFavorite(false); // Ya seleccionó, cerramos buscador
                onSave?.(); // Notifica al padre si es necesario
            } else {
                setDestination(newDestination);
            }

            incrementSearchCount();
        }
    };

    return (
        <View style={isEmbedded ? styles.containerEmbedded : styles.container}>
            {hasQuota ? (
                <GooglePlacesAutocomplete
                    key={searchKey}
                    placeholder={isEmbedded ? "Escribe una dirección..." : "Buscar destino..."}
                    onPress={handlePressGoogle}
                    query={{
                        key: GOOGLE_PLACES_API_KEY,
                        language: 'es',
                    }}
                    onFail={(error) => console.error('GooglePlacesAutocomplete Error:', error)}
                    fetchDetails={true}
                    enablePoweredByContainer={false}
                    styles={{
                        container: { flex: 0, zIndex: 999 },
                        textInput: styles.textInput,
                        listView: isEmbedded ? styles.listViewEmbedded : styles.listView,
                        row: styles.row,
                        description: styles.description,
                    }}
                    ref={ref}
                    debounce={300}
                />
            ) : (
                <View style={{ zIndex: 999 }}>
                    <TouchableOpacity
                        style={[styles.quotaWarning, { height: 44, justifyContent: 'center' }]}
                        onPress={handleUnlockSearch}
                    >
                        <Text style={styles.quotaText}>
                            {isAdLoading ? 'Cargando Google Search...' : '⚠️ Cuota Google agotada. Ver video para desbloquear.'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 10,
        left: SPACING.m,
        right: SPACING.m + 50, // Leave space for hamburger menu (40px button + 10px gap)
        zIndex: 10,
        maxWidth: SCREEN_WIDTH - (SPACING.m * 2) - 50,
    },
    textInput: {
        height: 44,
        borderRadius: RADIUS.l,
        paddingHorizontal: 12,
        paddingRight: 40,
        backgroundColor: COLORS.white,
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '500',
        ...SHADOWS.floating,
    },
    listView: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.m,
        marginTop: SPACING.s,
        ...SHADOWS.default,
        maxHeight: 250,
        elevation: 10,
        zIndex: 1000,
    },
    row: {
        paddingVertical: SPACING.m + 2,
        paddingHorizontal: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    description: {
        fontSize: 16,
        color: COLORS.text,
        lineHeight: 22,
    },
    quotaWarning: {
        backgroundColor: 'rgba(255, 149, 0, 0.1)',
        padding: 6,
        borderRadius: RADIUS.s,
        marginTop: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FF9500',
    },
    quotaText: {
        color: '#E67E22',
        fontSize: 11,
        fontWeight: 'bold',
    },
    containerEmbedded: {
        width: '100%',
        minHeight: 50,
        zIndex: 10,
    },
    listViewEmbedded: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.m,
        marginTop: SPACING.s,
        ...SHADOWS.default,
        maxHeight: 200,
        elevation: 10,
        zIndex: 1000,
        position: 'absolute',
        top: 45,
        left: 0,
        right: 0,
    },
});
