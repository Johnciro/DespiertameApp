import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Production Ad Unit IDs
const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-5025716288565530/2407602684';

export const AdBanner = () => {
    const [adLoaded, setAdLoaded] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    return (
        <View style={styles.container}>
            {errorMessage ? (
                // Show placeholder when ad fails
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>📢 Publicidad</Text>
                    {__DEV__ && (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    )}
                </View>
            ) : (
                <BannerAd
                    unitId={adUnitId}
                    size={BannerAdSize.BANNER}
                    requestOptions={{
                        requestNonPersonalizedAdsOnly: true,
                    }}
                    onAdLoaded={() => {
                        console.log('✅ [AD] Banner loaded successfully');
                        setAdLoaded(true);
                    }}
                    onAdFailedToLoad={(error) => {
                        console.error('❌ [AD] Banner failed to load:', error);
                        setErrorMessage(`Error: ${error.message || 'Unknown'}`);

                        // Retry after 10 seconds
                        setTimeout(() => {
                            console.log('🔄 [AD] Retrying banner load...');
                            setErrorMessage(null);
                        }, 10000);
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        overflow: 'hidden',
        minHeight: 50, // Reserve space for banner
    },
    placeholder: {
        width: '100%',
        height: 50,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#BDBDBD',
        borderStyle: 'dashed',
    },
    placeholderText: {
        color: '#757575',
        fontWeight: 'bold',
        fontSize: 12,
    },
    errorText: {
        color: '#F44336',
        fontSize: 8,
        marginTop: 2,
    },
});
