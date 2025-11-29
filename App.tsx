import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { setupNotifications } from './src/utils/notifications';

export default function App() {
    useEffect(() => {
        // Inicializar sistema de notificaciones
        setupNotifications().catch(error => {
            console.error('Error setting up notifications:', error);
        });
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
