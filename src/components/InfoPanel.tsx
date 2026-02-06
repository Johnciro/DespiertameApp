import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, ScrollView, ActivityIndicator, Share } from 'react-native';
import Slider from '@react-native-community/slider';
import { useAppStore } from '../store/useAppStore';
import { COLORS, RADIUS, SHADOWS, SPACING, FONT_SIZES } from '../constants/theme';
import { formatDistance, calculateEstimatedTime } from '../utils/distance';
import i18n from '../i18n';
import { RewardedAd, RewardedAdEventType, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { useInterstitialAd } from '../hooks/useInterstitialAd';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Production Rewarded Ad Unit IDs
const rewardedAdUnitId = __DEV__
    ? TestIds.REWARDED
    : 'ca-app-pub-5025716288565530/7360645497'; // Rewarded Ad Unit ID from AdMob

// Create rewarded ad instance
const rewardedAd = RewardedAd.createForAdRequest(rewardedAdUnitId, {
    requestNonPersonalizedAdsOnly: true,
});

export const InfoPanel = ({ onOpenPremium }: { onOpenPremium: () => void }) => {
    const {
        destination,
        setDestination,
        distanceToDestination,
        isTracking,
        setIsTracking,
        isAlarmActive,
        stopAlarm,
        alertRadius,
        setAlertRadius,
        isPremium,
        favorites,
        dailyTripsCount,
        maxDailyTrips,
        setPremiumStatus,
        isRewardAdWatched,
        unlockTripWithAd,
        addFavorite,
    } = useAppStore();

    const [isAdLoading, setIsAdLoading] = React.useState(false);
    const [adLoaded, setAdLoaded] = React.useState(false);

    // Interstitial Ad for Stop Alarm
    const { showInterstitial, isLoaded: interstitialLoaded } = useInterstitialAd();

    // Panel persistente: Si no hay destino, mostrar estado vacío o placeholder
    const hasDestination = !!destination;

    // Lógica de Bloqueo / Desbloqueo
    const isFav = hasDestination && favorites.some(fav =>
        fav.location.latitude === destination.location.latitude &&
        fav.location.longitude === destination.location.longitude
    );

    const maxFavs = isPremium ? 30 : 3;
    const favoritesFull = favorites.length >= maxFavs;
    const needsToWatchAd = !isPremium && isFav && !isTracking && !isRewardAdWatched && dailyTripsCount >= maxDailyTrips;

    const canStart = hasDestination && isFav && (isPremium || isRewardAdWatched || dailyTripsCount < maxDailyTrips);

    // Load rewarded ad on mount and after each use
    React.useEffect(() => {
        const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
            setAdLoaded(true);
            setIsAdLoading(false);
        });

        const unsubscribeEarned = rewardedAd.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            reward => {
                unlockTripWithAd();
                alert('¡Vídeo visto! Alerta desbloqueada.');
            },
        );

        const unsubscribeClosed = rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
            setAdLoaded(false);
            setIsAdLoading(true);
            rewardedAd.load();
        });

        const unsubscribeError = rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
            console.error('Rewarded Ad Error:', error);
            setIsAdLoading(false);
            setAdLoaded(false);
            setTimeout(() => {
                setIsAdLoading(true);
                rewardedAd.load();
            }, 5000);
        });

        setIsAdLoading(true);
        rewardedAd.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeEarned();
            unsubscribeClosed();
            unsubscribeError();
        };
    }, []);

    const handleMainButtonPress = () => {
        if (isTracking) {
            setIsTracking(false);
            if (!isPremium && interstitialLoaded) {
                showInterstitial();
            }
            return;
        }

        if (!isFav && hasDestination) {
            if (favoritesFull) {
                alert(`Límite de favoritos alcanzado (${maxFavs}). Pásate a Premium para tener 30.`);
                return;
            }
            const success = addFavorite(destination);
            if (success) {
                alert('Destino guardado. Ahora puedes iniciar la alerta.');
            }
            return;
        }

        if (needsToWatchAd) {
            if (adLoaded) {
                rewardedAd.show();
            } else {
                setIsAdLoading(true);
                rewardedAd.load();
            }
            return;
        }

        if (canStart) {
            setIsTracking(true);
        }
    };

    const handleStopAlarm = () => {
        stopAlarm();
        if (!isPremium && interstitialLoaded) {
            showInterstitial();
        }
    };

    const handleShareTrip = async () => {
        if (!destination) return;
        try {
            const message = `🚌 Voy camino a: *${destination.name}* usando ProxiAlert. \n\n📍 Te avisaré cuando llegue. \n\nDescarga la App aquí: https://play.google.com/store/apps/details?id=com.antigravity.proxialert`;
            await Share.share({ message });
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleNotifyArrival = async () => {
        if (!destination) return;
        try {
            const message = `🏁 ¡Ya llegué a: *${destination.name}*! \n\nGracias por acompañarme usando ProxiAlert. \n\nDescarga la App tú también: https://play.google.com/store/apps/details?id=com.antigravity.proxialert`;
            await Share.share({ message });
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <>
            <View style={styles.container}>
                {/* Header / Destino */}
                <View style={styles.headerRowContainer}>
                    <TouchableOpacity
                        style={styles.headerRow}
                        onLongPress={() => {
                            setPremiumStatus(!isPremium);
                            alert(`Modo ${!isPremium ? 'PREMIUM' : 'FREE'} activado`);
                        }}
                        activeOpacity={1}
                    >
                        <Text style={styles.headerLabel}>
                            {hasDestination ? 'Destino Seleccionado' : 'Sin destino'}
                        </Text>
                        <View style={{ width: '100%' }}>
                            <Text
                                style={styles.destinationText}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                key={hasDestination ? destination.name : 'empty'}
                            >
                                {hasDestination ? destination.name : 'Seleccione un destino en el mapa'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Share Button */}
                    {hasDestination && (
                        <TouchableOpacity
                            style={styles.shareButton}
                            onPress={handleShareTrip}
                        >
                            <Text style={{ fontSize: 20 }}>📤</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Slider Minimalista */}
                <View style={styles.sliderContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={styles.sliderLabel}>Radio de Alerta</Text>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: COLORS.primary }}>{alertRadius}m</Text>
                    </View>
                    <Slider
                        style={styles.slider}
                        minimumValue={100}
                        maximumValue={2000}
                        step={100}
                        value={alertRadius}
                        onValueChange={setAlertRadius}
                        minimumTrackTintColor={COLORS.primary}
                        maximumTrackTintColor="#E0E0E0"
                        thumbTintColor={COLORS.primary}
                        disabled={isTracking}
                    />
                </View >

                {/* Main Action Button */}
                <TouchableOpacity
                    style={
                        [
                            styles.actionBtn,
                            isTracking ? styles.stopBtn : styles.startBtn,
                            !isFav && hasDestination && styles.saveBtn, // Nuevo estilo para guardar
                            needsToWatchAd && styles.adBtn,
                            !hasDestination && styles.disabledBtn
                        ]}
                    onPress={handleMainButtonPress}
                    disabled={!hasDestination && !isTracking}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {needsToWatchAd && isAdLoading && (
                            <ActivityIndicator color="white" size="small" style={{ marginRight: 8 }} />
                        )}
                        <Text style={styles.actionBtnText}>
                            {isTracking
                                ? 'DETENER ALERTA'
                                : !hasDestination
                                    ? 'SELECCIONA UN DESTINO'
                                    : !isFav
                                        ? 'GUARDAR EN FAVORITOS'
                                        : needsToWatchAd
                                            ? (isAdLoading ? 'PREPARANDO VIAJE...' : 'VER VIDEO PARA INICIAR')
                                            : !isTracking && isFav && !isPremium && dailyTripsCount < maxDailyTrips
                                                ? 'INICIAR (VIAJE GRATIS)'
                                                : 'INICIAR ALERTA'}
                        </Text>
                    </View>
                </TouchableOpacity >

                {needsToWatchAd && (
                    <TouchableOpacity
                        style={styles.premiumPromoLink}
                        onPress={onOpenPremium}
                    >
                        <Text style={styles.premiumPromoText}>💎 ¿Cansado de los videos? Pasar a Premium</Text>
                    </TouchableOpacity>
                )}

                {/* Favoritos Counter */}
                <View style={styles.usageCounter}>
                    <Text style={styles.usageText}>
                        {favorites.length}/{maxFavs} Favoritos {isPremium ? '💎' : ''}
                    </Text>
                </View>
            </View >

            {/* Modal de Alarma */}
            < Modal visible={isAlarmActive} transparent animationType="slide" >
                <View style={styles.modalOverlay}>
                    <View style={styles.alarmCard}>
                        <Text style={styles.alarmTitle}>{i18n.t('alarmTitle')}</Text>
                        <Text style={styles.alarmMessage}>
                            {hasDestination ? i18n.t('alarmMessage', { destination: destination.name }) : ''}
                        </Text>
                        <TouchableOpacity style={styles.notifyArrivalBtn} onPress={handleNotifyArrival}>
                            <Text style={styles.notifyArrivalText}>📢 NOTIFICAR MI LLEGADA</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.stopAlarmBtn} onPress={handleStopAlarm}>
                            <Text style={styles.stopAlarmText}>{i18n.t('stopAlarmBtn').toUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal >
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F5F5F5',
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        padding: 8,
        paddingBottom: 14,
        ...SHADOWS.floating,
        elevation: 15,
        height: 'auto',
        maxHeight: '42%', // Slightly more room since map will be constrained
    },
    headerRowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    headerRow: {
        flex: 1, // Take available space
        backgroundColor: COLORS.white,
        padding: 8,
        borderRadius: RADIUS.m,
        marginRight: 8, // Space for share button
        ...SHADOWS.default,
    },
    shareButton: {
        backgroundColor: COLORS.white,
        width: 44,
        height: 44,
        borderRadius: RADIUS.m,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.default,
    },
    headerLabel: {
        fontSize: 15, // Larger than destination text
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 2,
        letterSpacing: 0.3,
    },
    destinationText: {
        fontSize: 14,
        color: '#333',
        fontWeight: 'bold', // Made bold as requested
    },
    estimatedInfo: {
        fontSize: 11,
        color: '#666',
        marginTop: 4,
        fontStyle: 'italic',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 6,
        borderRadius: RADIUS.m,
        alignItems: 'center',
        marginHorizontal: 4,
        flexDirection: 'row',
        justifyContent: 'center',
        ...SHADOWS.default,
    },
    statIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    statValue: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.primary,
    },

    sliderContainer: {
        marginBottom: 6,
        backgroundColor: COLORS.white,
        padding: 6,
        borderRadius: RADIUS.m,
        ...SHADOWS.default,
    },
    sliderLabel: {
        fontSize: 12,
        color: COLORS.text,
        marginBottom: 0,
        fontWeight: 'bold',
    },
    slider: {
        width: '100%',
        height: 32,
        transform: [{ scaleY: 1.15 }],
    },
    actionBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: RADIUS.round,
        alignItems: 'center',
        ...SHADOWS.default,
        marginTop: 4,
    },
    disabledBtn: {
        backgroundColor: '#B0BEC5',
    },
    stopBtn: {
        backgroundColor: COLORS.danger,
    },
    startBtn: {
        backgroundColor: COLORS.primary,
    },
    actionBtnText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    usageCounter: {
        position: 'absolute',
        top: -24,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 10,
        ...SHADOWS.default,
    },
    usageText: {
        fontSize: 9,
        color: '#616161',
        fontWeight: 'bold',
    },
    // Modal Styles (unchanged)
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alarmCard: {
        backgroundColor: COLORS.white,
        padding: SPACING.l,
        borderRadius: RADIUS.l,
        width: '80%',
        alignItems: 'center',
        ...SHADOWS.floating,
    },
    alarmTitle: {
        fontSize: FONT_SIZES.xlarge,
        fontWeight: 'bold',
        marginBottom: SPACING.m,
        color: COLORS.primary,
    },
    alarmMessage: {
        fontSize: FONT_SIZES.medium,
        textAlign: 'center',
        marginBottom: SPACING.l,
        color: COLORS.text,
    },
    adBtn: {
        backgroundColor: '#F5A623',
    },
    saveBtn: {
        backgroundColor: COLORS.secondary || '#4A90E2', // Use a blue/secondary color for saving
    },
    notifyArrivalBtn: {
        backgroundColor: COLORS.success,
        paddingVertical: SPACING.m,
        paddingHorizontal: SPACING.xl,
        borderRadius: RADIUS.round,
        marginBottom: SPACING.m,
        width: '100%',
        alignItems: 'center',
        ...SHADOWS.default,
    },
    notifyArrivalText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.medium,
        fontWeight: 'bold',
    },
    stopAlarmBtn: {
        backgroundColor: COLORS.danger,
        paddingVertical: SPACING.m,
        paddingHorizontal: SPACING.xl,
        borderRadius: RADIUS.round,
        width: '100%',
        alignItems: 'center',
    },
    stopAlarmText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.large,
        fontWeight: 'bold',
    },
    premiumPromoLink: {
        marginTop: 8,
        alignItems: 'center',
        paddingVertical: 4,
    },
    premiumPromoText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});
