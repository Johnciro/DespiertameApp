import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Vibration } from 'react-native';
import * as Speech from 'expo-speech';
import { useAppStore } from '../store/useAppStore';
import { LOCATION_TASK_NAME, registerBackgroundTask } from '../tasks/backgroundLocation';
import { calculateDistance } from '../utils/distance';
import i18n, { getTTSLanguage } from '../i18n';

export const useLocationTracker = () => {
    const {
        isTracking,
        isAlarmActive,
        triggerAlarm,
        stopAlarm,
        setCurrentLocation,
        setDistanceToDestination,
    } = useAppStore();

    const isSpeaking = useRef(false);
    const shouldContinueSpeaking = useRef(false);

    // Solicitar permisos al montar
    useEffect(() => {
        (async () => {
            try {
                const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
                if (fgStatus !== 'granted') {
                    console.warn('Permiso de ubicación en primer plano denegado');
                    return;
                }

                const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
                if (bgStatus !== 'granted') {
                    console.warn('Permiso de ubicación en segundo plano denegado');
                } else {
                    // Register background task only after permissions are granted
                    registerBackgroundTask();
                }

                // Obtener ubicación inicial
                const location = await Location.getCurrentPositionAsync({});
                setCurrentLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            } catch (error) {
                console.error('Error requesting permissions or getting location:', error);
            }
        })();
    }, []);

    // Gestión del Tracking (Foreground + Background)
    useEffect(() => {
        const toggleTracking = async () => {
            if (isTracking) {
                await startBackgroundTracking();
            } else {
                await stopBackgroundTracking();
            }
        };
        toggleTracking();
    }, [isTracking]);

    // Monitoreo de distancia en foreground para activar alarma
    useEffect(() => {
        if (!isTracking) return;

        const checkDistance = async () => {
            const { destination, currentLocation, alertRadius, isAlarmActive } = useAppStore.getState();

            if (!destination || !currentLocation || isAlarmActive) return;

            const distance = calculateDistance(currentLocation, destination.location);
            setDistanceToDestination(distance);

            // Activar alarma si está dentro del radio
            if (distance <= alertRadius) {
                console.log('¡Dentro del radio de alerta! Activando alarma...');
                triggerAlarm();
            }
        };

        // Verificar distancia cada 2 segundos cuando está tracking
        const interval = setInterval(checkDistance, 2000);
        checkDistance(); // Verificar inmediatamente

        return () => clearInterval(interval);
    }, [isTracking]);

    // Gestión de la Alarma (UI Feedback Loop)
    useEffect(() => {
        if (isAlarmActive) {
            startAlarmLoop();
        } else {
            stopAlarmLoop();
        }
        return () => stopAlarmLoop();
    }, [isAlarmActive]);

    const startBackgroundTracking = async () => {
        const { status } = await Location.getBackgroundPermissionsAsync();
        if (status === 'granted') {
            await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                accuracy: Location.Accuracy.High,
                timeInterval: 5000,
                distanceInterval: 10,
                showsBackgroundLocationIndicator: true,
                foregroundService: {
                    notificationTitle: i18n.t('notificationTitle'),
                    notificationBody: i18n.t('notificationBody'),
                },
            });
        }
    };

    const stopBackgroundTracking = async () => {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
        if (hasStarted) {
            await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        }
    };

    // Lógica de Alarma en Primer Plano (Refuerzo)
    const speakPhrase = () => {
        if (!shouldContinueSpeaking.current) return;

        isSpeaking.current = true;
        Speech.speak(i18n.t('ttsMessage'), {
            language: getTTSLanguage(),
            rate: 0.9,
            onDone: () => {
                isSpeaking.current = false;
                if (shouldContinueSpeaking.current) {
                    setTimeout(speakPhrase, 1000);
                }
            },
            onStopped: () => {
                isSpeaking.current = false;
            }
        });
    };

    const startAlarmLoop = () => {
        shouldContinueSpeaking.current = true;
        if (!isSpeaking.current) speakPhrase();
        Vibration.vibrate([0, 500, 200, 500], true);
    };

    const stopAlarmLoop = () => {
        shouldContinueSpeaking.current = false;
        Speech.stop();
        Vibration.cancel();
    };

    return {};
};
