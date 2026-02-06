import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from '../types';

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            currentLocation: null,
            destination: null,
            alertRadius: 500,
            isTracking: false,
            isAlarmActive: false,
            distanceToDestination: null,

            // Freemium State
            isPremium: false,
            dailyTripsCount: 0,
            maxDailyTrips: 3, // Now refers to search-to-favorite limit if needed, or we can use favorites.length
            lastResetDate: new Date().toDateString(),
            isRewardAdWatched: false,
            favorites: [],

            setDestination: (destination) => set({ destination: destination ? { ...destination } : null }),
            setCurrentLocation: (location) => set({ currentLocation: location }),
            setAlertRadius: (radius) => set({ alertRadius: radius }),

            setIsTracking: (isTracking) => {
                const state = get();

                // Enforce "Must be Favorite to Start"
                if (isTracking && state.destination) {
                    const isFav = state.favorites.some(fav =>
                        fav.location.latitude === state.destination?.location.latitude &&
                        fav.location.longitude === state.destination?.location.longitude
                    );
                    if (!isFav) {
                        console.warn('Cannot start: Destination must be a favorite');
                        return;
                    }
                }

                if (isTracking && !state.isTracking && !state.isPremium) {
                    // Check if they still have free daily trips
                    const hasFreeTrips = state.dailyTripsCount < state.maxDailyTrips;

                    if (hasFreeTrips || state.isRewardAdWatched) {
                        set({
                            isTracking: true,
                            isRewardAdWatched: false,
                            dailyTripsCount: state.dailyTripsCount + 1
                        });
                    } else {
                        // Needs to watch ad
                        return;
                    }
                } else {
                    // Increment counter for premium too, and handle stop
                    if (isTracking && !state.isTracking) {
                        set({
                            isTracking: true,
                            dailyTripsCount: state.dailyTripsCount + 1
                        });
                    } else {
                        set({ isTracking });
                    }
                }
            },

            setDistanceToDestination: (distance) => set({ distanceToDestination: distance }),
            triggerAlarm: () => set({ isAlarmActive: true }),
            stopAlarm: () => set({ isAlarmActive: false }),

            // Freemium Actions
            setPremiumStatus: (isPremium) => set({ isPremium }),
            unlockTripWithAd: () => set({ isRewardAdWatched: true }),
            checkDailyLimit: () => {
                const state = get();
                const today = new Date().toDateString();
                if (today !== state.lastResetDate) {
                    set({ dailyTripsCount: 0, lastResetDate: today, isRewardAdWatched: false });
                    return true;
                }
                return state.isPremium || state.dailyTripsCount < state.maxDailyTrips;
            },

            // Favorites Actions
            addFavorite: (destination) => {
                const state = get();
                const maxFavs = state.isPremium ? 30 : 3;

                // Limit check
                if (state.favorites.length >= maxFavs) {
                    return false; // Limit reached
                }
                // Check if already exists (by coordinates to be safe)
                if (state.favorites.some(fav =>
                    fav.location.latitude === destination.location.latitude &&
                    fav.location.longitude === destination.location.longitude
                )) {
                    return true; // Already saved
                }

                const newFavorite = {
                    ...destination,
                    createdAt: Date.now(), // Timestamp for 30-day lock
                };

                set({ favorites: [...state.favorites, newFavorite] });
                return true;
            },
            removeFavorite: (name) => {
                const state = get();
                const favorite = state.favorites.find(fav => fav.name === name);

                if (favorite) {
                    const now = Date.now();
                    const createdAt = favorite.createdAt || 0;
                    const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);

                    if (daysSinceCreation < 30) {
                        const remainingDays = Math.ceil(30 - daysSinceCreation);
                        return { success: false, remainingDays };
                    }
                }

                set({ favorites: state.favorites.filter(fav => fav.name !== name) });
                return { success: true };
            }
        }),
        {
            name: 'proxialert-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                destination: state.destination,
                alertRadius: state.alertRadius,
                isTracking: state.isTracking,
                isAlarmActive: state.isAlarmActive,
                isPremium: state.isPremium,
                dailyTripsCount: state.dailyTripsCount,
                lastResetDate: state.lastResetDate,
                favorites: state.favorites,
            }),
        }
    )
);
