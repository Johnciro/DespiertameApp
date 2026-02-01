import { Platform } from 'react-native';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

// User-Agent is required by Nominatim usage policy
const USER_AGENT = 'ProxiAlertApp/1.0';

export interface LocationResult {
    name: string;
    location: {
        latitude: number;
        longitude: number;
    };
}

export const searchLocation = async (query: string): Promise<LocationResult[]> => {
    if (!query || query.length < 3) return [];

    try {
        const params = new URLSearchParams({
            q: query,
            format: 'json',
            addressdetails: '1',
            limit: '5',
            'accept-language': 'es', // Prefer Spanish results
        });

        const response = await fetch(`${NOMINATIM_BASE_URL}?${params.toString()}`, {
            headers: {
                'User-Agent': USER_AGENT,
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        return data.map((item: any) => ({
            name: item.display_name,
            location: {
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon),
            },
        }));
    } catch (error) {
        console.error('Error searching location with Nominatim:', error);
        return [];
    }
};

export const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
        const params = new URLSearchParams({
            lat: latitude.toString(),
            lon: longitude.toString(),
            format: 'json',
            'accept-language': 'es',
        });

        const response = await fetch(`${NOMINATIM_REVERSE_URL}?${params.toString()}`, {
            headers: {
                'User-Agent': USER_AGENT,
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.display_name || null;
    } catch (error) {
        console.error('Error reverse geocoding with Nominatim:', error);
        return null;
    }
};
