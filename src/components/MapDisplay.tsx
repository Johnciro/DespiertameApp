import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAppStore } from '../store/useAppStore';
import { COLORS } from '../constants/theme';

export const MapDisplay = () => {
    const mapRef = useRef<MapView>(null);
    const { currentLocation, destination, alertRadius } = useAppStore();

    // Centrar mapa cuando cambia el destino o la ubicación inicial
    useEffect(() => {
        if (destination && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: destination.location.latitude,
                longitude: destination.location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
        } else if (currentLocation && !destination && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        }
    }, [destination, currentLocation]); // Dependencias simplificadas para evitar loops

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                showsUserLocation={true}
                showsMyLocationButton={false} // Custom button can be added
                initialRegion={{
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                {destination && (
                    <>
                        <Marker
                            coordinate={destination.location}
                            title={destination.name}
                            pinColor={COLORS.accent}
                        />
                        <Circle
                            center={destination.location}
                            radius={alertRadius}
                            strokeColor="rgba(255, 90, 95, 0.5)"
                            fillColor="rgba(255, 90, 95, 0.2)"
                        />
                    </>
                )}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        // Don't use absoluteFillObject - let the parent container control bounds
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});
