import { useState, useEffect } from 'react';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-5025716288565530/2873123656';

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
});

export const useInterstitialAd = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            setIsLoaded(true);
        });

        const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            setIsLoaded(false);
            interstitial.load(); // Load next ad automatically
        });

        const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
            console.error('Interstitial Ad Error:', error);
            setIsLoaded(false);
            // Retry loading after delay
            setTimeout(() => {
                interstitial.load();
            }, 5000);
        });

        // Initial load
        interstitial.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeClosed();
            unsubscribeError();
        };
    }, []);

    const showInterstitial = () => {
        if (isLoaded) {
            interstitial.show();
        } else {
            console.log('Interstitial not ready yet');
            interstitial.load(); // Ensure it's loading if attempted to show
        }
    };

    return { isLoaded, showInterstitial };
};
