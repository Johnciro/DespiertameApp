import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { useAppStore } from '../store/useAppStore';
import { COLORS, RADIUS, SHADOWS, SPACING, FONT_SIZES } from '../constants/theme';
import { formatDistance, calculateEstimatedTime } from '../utils/distance';
import i18n from '../i18n';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

    const [showAdModal, setShowAdModal] = React.useState(false);
    const videoRef = React.useRef<Video>(null);
    const [videoStatus, setVideoStatus] = React.useState<AVPlaybackStatus | null>(null);

    // Panel persistente: Si no hay destino, mostrar estado vacío o placeholder
    const hasDestination = !!destination;

    // Lógica de Bloqueo / Desbloqueo
    const limitReached = !isPremium && dailyTripsCount >= maxDailyTrips;
    const isFirstTrip = dailyTripsCount === 0;
    const needsToWatchAd = !isPremium && !isFirstTrip && !isRewardAdWatched && !isTracking;

    const canStart = hasDestination && (isPremium || !limitReached) && (!needsToWatchAd || isRewardAdWatched);

    const handleMainButtonPress = () => {
        if (isTracking) {
            setIsTracking(false);
            return;
        }

        if (needsToWatchAd) {
            setShowAdModal(true);
            return;
        }

        if (canStart) {
            setIsTracking(true);
        }
    };

    // Calcular tiempo restante para el UI
    const getRemainingTime = () => {
        if (videoStatus && videoStatus.isLoaded && videoStatus.durationMillis && videoStatus.positionMillis) {
            const remaining = Math.ceil((videoStatus.durationMillis - videoStatus.positionMillis) / 1000);
            return remaining > 0 ? remaining : 0;
        }
        return 15; // Default estimado
    };

    const getProgress = () => {
        if (videoStatus && videoStatus.isLoaded && videoStatus.durationMillis && videoStatus.positionMillis) {
            return videoStatus.positionMillis / videoStatus.durationMillis;
        }
        return 0;
    };

    return (
        <>
            <View style={styles.container}>
                {/* Header / Destino */}
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
                    <Text style={styles.actionBtnText}>
                        {isTracking
                            ? 'DETENER ALERTA'
                            : limitReached
                                ? 'LÍMITE DIARIO ALCANZADO'
                                : needsToWatchAd
                                    ? 'VER VIDEO PARA DESBLOQUEAR'
                                    : 'INICIAR ALERTA'}
                    </Text>
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
                        <TouchableOpacity style={styles.stopAlarmBtn} onPress={stopAlarm}>
                            <Text style={styles.stopAlarmText}>{i18n.t('stopAlarmBtn')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal >

            {/* Real Reward Ad Video Modal */}
            < Modal visible={showAdModal} animationType="slide" onRequestClose={() => { }}>
                <View style={styles.videoContainer}>
                    <Video
                        ref={videoRef}
                        style={styles.video}
                        source={{
                            uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                        }}
                        useNativeControls={false}
                        resizeMode={ResizeMode.COVER}
                        isLooping={false}
                        shouldPlay={showAdModal}
                        onPlaybackStatusUpdate={status => {
                            setVideoStatus(status);
                            if (status.isLoaded && status.didJustFinish) {
                                setShowAdModal(false);
                                unlockTripWithAd();
                                setDestination(null); // Clear destination after watching ad
                                alert("¡Recompensa obtenida! Viaje desbloqueado.");
                            }
                        }}
                    />

                    {/* Overlay UI */}
                    <View style={styles.videoOverlay}>
                        <View style={styles.timerContainer}>
                            <Text style={styles.timerText}>
                                Recompensa en {getRemainingTime()}s
                            </Text>
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBarFill, { width: `${getProgress() * 100}%` }]} />
                        </View>
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
    headerRow: {
        backgroundColor: COLORS.white,
        padding: 8,
        borderRadius: RADIUS.m,
        marginBottom: 6,
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
    // Video Modal Styles
    videoContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
    },
    video: {
        ...StyleSheet.absoluteFillObject,
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 50,
    },
    timerContainer: {
        alignSelf: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        borderRadius: 20,
    },
    timerText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 20,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#F5A623',
    },
});
