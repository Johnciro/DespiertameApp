import { LocationObject } from 'expo-location';

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface Destination {
    name: string;
    location: Coordinates;
    createdAt?: number;
}

export interface AppState {
    currentLocation: LocationObject | null;
    destination: Destination | null;
    alertRadius: number;
    isTracking: boolean;
    isAlarmActive: boolean;
    distanceToDestination: number | null;

    // Freemium State
    isPremium: boolean;
    dailyTripsCount: number;
    maxDailyTrips: number;
    lastResetDate: string;
    isRewardAdWatched: boolean;
    favorites: Destination[];

    // Search Quota
    googleSearchCount: number;
    maxFreeGoogleSearches: number;
    isSearchAdWatched: boolean;

    isConfirmingFavorite: boolean;

    setDestination: (destination: Destination | null) => void;
    setCurrentLocation: (location: LocationObject) => void;
    setAlertRadius: (radius: number) => void;
    setIsTracking: (isTracking: boolean) => void;
    setDistanceToDestination: (distance: number | null) => void;
    triggerAlarm: () => void;
    stopAlarm: () => void;

    // Freemium Actions
    setPremiumStatus: (isPremium: boolean) => void;
    unlockTripWithAd: () => void;
    checkDailyLimit: () => boolean;

    // Favorites Actions
    addFavorite: (destination: Destination) => boolean;
    removeFavorite: (name: string) => { success: boolean; remainingDays?: number };

    // Search Quota Actions
    incrementSearchCount: () => void;
    unlockSearchWithAd: () => void;

    setIsConfirmingFavorite: (val: boolean) => void;
}
