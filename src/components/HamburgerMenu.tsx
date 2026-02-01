import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

interface HamburgerMenuProps {
    onOpenSetup: () => void;
    onOpenFavorites: () => void;
    onToggleSaveFavorite?: () => void;
    showSaveButton: boolean;
    isFavorite: boolean;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
    onOpenSetup,
    onOpenFavorites,
    onToggleSaveFavorite,
    showSaveButton,
    isFavorite
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleMenuAction = (action: () => void) => {
        setIsOpen(false);
        setTimeout(action, 300); // Delay to allow menu to close smoothly
    };

    return (
        <>
            {/* Hamburger Button */}
            <TouchableOpacity
                style={styles.hamburgerButton}
                onPress={() => setIsOpen(true)}
            >
                <View style={styles.hamburgerLine} />
                <View style={styles.hamburgerLine} />
                <View style={styles.hamburgerLine} />
            </TouchableOpacity>

            {/* Menu Modal */}
            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <View style={styles.menuContainer}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => handleMenuAction(onOpenSetup)}
                        >
                            <Text style={styles.menuIcon}>⚙️</Text>
                            <Text style={styles.menuText}>Configuración</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => handleMenuAction(onOpenFavorites)}
                        >
                            <Text style={styles.menuIcon}>⭐</Text>
                            <Text style={styles.menuText}>Favoritos</Text>
                        </TouchableOpacity>

                        {showSaveButton && onToggleSaveFavorite && (
                            <>
                                <View style={styles.divider} />
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => handleMenuAction(onToggleSaveFavorite)}
                                >
                                    <Text style={styles.menuIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
                                    <Text style={styles.menuText}>
                                        {isFavorite ? 'Guardado' : 'Guardar Favorito'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    hamburgerButton: {
        position: 'absolute',
        top: 10, // Same as search bar
        right: SPACING.m,
        width: 44, // Standard touch target
        height: 44, // Match search bar height
        borderRadius: RADIUS.round,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20, // Above search results
        ...SHADOWS.floating,
    },
    hamburgerLine: {
        width: 20,
        height: 3,
        backgroundColor: COLORS.text,
        marginVertical: 2,
        borderRadius: 2,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 60, // Position below hamburger button (10 + 44 + 6)
        paddingRight: SPACING.m,
    },
    menuContainer: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.m,
        minWidth: 200,
        ...SHADOWS.floating,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
    },
    menuIcon: {
        fontSize: 24,
        marginRight: SPACING.m,
    },
    menuText: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },
});
