import 'dotenv/config';

export default {
    expo: {
        name: "ProxiAlert",
        slug: "despiertame", // Keep old slug for EAS compatibility
        version: "1.1.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        splash: {
            image: "./assets/splash.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        assetBundlePatterns: [
            "**/*"
        ],
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.antigravity.proxialert",
            infoPlist: {
                NSLocationWhenInUseUsageDescription: "Necesitamos tu ubicación para avisarte cuando llegues a tu destino.",
                NSLocationAlwaysUsageDescription: "Necesitamos tu ubicación para avisarte cuando llegues a tu destino incluso si la app está en segundo plano.",
                UIBackgroundModes: ["location", "audio"]
            }
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            package: "com.antigravity.proxialert",
            versionCode: 2,
            googleServicesFile: "./google-services.json",
            permissions: [
                "ACCESS_COARSE_LOCATION",
                "ACCESS_FINE_LOCATION",
                "ACCESS_BACKGROUND_LOCATION",
                "FOREGROUND_SERVICE",
                "FOREGROUND_SERVICE_LOCATION",
                "VIBRATE"
            ],
            config: {
                googleMaps: {
                    apiKey: process.env.GOOGLE_MAPS_API_KEY
                }
            }
        },
        plugins: [
            "@react-native-firebase/app",
            [
                "expo-location",
                {
                    "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location."
                }
            ],
            [
                "react-native-google-mobile-ads",
                {
                    "androidAppId": "ca-app-pub-5025716288565530~9228828128",
                    "iosAppId": "ca-app-pub-5025716288565530~3843891170"
                }
            ]
        ],
        web: {
            favicon: "./assets/favicon.png"
        },
        extra: {
            googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'MISSING_MAPS_KEY',
            googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || 'MISSING_PLACES_KEY',
            eas: {
                projectId: "3ddc29e1-e6bb-4c30-b74d-1a82bd2f069c"
            }
        }
    }
};
