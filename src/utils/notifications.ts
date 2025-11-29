import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Configura el sistema de notificaciones para alarmas de alta prioridad
 */
export const setupNotifications = async () => {
    // Configurar handler de notificaciones
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });

    // Solicitar permisos
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
    }

    // Configurar canal de Android para alta prioridad
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('alarm', {
            name: 'Alarm',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 500, 200, 500, 200, 500, 200, 500],
            sound: 'default',
            enableVibrate: true,
            enableLights: true,
            lightColor: '#FF0000',
        });
    }

    return true;
};

/**
 * Envía una notificación de alarma de alta prioridad
 */
export const sendAlarmNotification = async (message: string, title: string = '¡LLEGASTE!') => {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body: message,
                sound: true,
                priority: Notifications.AndroidNotificationPriority.MAX,
                vibrate: [0, 500, 200, 500, 200, 500, 200, 500],
                data: { type: 'alarm' },
            },
            trigger: null, // Inmediato
        });
    } catch (error) {
        console.error('Error sending alarm notification:', error);
    }
};
