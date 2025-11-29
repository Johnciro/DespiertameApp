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
            maxDailyTrips: 200, // Límite aumentado para pruebas
            lastResetDate: new Date().toDateString(),
            isRewardAdWatched: false,

            setDestination: (destination) => set({ destination: destination ? { ...destination } : null }),
            setCurrentLocation: (location) => set({ currentLocation: location }),
            setAlertRadius: (radius) => set({ alertRadius: radius }),

            setIsTracking: (isTracking) => {
                const state = get();
                // Si activamos tracking y NO es premium
                if (isTracking && !state.isTracking && !state.isPremium) {
                    const today = new Date().toDateString();

                    // Reset diario
                    if (today !== state.lastResetDate) {
                        set({
                            dailyTripsCount: 1,
                            lastResetDate: today,
                            isTracking: true,
                            isRewardAdWatched: false
                        });
                        return;
                    }

                    // Primer viaje del día es GRATIS (dailyTripsCount es 0 antes de empezar)
                    if (state.dailyTripsCount === 0) {
                        set({ dailyTripsCount: 1, isTracking: true });
                        return;
                    }

                    // Siguientes viajes requieren ver video
                    if (state.isRewardAdWatched) {
                        if (state.dailyTripsCount < state.maxDailyTrips) {
                            set({
                                dailyTripsCount: state.dailyTripsCount + 1,
                                isTracking: true,
                                isRewardAdWatched: false // Consumir el video visto
                            });
                        }
                    } else {
                        // No ha visto el video (esto debería prevenirse en UI)
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
            }
        }),
        {
            name: 'despiertame-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                destination: state.destination,
                alertRadius: state.alertRadius,
                isTracking: state.isTracking,
                isAlarmActive: state.isAlarmActive,
                isPremium: state.isPremium,
                dailyTripsCount: state.dailyTripsCount,
                lastResetDate: state.lastResetDate,
            }),
        }
    )
);
