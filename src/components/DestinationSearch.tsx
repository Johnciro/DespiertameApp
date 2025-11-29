import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Keyboard, TouchableOpacity, Text, Dimensions } from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';
import { COLORS, SHADOWS, SPACING, RADIUS } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

import i18n from '../i18n';

const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey || '';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DestinationSearch = () => {
    const setDestination = useAppStore((state) => state.setDestination);
    const destination = useAppStore((state) => state.destination);
    const isTracking = useAppStore((state) => state.isTracking);
    const ref = useRef<GooglePlacesAutocompleteRef>(null);
    const [searchKey, setSearchKey] = React.useState(0);

    // Limpiar barra cuando se selecciona un destino
    useEffect(() => {
        if (destination) {
            const timer = setTimeout(() => {
                // Forzamos el reinicio del componente para limpiar la lista visualmente
                setSearchKey(prev => prev + 1);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [destination]);

    return (
        <View style={styles.container}>
            <GooglePlacesAutocomplete
                key={searchKey} // Clave para forzar re-render
                placeholder={i18n.t('searchPlaceholder')}
                onPress={(data, details = null) => {
                    if (details) {
                        const { lat, lng } = details.geometry.location;
                        const newDestination = {
                            name: data.description,
                            location: { latitude: lat, longitude: lng },
                        };
                        setDestination(newDestination);
                        // Confirmación visual temporal para el usuario
                        // alert(`Destino actualizado a:\n${data.description}`);
                    } else {
                        alert('Error: No details');
                    }
                }}
                query={{
                    key: GOOGLE_PLACES_API_KEY,
                    language: 'es',
                }}
                fetchDetails={true}
                enablePoweredByContainer={false}
                styles={{
                    container: {
                        flex: 0,
                        zIndex: 999,
                    },
                    textInput: styles.textInput,
                    listView: {
                        backgroundColor: COLORS.white,
                        borderRadius: RADIUS.m,
                        marginTop: SPACING.s,
                        ...SHADOWS.default,
                        maxHeight: 250,
                        elevation: 10,
                        zIndex: 1000,
                    },
                    row: styles.row,
                    description: styles.description,
                }}
                ref={ref}
                debounce={300}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 10, // Relativo al contenedor, que ya está debajo del banner
        left: SPACING.m,
        right: SPACING.m,
        zIndex: 10,
        maxWidth: SCREEN_WIDTH - (SPACING.m * 2),
    },
    autocompleteContainer: {
        flex: 0,
    },
    textInput: {
        height: 44, // Matched to destination field
        borderRadius: RADIUS.l,
        paddingHorizontal: 12,
        paddingRight: 40,
        backgroundColor: COLORS.white,
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '500',
        ...SHADOWS.floating,
    },
    listView: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.m,
        marginTop: SPACING.s,
        ...SHADOWS.default,
        maxHeight: 250, // Más alto para ver más opciones
    },
    row: {
        paddingVertical: SPACING.m + 2, // Más espacio entre opciones
        paddingHorizontal: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    description: {
        fontSize: 16, // Texto más grande en resultados
        color: COLORS.text,
        lineHeight: 22,
    },
    clearButton: {
        position: 'absolute',
        right: 12,
        top: 12,
        width: 36, // Botón más grande
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
        ...SHADOWS.default,
    },
    clearButtonText: {
        color: COLORS.white,
        fontSize: 22, // X más grande
        fontWeight: '700',
        lineHeight: 22,
    },
});
