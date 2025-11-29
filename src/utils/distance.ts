import { Coordinates } from '../types';

// Fórmula de Haversine para calcular la distancia entre dos puntos en la Tierra
export const calculateDistance = (
    coord1: Coordinates,
    coord2: Coordinates
): number => {
    const R = 6371e3; // Radio de la Tierra en metros
    const lat1 = (coord1.latitude * Math.PI) / 180;
    const lat2 = (coord2.latitude * Math.PI) / 180;
    const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distancia en metros
    return distance;
};

export const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
};

// Calcular tiempo estimado de arribo basado en velocidad promedio
export const calculateEstimatedTime = (distanceMeters: number, speedKmh: number = 50): string => {
    const distanceKm = distanceMeters / 1000;
    const timeHours = distanceKm / speedKmh;
    const timeMinutes = Math.round(timeHours * 60);

    if (timeMinutes < 1) {
        return 'Menos de 1 min';
    } else if (timeMinutes < 60) {
        return `${timeMinutes} min`;
    } else {
        const hours = Math.floor(timeMinutes / 60);
        const mins = timeMinutes % 60;
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
};
