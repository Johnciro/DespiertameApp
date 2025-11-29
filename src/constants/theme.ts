export const COLORS = {
    primary: '#4A90E2', // Azul transporte
    secondary: '#50E3C2', // Verde agua
    accent: '#FF5A5F', // Rojo alerta
    background: '#F5F7FA',
    text: '#1a1a1a', // Texto más oscuro para mejor contraste
    textLight: '#666666', // Texto secundario más oscuro
    white: '#FFFFFF',
    card: '#FFFFFF',
    shadow: '#000000',
    success: '#4A90E2', // Azul para botón iniciar
    warning: '#F1C40F',
    danger: '#E74C3C',
};

export const SPACING = {
    xs: 6,  // Aumentado para mejor espaciado
    s: 12,  // Aumentado
    m: 20,  // Aumentado
    l: 28,  // Aumentado
    xl: 40, // Aumentado
};

export const RADIUS = {
    s: 6,
    m: 12,
    l: 20,
    xl: 28,
    round: 9999,
};

// Tamaños de fuente accesibles
export const FONT_SIZES = {
    small: 14,
    medium: 16,
    large: 18,
    xlarge: 22,
    xxlarge: 26,
    huge: 32,
};

export const SHADOWS = {
    default: {
        shadowColor: COLORS.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    floating: {
        shadowColor: COLORS.shadow,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
    },
};
