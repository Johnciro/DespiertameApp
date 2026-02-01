import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Vibration, AppState, AppStateStatus } from 'react-native';
import * as Speech from 'expo-speech';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    const appState = useRef(AppState.currentState);
    const lastSpeechTime = useRef<number>(0);
    const watchdogTimer = useRef<NodeJS.Timeout | null>(null);

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
                setCurrentLocation(location);
            } catch (error) {
                console.error('Error requesting permissions or getting location:', error);
            }
        })();

        return () => {
            // Cleanup watchdog on unmount
            if (watchdogTimer.current) {
                clearTimeout(watchdogTimer.current);
            }
        };
    }, []);

    // Listener para detectar cuando la app vuelve a primer plano
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                // App volvió a primer plano
                console.log('📱 [APP STATE] App returned to foreground');

                // Sincronizar estado desde AsyncStorage (por si cambió en background)
                const storageItem = await AsyncStorage.getItem('proxialert-storage');
                if (storageItem) {
                    const { state } = JSON.parse(storageItem);
                    const currentState = useAppStore.getState();

                    // Si la alarma se activó en background, mostrar el modal
                    if (state.isAlarmActive && !currentState.isAlarmActive) {
                        console.log('🚨 [SYNC] Alarm was triggered in background, showing modal now');
                        triggerAlarm();
                    }
                }
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [isAlarmActive]);

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

        let locationSubscription: Location.LocationSubscription | null = null;

        const startLocationUpdates = async () => {
            try {
                // Suscribirse a actualizaciones de ubicación en tiempo real
                locationSubscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 2000, // Actualizar cada 2 segundos
                        distanceInterval: 10, // O cada 10 metros
                    },
                    (location) => {
                        // Actualizar ubicación actual
                        setCurrentLocation(location);
                        console.log('[LOCATION UPDATE]', location.coords.latitude, location.coords.longitude);

                        const { destination, alertRadius, isAlarmActive } = useAppStore.getState();

                        if (!destination) {
                            console.log('[CHECK] No destination set');
                            return;
                        }

                        if (isAlarmActive) {
                            console.log('[CHECK] Alarm already active, skipping');
                            return;
                        }

                        const distance = calculateDistance(location.coords, destination.location);
                        setDistanceToDestination(distance);
                        console.log('[DISTANCE]', distance.toFixed(2), 'm | Radius:', alertRadius, 'm');

                        // Activar alarma si está dentro del radio
                        if (distance <= alertRadius) {
                            console.log('🚨 [TRIGGER ALARM] Distance:', distance, '<=', alertRadius);
                            triggerAlarm();
                            console.log('🚨 [AFTER TRIGGER] isAlarmActive:', useAppStore.getState().isAlarmActive);
                        }
                    }
                );
            } catch (error) {
                console.error('Error starting location updates:', error);
            }
        };

        startLocationUpdates();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, [isTracking]);

    // Gestión de la Alarma (UI Feedback Loop)
    useEffect(() => {
        console.log('🔔 [ALARM EFFECT] isAlarmActive changed to:', isAlarmActive);
        if (isAlarmActive) {
            console.log('🔔 [STARTING ALARM LOOP]');
            startAlarmLoop();
        } else {
            console.log('🔔 [STOPPING ALARM LOOP]');
            stopAlarmLoop();
        }
        return () => {
            console.log('🔔 [CLEANUP] Stopping alarm loop');
            stopAlarmLoop();
        };
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
    const speakPhrase = async () => {
        if (!shouldContinueSpeaking.current) return;

        // Clear any existing watchdog
        if (watchdogTimer.current) {
            clearTimeout(watchdogTimer.current);
        }

        // Reclaim audio focus before each iteration
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: false,
                playThroughEarpieceAndroid: false,
                interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            });
        } catch (error) {
            console.warn('⚠️ Failed to reclaim audio focus:', error);
        }

        isSpeaking.current = true;
        lastSpeechTime.current = Date.now();
        const message = i18n.t('ttsMessage');
        console.log('🔊 [TTS] Speaking:', message);

        // Watchdog: Force next iteration if onDone doesn't fire
        watchdogTimer.current = setTimeout(() => {
            const elapsed = Date.now() - lastSpeechTime.current;
            if (shouldContinueSpeaking.current && elapsed > 5000) {
                console.warn('⚠️ [TTS WATCHDOG] onDone blocked - forcing next iteration');
                isSpeaking.current = false;
                speakPhrase();
            }
        }, 6000);

        Speech.speak(message, {
            language: getTTSLanguage(),
            pitch: 1.3,
            rate: 0.8,
            volume: 1.0,
            onDone: () => {
                console.log('🔊 [TTS] Completed normally');
                if (watchdogTimer.current) {
                    clearTimeout(watchdogTimer.current);
                }
                isSpeaking.current = false;
                if (shouldContinueSpeaking.current) {
                    setTimeout(() => speakPhrase(), 1500);
                }
            },
            onStopped: () => {
                console.log('🔊 [TTS] Stopped');
                if (watchdogTimer.current) {
                    clearTimeout(watchdogTimer.current);
                }
                isSpeaking.current = false;
            },
            onError: (error) => {
                console.error('🔊 [TTS ERROR]', error);
                if (watchdogTimer.current) {
                    clearTimeout(watchdogTimer.current);
                }
                isSpeaking.current = false;
                // Retry on error
                if (shouldContinueSpeaking.current) {
                    setTimeout(() => speakPhrase(), 2000);
                }
            }
        });
    };

    const startAlarmLoop = async () => {
        console.log('🔊 [START ALARM LOOP] Configuring audio...');

        // Configurar Audio Session para MÁXIMA PRIORIDAD
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: true,
                playsInSilentModeIOS: true, // CRITICAL: Play even in silent mode
                shouldDuckAndroid: false, // DON'T duck - play at full volume
                playThroughEarpieceAndroid: false,
                interruptionModeAndroid: InterruptionModeAndroid.DoNotMix, // Stop other audio
                interruptionModeIOS: InterruptionModeIOS.DoNotMix, // Stop other audio
            });
            console.log('🔊 [AUDIO CONFIGURED] Full volume mode');
        } catch (error) {
            console.error('⚠️ [AUDIO ERROR]', error);
        }

        shouldContinueSpeaking.current = true;
        console.log('🔊 [STARTING SPEECH] isSpeaking:', isSpeaking.current);
        if (!isSpeaking.current) speakPhrase();

        console.log('📳 [STARTING VIBRATION]');
        Vibration.vibrate([0, 500, 200, 500], true);
    };

    const stopAlarmLoop = () => {
        console.log('🛑 [STOP ALARM]');
        shouldContinueSpeaking.current = false;
        Speech.stop();
        Vibration.cancel();
    };

    return {};
};
