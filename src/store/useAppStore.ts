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
            maxDailyTrips: 200,
            lastResetDate: new Date().toDateString(),
            isRewardAdWatched: false,
            favorites: [],

            setDestination: (destination) => set({ destination: destination ? { ...destination } : null }),
            setCurrentLocation: (location) => set({ currentLocation: location }),
            setAlertRadius: (radius) => set({ alertRadius: radius }),

            setIsTracking: (isTracking) => {
                const state = get();
                if (isTracking && !state.isTracking && !state.isPremium) {
                    const today = new Date().toDateString();
                    if (today !== state.lastResetDate) {
                        set({
                            dailyTripsCount: 1,
                            lastResetDate: today,
                            isTracking: true,
                            isRewardAdWatched: false
                        });
                        return;
                    }
                    if (state.dailyTripsCount === 0) {
                        set({ dailyTripsCount: 1, isTracking: true });
                        return;
                    }
                    if (state.isRewardAdWatched) {
                        if (state.dailyTripsCount < state.maxDailyTrips) {
                            set({
                                dailyTripsCount: state.dailyTripsCount + 1,
                                isTracking: true,
                                isRewardAdWatched: false
                            });
                        }
                    } else {
                        return;
                    }
                } else {
                    set({ isTracking });
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
                // Limit to 3 for free users (Profitability Check)
                if (!state.isPremium && state.favorites.length >= 3) {
                    return false; // Limit reached
                }
                // Check if already exists
                if (state.favorites.some(fav => fav.name === destination.name)) {
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

                if (favorite && !state.isPremium) {
                    const now = Date.now();
                    const createdAt = favorite.createdAt || 0;
                    const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);

                    if (daysSinceCreation < 30) {
                        // Locked
                        // We can't return a value here easily without changing interface, 
                        // but we can just NOT remove it. 
                        // The UI should check this before calling or handle the state update.
                        // Ideally we throw or return false, but let's just ignore for now 
                        // and handle the check in UI/Component for better UX feedback.
                        // actually, let's just not remove it.
                        console.warn('Favorite is locked');
                        return;
                    }
                }

                set({ favorites: state.favorites.filter(fav => fav.name !== name) });
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
