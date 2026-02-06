import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { DestinationSearch } from './DestinationSearch';

interface FavoritesPanelProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (destination: any) => void;
}

export const FavoritesPanel: React.FC<FavoritesPanelProps> = ({ visible, onClose, onSelect }) => {
    const favorites = useAppStore((state) => state.favorites);
    const removeFavorite = useAppStore((state) => state.removeFavorite);
    const addFavorite = useAppStore((state) => state.addFavorite);
    const isPremium = useAppStore((state) => state.isPremium);

    const [isAdding, setIsAdding] = useState(false);

    const maxFavs = isPremium ? 30 : 3;
    const canAdd = favorites.length < maxFavs;

    const handleDelete = (name: string) => {
        const result = removeFavorite(name);
        if (!result.success) {
            alert(`No puedes eliminar este favorito aún. Falta(n) ${result.remainingDays} día(s) para poder cambiarlo.`);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.panelContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{isAdding ? 'Añadir Favorito' : 'Mis Favoritos'}</Text>
                        <TouchableOpacity
                            onPress={() => isAdding ? setIsAdding(false) : onClose()}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>{isAdding ? '←' : '✕'}</Text>
                        </TouchableOpacity>
                    </View>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.flexContent}
                    >
                        {isAdding ? (
                            <View style={styles.searchContainer}>
                                <Text style={styles.searchInstructions}>
                                    Busca una dirección para guardarla en tu lista.
                                </Text>
                                <DestinationSearch
                                    autoSave={true}
                                    onSave={() => setIsAdding(false)}
                                />
                            </View>
                        ) : (
                            <ScrollView style={styles.content}>
                                {favorites.length === 0 ? (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyText}>No tienes favoritos guardados.</Text>
                                        <Text style={styles.emptySubtext}>Añade tus destinos frecuentes para viajar rápido.</Text>
                                    </View>
                                ) : (
                                    favorites.map((fav, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.favoriteItem}
                                            onPress={() => onSelect(fav)}
                                        >
                                            <View style={styles.iconContainer}>
                                                <Text style={styles.icon}>📍</Text>
                                            </View>
                                            <View style={styles.infoContainer}>
                                                <View style={styles.clickableArea}>
                                                    <Text style={styles.name}>{fav.name}</Text>
                                                    <Text style={styles.coords}>
                                                        {fav.location.latitude.toFixed(4)}, {fav.location.longitude.toFixed(4)}
                                                    </Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => handleDelete(fav.name)}
                                                style={styles.deleteButton}
                                            >
                                                <Text style={styles.deleteIcon}>🗑️</Text>
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    ))
                                )}

                                {canAdd && (
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={() => setIsAdding(true)}
                                    >
                                        <Text style={styles.addButtonIcon}>➕</Text>
                                        <Text style={styles.addButtonText}>Añadir nuevo destino</Text>
                                    </TouchableOpacity>
                                )}

                                {!canAdd && !isPremium && (
                                    <Text style={styles.limitNote}>
                                        Has alcanzado el límite de 3 favoritos gratuitos.
                                    </Text>
                                )}
                            </ScrollView>
                        )}
                    </KeyboardAvoidingView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    panelContainer: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: RADIUS.l,
        borderTopRightRadius: RADIUS.l,
        height: '75%', // Increased to handle search keyboard and list
        ...SHADOWS.default,
    },
    flexContent: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    closeButton: {
        padding: SPACING.s,
    },
    closeButtonText: {
        fontSize: 20,
        color: '#999',
    },
    content: {
        flex: 1,
        padding: SPACING.m,
    },
    searchContainer: {
        flex: 1,
        padding: SPACING.m,
    },
    searchInstructions: {
        fontSize: 14,
        color: '#666',
        marginBottom: SPACING.m,
        textAlign: 'center',
    },
    favoriteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.round,
        backgroundColor: '#F0F8FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    icon: {
        fontSize: 20,
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text,
        marginBottom: 2,
    },
    coords: {
        fontSize: 12,
        color: '#999',
    },
    deleteButton: {
        padding: SPACING.s,
        marginLeft: SPACING.s,
    },
    deleteIcon: {
        fontSize: 18,
        opacity: 0.6,
    },
    clickableArea: {
        flex: 1,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        borderRadius: RADIUS.m,
        padding: SPACING.m,
        marginTop: SPACING.l,
        marginBottom: SPACING.xl,
    },
    addButtonIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    addButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    limitNote: {
        textAlign: 'center',
        color: '#999',
        fontSize: 12,
        marginTop: SPACING.m,
        marginBottom: SPACING.xl,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: SPACING.xl,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginBottom: SPACING.s,
    },
    emptySubtext: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
});
