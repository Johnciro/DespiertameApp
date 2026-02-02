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

export const InfoPanel = () => {
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
        dailyTripsCount,
        maxDailyTrips,
        setPremiumStatus,
        isRewardAdWatched,
        unlockTripWithAd,
    } = useAppStore();

    const [isAdLoading, setIsAdLoading] = React.useState(false);
    const [adLoaded, setAdLoaded] = React.useState(false);

    // Interstitial Ad for Stop Alarm
    const { showInterstitial, isLoaded: interstitialLoaded } = useInterstitialAd();

    // Panel persistente: Si no hay destino, mostrar estado vacío o placeholder
    const hasDestination = !!destination;

    // Lógica de Bloqueo / Desbloqueo
    const limitReached = !isPremium && dailyTripsCount >= maxDailyTrips;
    const isFirstTrip = dailyTripsCount === 0;
    const needsToWatchAd = !isPremium && !isFirstTrip && !isRewardAdWatched && !isTracking;

    const canStart = hasDestination && (isPremium || !limitReached) && (!needsToWatchAd || isRewardAdWatched);

    // Load rewarded ad on mount and after each use
    React.useEffect(() => {
        const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
            console.log('✅ [AD] Rewarded ad loaded');
            setAdLoaded(true);
            setIsAdLoading(false);
        });

        const unsubscribeEarned = rewardedAd.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            reward => {
                console.log('💰 [AD] Rewarded ad earned reward:', reward);
                unlockTripWithAd();
                alert('¡Recompensa obtenida! Viaje desbloqueado.');
            },
        );

        const unsubscribeClosed = rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
            console.log('🔄 [AD] Rewarded ad closed, loading next ad');
            setAdLoaded(false);
            setIsAdLoading(true);
            rewardedAd.load();
        });

        const unsubscribeError = rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
            console.error('❌ [AD] Rewarded ad error:', error);
            setIsAdLoading(false);
            setAdLoaded(false);
            // Retry loading after 5 seconds
            setTimeout(() => {
                console.log('🔄 [AD] Retrying rewarded ad load...');
                setIsAdLoading(true);
                rewardedAd.load();
            }, 5000);
        });

        // Start loading the first ad
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
            return;
        }

        if (needsToWatchAd) {
            if (adLoaded) {
                rewardedAd.show();
            } else {
                alert('Cargando anuncio... Por favor espera un momento.');
            }
            return;
        }

        if (canStart) {
            setIsTracking(true);
        }
    };

    const handleStopAlarm = () => {
        stopAlarm();
        // Show Interstitial if NOT Premium
        if (!isPremium && interstitialLoaded) {
            console.log('🎬 [AD] Showing Interstitial after alarm stop');
            showInterstitial();
        }
    };

    const handleShareTrip = async () => {
        if (!destination) return;

        try {
            // Calcular ETA aproximado si tenemos distancia (asumiendo 30km/h velocidad promedio bus)
            let etaText = '';
            // No tenemos la velocidad real aquí, pero podemos estimar algo genérico o solo enviar destino.
            // Para MVP solo enviamos destino.

            const message = `🚌 Voy camino a: *${destination.name}* usando ProxiAlert. \n\n📍 Te avisaré cuando llegue. \n\nDescarga la App aquí: https://play.google.com/store/apps/details?id=com.antigravity.proxialert`;

            const result = await Share.share({
                message: message,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
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
                            // Secret Debug Toggle
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

                    {/* Share Button (Only if destination selected) */}
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
                < TouchableOpacity
                    style={
                        [
                            styles.actionBtn,
                            isTracking ? styles.stopBtn : styles.startBtn,
                            needsToWatchAd && styles.adBtn, // Color especial para ver video
                            !canStart && !needsToWatchAd && !isTracking && styles.disabledBtn
                        ]}
                    onPress={handleMainButtonPress}
                    disabled={!isTracking && !canStart && !needsToWatchAd}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {needsToWatchAd && isAdLoading && (
                            <ActivityIndicator color="white" size="small" style={{ marginRight: 8 }} />
                        )}
                        <Text style={styles.actionBtnText}>
                            {isTracking
                                ? 'DETENER ALERTA'
                                : limitReached
                                    ? 'LÍMITE DIARIO ALCANZADO'
                                    : needsToWatchAd
                                        ? (isAdLoading ? 'CARGANDO ANUNCIO...' : 'VER ANUNCIO PARA DESBLOQUEAR')
                                        : 'INICIAR ALERTA'}
                        </Text>
                    </View>
                </TouchableOpacity >

                {/* Usos Counter (Minimal) */}
                {
                    !isPremium && (
                        <View style={styles.usageCounter}>
                            <Text style={styles.usageText}>
                                {dailyTripsCount}/{maxDailyTrips}
                            </Text>
                        </View>
                    )
                }
            </View >

            {/* Modal de Alarma */}
            < Modal visible={isAlarmActive} transparent animationType="slide" >
                <View style={styles.modalOverlay}>
                    <View style={styles.alarmCard}>
                        <Text style={styles.alarmTitle}>{i18n.t('alarmTitle')}</Text>
                        <Text style={styles.alarmMessage}>
                            {hasDestination ? i18n.t('alarmMessage', { destination: destination.name }) : ''}
                        </Text>
                        <TouchableOpacity style={styles.stopAlarmBtn} onPress={handleStopAlarm}>
                            <Text style={styles.stopAlarmText}>{i18n.t('stopAlarmBtn')}</Text>
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
    stopAlarmBtn: {
        backgroundColor: COLORS.danger,
        paddingVertical: SPACING.m,
        paddingHorizontal: SPACING.xl,
        borderRadius: RADIUS.round,
    },
    stopAlarmText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.large,
        fontWeight: 'bold',
    },
    adBtn: {
        backgroundColor: '#F5A623',
    },
});
