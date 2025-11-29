import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TEST_ADS = [
    {
        id: 1,
        text: 'Coca-Cola - Prueba el Sabor',
        color: '#FF0000',
    },
    {
        id: 2,
        text: 'Nike - Just Do It',
        color: '#000000',
    },
    {
        id: 3,
        text: 'McDonald\'s - I\'m Lovin\' It',
        color: '#FFC72C',
    },
    {
        id: 4,
        text: 'Google - Search the World',
        color: '#4285F4',
    },
];

export const TestBanner = () => {
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const interval = setInterval(() => {
            // Fade out and slide left
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: -50,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // Change ad
                setCurrentAdIndex((prevIndex) => (prevIndex + 1) % TEST_ADS.length);

                // Reset position and fade in
                slideAnim.setValue(50);
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start();
            });
        }, 5000); // Cambia cada 5 segundos

        return () => clearInterval(interval);
    }, []);

    const currentAd = TEST_ADS[currentAdIndex];

    return (
        <View style={[styles.container, { backgroundColor: currentAd.color }]}>
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [{ translateX: slideAnim }],
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                    justifyContent: 'center',
                }}
            >
                <Text style={styles.adText}>{currentAd.text}</Text>
            </Animated.View>
            <View style={styles.dotsContainer}>
                {TEST_ADS.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            index === currentAdIndex && styles.activeDot,
                        ]}
                    />
                ))}
            </View>
            <Text style={styles.adLabel}>AD</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: RADIUS.m,
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
    },
    adText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    dotsContainer: {
        position: 'absolute',
        bottom: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.4)',
        marginHorizontal: 3,
    },
    activeDot: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    adLabel: {
        position: 'absolute',
        right: 10,
        top: 5,
        color: 'rgba(255,255,255,0.5)',
        fontSize: 8,
        fontWeight: 'bold',
    },
});
