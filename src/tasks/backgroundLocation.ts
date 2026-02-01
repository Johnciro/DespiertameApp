import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateDistance } from '../utils/distance';
import { sendAlarmNotification } from '../utils/notifications';
import i18n from '../i18n';

export const LOCATION_TASK_NAME = 'background-location-task';

let isTaskRegistered = false;

/**
 * Registers the background location task.
 * Should be called AFTER permissions are granted, not at app startup.
 */
export const registerBackgroundTask = () => {
    // Prevent duplicate registration
    if (isTaskRegistered) {
        console.log('Background task already registered');
        return;
    }

    try {
        TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
            if (error) {
                console.error('Error en background location:', error);
                return;
            }

            if (data) {
                const { locations } = data as { locations: Location.LocationObject[] };
                const location = locations[0];

                if (!location) return;

                try {
                    const storageItem = await AsyncStorage.getItem('proxialert-storage');
                    if (!storageItem) return;

                    const { state } = JSON.parse(storageItem);
                    const { destination, alertRadius, isTracking, isAlarmActive } = state;

                    if (!isTracking || !destination) return;

                    // Si la alarma ya está activa, no hacer nada más
                    if (isAlarmActive) return;

                    const coords = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    };

                    const distance = calculateDistance(coords, destination.location);

                    if (distance <= alertRadius) {
                        console.log('¡Destino alcanzado! Activando alarma...');

                        // Actualizar store para activar alarma
                        const updatedState = {
                            state: {
                                ...state,
                                isAlarmActive: true,
                            }
                        };
                        await AsyncStorage.setItem('proxialert-storage', JSON.stringify(updatedState));

                        // Enviar notificación de alta prioridad
                        await sendAlarmNotification(
                            i18n.t('backgroundAlert'),
                            i18n.t('alarmTitle')
                        );
                    }
                } catch (err) {
                    console.error('Error procesando background location:', err);
                }
            }
        });

        isTaskRegistered = true;
        console.log('Background location task registered successfully');
    } catch (error) {
        console.error('Failed to register background task:', error);
    }
};

