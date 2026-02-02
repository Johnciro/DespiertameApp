import Purchases, { PurchasesPackage, PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';

// REVENUECAT API KEYS (TO BE REPLACED BY USER)
const API_KEYS = {
    // google: 'goog_...', // Android API Key from RevenueCat
    // ios: 'appl_...',    // iOS API Key from RevenueCat (Future)
    google: 'test_yaLYMBktjFUAxkOlcqRjauzMcSy',
};

export interface Product {
    id: string; // SKU (e.g., 'premium_monthly')
    title: string;
    price: string;
    description: string;
    rcPackage: PurchasesPackage; // Reference to RevenueCat package
}

export const PaymentService = {

    initialize: async () => {
        try {
            if (Platform.OS === 'android') {
                // Use a placeholder or environment variable. 
                // IMPORTANT: The user must provide this key.
                // For now, we wrap in try/catch to avoid crash if key is invalid, 
                // but ideally we check if key exists.
                if (API_KEYS.google !== 'goog_placeholder_key') {
                    await Purchases.configure({ apiKey: API_KEYS.google });
                }
            } else if (Platform.OS === 'ios') {
                // await Purchases.configure({ apiKey: API_KEYS.ios });
            }
            console.log('✅ [RevenueCat] Initialized');
        } catch (error) {
            console.error('❌ [RevenueCat] Init Error:', error);
        }
    },

    getOfferings: async (): Promise<Product[]> => {
        try {
            if (API_KEYS.google === 'goog_placeholder_key') {
                console.warn('⚠️ [RevenueCat] No API Key provided. Returning mocks.');
                return MOCK_PRODUCTS;
            }

            const offerings = await Purchases.getOfferings();

            if (offerings.current && offerings.current.availablePackages.length !== 0) {
                return offerings.current.availablePackages.map((pkg) => ({
                    id: pkg.product.identifier,
                    title: pkg.product.title,
                    price: pkg.product.priceString,
                    description: pkg.product.description,
                    rcPackage: pkg,
                }));
            }
            return [];
        } catch (error) {
            console.error('❌ [RevenueCat] Get Offerings Error:', error);
            return [];
        }
    },

    purchasePackage: async (rcPackage: PurchasesPackage): Promise<boolean> => {
        try {
            const { customerInfo } = await Purchases.purchasePackage(rcPackage);
            if (typeof customerInfo.entitlements.active['premium'] !== 'undefined') {
                return true; // Unlock Premium
            }
        } catch (error: any) {
            if (!error.userCancelled) {
                console.error('❌ [RevenueCat] Purchase Error:', error);
            }
        }
        return false;
    },

    restorePurchases: async (): Promise<boolean> => {
        try {
            const customerInfo = await Purchases.restorePurchases();
            if (typeof customerInfo.entitlements.active['premium'] !== 'undefined') {
                return true;
            }
        } catch (error) {
            console.error('❌ [RevenueCat] Restore Error:', error);
        }
        return false;
    },

    // Check status on app launch
    checkSubscriptionStatus: async (): Promise<boolean> => {
        try {
            if (API_KEYS.google === 'goog_placeholder_key') return false;

            const customerInfo = await Purchases.getCustomerInfo();
            return typeof customerInfo.entitlements.active['premium'] !== 'undefined';
        } catch (error) {
            // Error fetching status
            return false;
        }
    }
};

// Fallback Mock (until user puts API Key)
const MOCK_PRODUCTS: Product[] = [
    {
        id: 'premium_monthly',
        title: 'Premium Mensual (Mock)',
        price: '$4.99',
        description: 'Favoritos ilimitados y sin anuncios.',
        rcPackage: {} as any
    },
    {
        id: 'premium_yearly',
        title: 'Premium Anual (Mock)',
        price: '$39.99',
        description: 'Ahorra $20. Descripción mock.',
        rcPackage: {} as any
    }
];
