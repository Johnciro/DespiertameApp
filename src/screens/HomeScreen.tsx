import React from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Text, BackHandler, Platform, SafeAreaView } from 'react-native';
import { MapDisplay } from '../components/MapDisplay';
import { DestinationSearch } from '../components/DestinationSearch';
import { InfoPanel } from '../components/InfoPanel';
import { TestBanner } from '../components/TestBanner';
import { useLocationTracker } from '../hooks/useLocationTracker';
import { COLORS, SHADOWS, SPACING, RADIUS } from '../constants/theme';

import { useAppStore } from '../store/useAppStore';

export const HomeScreen = () => {
    // Inicializar hook de tracking
    useLocationTracker();
    const isPremium = useAppStore((state) => state.isPremium);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Top Ad Banner - Solo si NO es Premium */}
            {!isPremium && (
                <View style={styles.adPlaceholderTop}>
                    <TestBanner />
                </View>
            )}

            <View style={styles.contentContainer}>
                <MapDisplay />
                <DestinationSearch />
                <InfoPanel />
            </View>

            {/* Bottom Ad Banner - Solo si NO es Premium */}
            {!isPremium && (
                <View style={styles.adPlaceholderBottom}>
                    <TestBanner />
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    contentContainer: {
        flex: 1,
        position: 'relative',
    },
    adPlaceholderTop: {
        height: 50, // IAB Mobile Banner standard
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: SPACING.m,
        marginTop: SPACING.xl,
        marginBottom: SPACING.s,
        borderRadius: RADIUS.m,
    },
    adPlaceholderBottom: {
        height: 50, // IAB Mobile Banner standard
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: SPACING.m,
        marginTop: SPACING.s,
        marginBottom: SPACING.xl,
        borderRadius: RADIUS.m,
    },
    adText: {
        color: '#757575',
        fontWeight: 'bold',
        fontSize: 12,
    },
    exitButton: {
        position: 'absolute',
        top: 80, // Ajustado por el banner
        right: SPACING.m,
        width: 40,
        height: 40,
        borderRadius: RADIUS.round,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
        ...SHADOWS.floating,
    },
    exitButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
});
