import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { setupNotifications } from './src/utils/notifications';
import * as Notifications from 'expo-notifications';
import { useAppStore } from './src/store/useAppStore';
import mobileAds from 'react-native-google-mobile-ads';

export default function App() {
    useEffect(() => {
        // Inicializar AdMob SDK
        mobileAds()
            .initialize()
            .then(() => {
                console.log('✅ [ADMOB] SDK initialized successfully');
            })
            .catch(error => {
                console.error('❌ [ADMOB] Failed to initialize SDK:', error);
            });

        // Inicializar sistema de notificaciones
        setupNotifications().catch(error => {
            console.error('Error setting up notifications:', error);
        });

        // Listener para cuando el usuario TOCA la notificación
        const notificationResponseListener = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('📱 [NOTIFICATION TAPPED]', response.notification.request.content.data);

            // Si es una notificación de alarma, activar el modal
            if (response.notification.request.content.data?.type === 'alarm') {
                console.log('🚨 [ACTIVATING ALARM MODAL FROM NOTIFICATION]');
                useAppStore.getState().triggerAlarm();
            }
        });

        return () => {
            notificationResponseListener.remove();
        };
    }, []);

    try {
        return (
            <ErrorBoundary>
                <SafeAreaProvider>
                    <HomeScreen />
                </SafeAreaProvider>
            </ErrorBoundary>
        );
    } catch (error) {
        console.error('Critical error in App initialization:', error);
        // Return a minimal error view if App fails to initialize
        return null;
    }
}
