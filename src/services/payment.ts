export interface Product {
    id: string;
    title: string;
    price: string;
    description: string;
}

export const PRODUCTS: Product[] = [
    {
        id: 'premium_monthly',
        title: 'Premium Mensual',
        price: '$4.99',
        description: 'Favoritos ilimitados y sin anuncios.'
    },
    {
        id: 'premium_yearly',
        title: 'Premium Anual',
        price: '$39.99',
        description: 'Ahorra $20. Todo lo incluido en mensual.'
    }
];

export const PaymentService = {
    // Mock purchase function
    purchaseProduct: async (productId: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate 90% success rate
                const success = Math.random() > 0.1;
                resolve(success);
            }, 1500);
        });
    },

    // Mock restore function
    restorePurchases: async (): Promise<boolean> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, 1000);
        });
    }
};
